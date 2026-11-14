import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, mensajeError, tokenStore } from './client';

function respuesta(status: number, cuerpo?: unknown) {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), { status });
}

describe('cliente de la API', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    localStorage.clear();
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('envía el token en el header Authorization cuando hay sesión', async () => {
    tokenStore.set('abc123');
    fetchMock.mockResolvedValue(respuesta(200, []));

    await api.puntos();

    const [, opciones] = fetchMock.mock.calls[0];
    expect(opciones.headers.Authorization).toBe('Bearer abc123');
  });

  it('no envía Authorization si no hay sesión', async () => {
    fetchMock.mockResolvedValue(respuesta(200, []));

    await api.tipos();

    const [, opciones] = fetchMock.mock.calls[0];
    expect(opciones.headers.Authorization).toBeUndefined();
  });

  it('arma la consulta con los filtros indicados', async () => {
    fetchMock.mockResolvedValue(respuesta(200, []));

    await api.puntos({ tipoId: 2, estado: 'roto' });

    expect(fetchMock.mock.calls[0][0]).toBe('/api/puntos?tipo_id=2&estado=roto');
  });

  it('convierte una respuesta de error en ApiError con el mensaje del servidor', async () => {
    fetchMock.mockResolvedValue(respuesta(401, { error: 'Credenciales inválidas' }));

    const error = await api.login('a@b.com', 'mala').catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    expect(mensajeError(error)).toBe('Credenciales inválidas');
  });

  it('muestra el detalle de validación cuando el servidor lo informa', async () => {
    fetchMock.mockResolvedValue(
      respuesta(400, { error: 'Datos inválidos', detalles: [{ campo: 'email', mensaje: 'Email inválido' }] }),
    );

    const error = await api.registro('Ana', 'x', '123456').catch((e) => e);

    expect(mensajeError(error)).toBe('Email inválido');
  });

  it('devuelve undefined ante un 204 (eliminación)', async () => {
    fetchMock.mockResolvedValue(respuesta(204));

    await expect(api.eliminarPunto(1)).resolves.toBeUndefined();
  });

  it('informa un mensaje amigable si no hay conexión', () => {
    expect(mensajeError(new TypeError('fetch failed'))).toContain('No se pudo conectar');
  });
});
