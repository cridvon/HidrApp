import { pool, withTransaction } from '../db';
import { HttpError } from '../middleware/errors';
import * as model from './reportes.model';

export async function listar(puntoId: number) {
  if (!(await model.existePunto(puntoId, pool))) {
    throw new HttpError(404, 'Punto no encontrado');
  }
  return model.listarPorPunto(puntoId);
}

/**
 * Registra un reporte y actualiza el estado vigente del punto.
 * Ambas operaciones van en una transacción y el punto se bloquea (FOR UPDATE)
 * para que dos reportes simultáneos no dejen un estado inconsistente.
 */
export async function reportar(
  puntoId: number,
  usuarioId: number,
  estado: 'activo' | 'roto',
  comentario: string | null,
) {
  return withTransaction(async (client) => {
    if (!(await model.existePunto(puntoId, client, true))) {
      throw new HttpError(404, 'Punto no encontrado');
    }
    const id = await model.insertar(client, puntoId, usuarioId, estado, comentario);
    await model.actualizarEstadoPunto(client, puntoId, estado);
    return model.obtener(id, client);
  });
}
