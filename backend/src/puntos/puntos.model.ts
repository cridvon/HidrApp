import { query } from '../db';

export interface PuntoRow {
  id: number;
  nombre: string;
  tipo_id: number;
  tipo: string;
  lat: number;
  lng: number;
  superficie: 'asfalto' | 'cesped' | 'tierra';
  tiene_sombra: boolean;
  estado_actual: 'activo' | 'roto';
  usuario_creador_id: number;
  fecha_creacion: Date;
}

export interface TipoRow {
  id: number;
  nombre: string;
  icono: string | null;
}

export interface PuntoDatos {
  nombre: string;
  tipo_id: number;
  lat: number;
  lng: number;
  superficie: PuntoRow['superficie'];
  tiene_sombra: boolean;
}

// La ubicación se guarda como geography(Point, 4326); se devuelve como lat/lng.
const SELECT_PUNTO = `
  SELECT p.id, p.nombre, p.tipo_id, t.nombre AS tipo,
         ST_Y(p.ubicacion::geometry) AS lat, ST_X(p.ubicacion::geometry) AS lng,
         p.superficie, p.tiene_sombra, p.estado_actual,
         p.usuario_creador_id, p.fecha_creacion
  FROM puntos_interes p
  JOIN tipos_punto t ON t.id = p.tipo_id`;

export async function listarTipos(): Promise<TipoRow[]> {
  return query<TipoRow>('SELECT id, nombre, icono FROM tipos_punto ORDER BY id');
}

export async function listar(filtros: { tipoId?: number; estado?: string }): Promise<PuntoRow[]> {
  const condiciones: string[] = [];
  const params: unknown[] = [];
  if (filtros.tipoId !== undefined) {
    params.push(filtros.tipoId);
    condiciones.push(`p.tipo_id = $${params.length}`);
  }
  if (filtros.estado !== undefined) {
    params.push(filtros.estado);
    condiciones.push(`p.estado_actual = $${params.length}`);
  }
  const where = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : '';
  return query<PuntoRow>(`${SELECT_PUNTO}${where} ORDER BY p.id`, params);
}

export async function obtener(id: number): Promise<PuntoRow | undefined> {
  const rows = await query<PuntoRow>(`${SELECT_PUNTO} WHERE p.id = $1`, [id]);
  return rows[0];
}

export async function crear(datos: PuntoDatos, usuarioId: number): Promise<number> {
  const rows = await query<{ id: number }>(
    `INSERT INTO puntos_interes (nombre, tipo_id, ubicacion, superficie, tiene_sombra, usuario_creador_id)
     VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5, $6, $7)
     RETURNING id`,
    [datos.nombre, datos.tipo_id, datos.lng, datos.lat, datos.superficie, datos.tiene_sombra, usuarioId],
  );
  return rows[0].id;
}

export async function actualizar(id: number, datos: PuntoDatos): Promise<void> {
  await query(
    `UPDATE puntos_interes
     SET nombre = $1, tipo_id = $2, ubicacion = ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography,
         superficie = $5, tiene_sombra = $6
     WHERE id = $7`,
    [datos.nombre, datos.tipo_id, datos.lng, datos.lat, datos.superficie, datos.tiene_sombra, id],
  );
}

export async function eliminar(id: number): Promise<void> {
  // reportes_estado y notificaciones se eliminan en cascada (ver schema.sql)
  await query('DELETE FROM puntos_interes WHERE id = $1', [id]);
}
