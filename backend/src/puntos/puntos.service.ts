import { HttpError } from '../middleware/errors';
import * as model from './puntos.model';

export const listarTipos = model.listarTipos;
export const listar = model.listar;

export async function obtener(id: number) {
  const punto = await model.obtener(id);
  if (!punto) throw new HttpError(404, 'Punto no encontrado');
  return punto;
}

export async function crear(datos: model.PuntoDatos, usuarioId: number) {
  const id = await model.crear(datos, usuarioId);
  return obtener(id);
}

/** Solo el usuario que creó el punto puede modificarlo o eliminarlo. */
async function obtenerPropio(id: number, usuarioId: number) {
  const punto = await obtener(id);
  if (punto.usuario_creador_id !== usuarioId) {
    throw new HttpError(403, 'Solo quien creó el punto puede modificarlo o eliminarlo');
  }
  return punto;
}

export async function actualizar(id: number, cambios: Partial<model.PuntoDatos>, usuarioId: number) {
  const actual = await obtenerPropio(id, usuarioId);
  const datos: model.PuntoDatos = {
    nombre: cambios.nombre ?? actual.nombre,
    tipo_id: cambios.tipo_id ?? actual.tipo_id,
    lat: cambios.lat ?? actual.lat,
    lng: cambios.lng ?? actual.lng,
    superficie: cambios.superficie ?? actual.superficie,
    tiene_sombra: cambios.tiene_sombra ?? actual.tiene_sombra,
  };
  await model.actualizar(id, datos);
  return obtener(id);
}

export async function eliminar(id: number, usuarioId: number) {
  await obtenerPropio(id, usuarioId);
  await model.eliminar(id);
}
