import { query, type Queryable } from '../db';

export interface ReporteRow {
  id: number;
  punto_id: number;
  usuario_id: number;
  usuario: string;
  estado_reportado: 'activo' | 'roto';
  comentario: string | null;
  fecha_reporte: Date;
}

const SELECT_REPORTE = `
  SELECT r.id, r.punto_id, r.usuario_id, u.nombre AS usuario,
         r.estado_reportado, r.comentario, r.fecha_reporte
  FROM reportes_estado r
  JOIN usuarios u ON u.id = r.usuario_id`;

export async function existePunto(id: number, db: Queryable, bloquear = false): Promise<boolean> {
  const rows = await query<{ id: number }>(
    `SELECT id FROM puntos_interes WHERE id = $1${bloquear ? ' FOR UPDATE' : ''}`,
    [id],
    db,
  );
  return rows.length > 0;
}

export async function listarPorPunto(puntoId: number): Promise<ReporteRow[]> {
  return query<ReporteRow>(
    `${SELECT_REPORTE} WHERE r.punto_id = $1 ORDER BY r.fecha_reporte DESC, r.id DESC LIMIT 50`,
    [puntoId],
  );
}

export async function insertar(
  db: Queryable,
  puntoId: number,
  usuarioId: number,
  estado: string,
  comentario: string | null,
): Promise<number> {
  const rows = await query<{ id: number }>(
    `INSERT INTO reportes_estado (punto_id, usuario_id, estado_reportado, comentario)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [puntoId, usuarioId, estado, comentario],
    db,
  );
  return rows[0].id;
}

export async function obtener(id: number, db: Queryable): Promise<ReporteRow> {
  const rows = await query<ReporteRow>(`${SELECT_REPORTE} WHERE r.id = $1`, [id], db);
  return rows[0];
}

export async function actualizarEstadoPunto(db: Queryable, puntoId: number, estado: string): Promise<void> {
  await query('UPDATE puntos_interes SET estado_actual = $1 WHERE id = $2', [estado, puntoId], db);
}
