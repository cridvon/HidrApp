import type { Request, Response } from 'express';
import { z } from 'zod';
import { usuarioActual } from '../middleware/auth';
import * as service from './reportes.service';

const idSchema = z.coerce.number().int().positive();

const reporteSchema = z.object({
  estado: z.enum(['activo', 'roto']),
  comentario: z.string().trim().max(500).optional(),
});

export async function listar(req: Request, res: Response) {
  res.json(await service.listar(idSchema.parse(req.params.id)));
}

export async function crear(req: Request, res: Response) {
  const puntoId = idSchema.parse(req.params.id);
  const { estado, comentario } = reporteSchema.parse(req.body);
  const reporte = await service.reportar(puntoId, usuarioActual(req).id, estado, comentario || null);
  res.status(201).json(reporte);
}
