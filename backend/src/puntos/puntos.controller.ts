import type { Request, Response } from 'express';
import { z } from 'zod';
import { usuarioActual } from '../middleware/auth';
import * as service from './puntos.service';

const idSchema = z.coerce.number().int().positive();

const puntoBase = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  tipo_id: z.number().int().positive(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  superficie: z.enum(['asfalto', 'cesped', 'tierra']),
});

const crearSchema = puntoBase.extend({ tiene_sombra: z.boolean().default(false) });

const actualizarSchema = puntoBase
  .extend({ tiene_sombra: z.boolean() })
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'Indicá al menos un campo para modificar');

const filtrosSchema = z.object({
  tipo_id: z.coerce.number().int().positive().optional(),
  estado: z.enum(['activo', 'roto']).optional(),
});

export async function tipos(_req: Request, res: Response) {
  res.json(await service.listarTipos());
}

export async function listar(req: Request, res: Response) {
  const filtros = filtrosSchema.parse(req.query);
  res.json(await service.listar({ tipoId: filtros.tipo_id, estado: filtros.estado }));
}

export async function obtener(req: Request, res: Response) {
  res.json(await service.obtener(idSchema.parse(req.params.id)));
}

export async function crear(req: Request, res: Response) {
  const datos = crearSchema.parse(req.body);
  res.status(201).json(await service.crear(datos, usuarioActual(req).id));
}

export async function actualizar(req: Request, res: Response) {
  const id = idSchema.parse(req.params.id);
  const cambios = actualizarSchema.parse(req.body);
  res.json(await service.actualizar(id, cambios, usuarioActual(req).id));
}

export async function eliminar(req: Request, res: Response) {
  await service.eliminar(idSchema.parse(req.params.id), usuarioActual(req).id);
  res.status(204).send();
}
