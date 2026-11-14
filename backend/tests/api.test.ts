/**
 * Pruebas de integración de la API contra una base PostgreSQL + PostGIS real.
 * Requieren la base creada con database/schema.sql.
 *
 *   TEST_DATABASE_URL=postgres://usuario:clave@localhost:5432/hidrapp_test npm test
 *
 * ATENCIÓN: al iniciar, estas pruebas VACÍAN las tablas usuarios, puntos_interes,
 * reportes_estado y notificaciones. Usar una base de pruebas, nunca la real.
 */
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? 'postgres://localhost:5432/hidrapp_test';
process.env.JWT_SECRET = 'secreto-solo-para-pruebas';

let server: Server;
let base: string;
let pool: typeof import('../src/db').pool;

before(async () => {
  const { app } = await import('../src/app');
  ({ pool } = await import('../src/db'));
  await pool.query('TRUNCATE notificaciones, reportes_estado, puntos_interes, usuarios RESTART IDENTITY CASCADE');
  await new Promise<void>((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  server.close();
  await pool.end();
});

async function api(method: string, path: string, body?: unknown, token?: string) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

// Estado compartido entre las pruebas (se ejecutan en orden)
let tokenAna = '';
let tokenLuis = '';
let puntoId = 0;

test('autenticación: registro, login y perfil', async () => {
  const reg = await api('POST', '/api/auth/registro', { nombre: 'Ana', email: 'Ana@Mail.com', password: 'secreto1' });
  assert.equal(reg.status, 201);
  assert.equal(reg.body.usuario.email, 'ana@mail.com');
  assert.equal(reg.body.usuario.password_hash, undefined, 'no debe exponer el hash');
  tokenAna = reg.body.token;

  const luis = await api('POST', '/api/auth/registro', { nombre: 'Luis', email: 'luis@mail.com', password: 'secreto2' });
  assert.equal(luis.status, 201);
  tokenLuis = luis.body.token;

  assert.equal((await api('POST', '/api/auth/registro', { nombre: 'Ana 2', email: 'ana@mail.com', password: 'secreto1' })).status, 409);
  assert.equal((await api('POST', '/api/auth/registro', { nombre: 'X', email: 'no-es-email', password: '123' })).status, 400);

  const login = await api('POST', '/api/auth/login', { email: 'ana@mail.com', password: 'secreto1' });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);
  assert.equal((await api('POST', '/api/auth/login', { email: 'ana@mail.com', password: 'incorrecta' })).status, 401);

  const me = await api('GET', '/api/auth/me', undefined, tokenAna);
  assert.equal(me.status, 200);
  assert.equal(me.body.nombre, 'Ana');
  assert.equal((await api('GET', '/api/auth/me')).status, 401);
  assert.equal((await api('GET', '/api/auth/me', undefined, 'token-falso')).status, 401);
});

test('puntos: alta con ubicación, validaciones y listado', async () => {
  const tipos = await api('GET', '/api/tipos');
  assert.equal(tipos.status, 200);
  assert.ok(tipos.body.length >= 3);

  const datos = { nombre: 'Bebedero Plaza', tipo_id: 1, lat: -33.335, lng: -60.2257, superficie: 'asfalto' };
  assert.equal((await api('POST', '/api/puntos', datos)).status, 401, 'requiere sesión');

  const creado = await api('POST', '/api/puntos', datos, tokenAna);
  assert.equal(creado.status, 201);
  assert.ok(Math.abs(creado.body.lat - -33.335) < 1e-6, 'lat se conserva');
  assert.ok(Math.abs(creado.body.lng - -60.2257) < 1e-6, 'lng se conserva');
  assert.equal(creado.body.estado_actual, 'activo');
  assert.equal(creado.body.tiene_sombra, false);
  assert.equal(creado.body.tipo, 'Bebedero');
  puntoId = creado.body.id;

  assert.equal((await api('POST', '/api/puntos', { ...datos, lat: 95 }, tokenAna)).status, 400, 'latitud fuera de rango');
  assert.equal((await api('POST', '/api/puntos', { ...datos, superficie: 'arena' }, tokenAna)).status, 400);
  assert.equal((await api('POST', '/api/puntos', { ...datos, tipo_id: 999 }, tokenAna)).status, 400, 'tipo inexistente');

  const lista = await api('GET', '/api/puntos');
  assert.equal(lista.status, 200);
  assert.equal(lista.body.length, 1);
  assert.equal((await api('GET', `/api/puntos/${puntoId}`)).body.nombre, 'Bebedero Plaza');
  assert.equal((await api('GET', '/api/puntos/9999')).status, 404);
});

test('reportes: cambian el estado vigente y guardan historial', async () => {
  const roto = await api('POST', `/api/puntos/${puntoId}/reportes`, { estado: 'roto', comentario: 'No sale agua' }, tokenLuis);
  assert.equal(roto.status, 201);
  assert.equal(roto.body.usuario, 'Luis');
  assert.equal((await api('GET', `/api/puntos/${puntoId}`)).body.estado_actual, 'roto');

  const filtrado = await api('GET', '/api/puntos?estado=roto');
  assert.equal(filtrado.body.length, 1);
  assert.equal((await api('GET', '/api/puntos?estado=activo')).body.length, 0);

  assert.equal((await api('POST', `/api/puntos/${puntoId}/reportes`, { estado: 'activo' }, tokenAna)).status, 201);
  assert.equal((await api('GET', `/api/puntos/${puntoId}`)).body.estado_actual, 'activo');

  const historial = await api('GET', `/api/puntos/${puntoId}/reportes`);
  assert.equal(historial.body.length, 2);
  assert.equal(historial.body[0].estado_reportado, 'activo', 'el más reciente primero');

  assert.equal((await api('POST', `/api/puntos/${puntoId}/reportes`, { estado: 'roto' })).status, 401);
  assert.equal((await api('POST', `/api/puntos/${puntoId}/reportes`, { estado: 'inventado' }, tokenAna)).status, 400);
  assert.equal((await api('POST', '/api/puntos/9999/reportes', { estado: 'roto' }, tokenAna)).status, 404);
});

test('reportes concurrentes: el estado final coincide con el último reporte', async () => {
  const resultados = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      api('POST', `/api/puntos/${puntoId}/reportes`, { estado: i % 2 === 0 ? 'roto' : 'activo' }, tokenLuis),
    ),
  );
  assert.ok(resultados.every((r) => r.status === 201));

  const ultimo = (await api('GET', `/api/puntos/${puntoId}/reportes`)).body[0];
  const punto = (await api('GET', `/api/puntos/${puntoId}`)).body;
  assert.equal(punto.estado_actual, ultimo.estado_reportado);
});

test('permisos: solo quien creó el punto puede modificarlo o borrarlo', async () => {
  assert.equal((await api('PUT', `/api/puntos/${puntoId}`, { nombre: 'Hackeado' }, tokenLuis)).status, 403);
  assert.equal((await api('DELETE', `/api/puntos/${puntoId}`, undefined, tokenLuis)).status, 403);

  const editado = await api('PUT', `/api/puntos/${puntoId}`, { nombre: 'Bebedero Plaza Central', tiene_sombra: true }, tokenAna);
  assert.equal(editado.status, 200);
  assert.equal(editado.body.nombre, 'Bebedero Plaza Central');
  assert.equal(editado.body.tiene_sombra, true);
  assert.ok(Math.abs(editado.body.lat - -33.335) < 1e-6, 'la ubicación no cambia si no se envía');
  assert.equal((await api('PUT', `/api/puntos/${puntoId}`, {}, tokenAna)).status, 400);

  assert.equal((await api('DELETE', `/api/puntos/${puntoId}`, undefined, tokenAna)).status, 204);
  assert.equal((await api('GET', `/api/puntos/${puntoId}`)).status, 404);
  const restantes = await pool.query('SELECT count(*)::int AS n FROM reportes_estado');
  assert.equal(restantes.rows[0].n, 0, 'los reportes se eliminan en cascada');
});
