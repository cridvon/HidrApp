import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

/** Error con código HTTP, pensado para respuestas controladas de la API. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: err.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
    });
  }

  const code = (err as { code?: string; type?: string }).code;
  const type = (err as { type?: string }).type;

  if (type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no es un JSON válido' });
  }
  // Códigos de error de PostgreSQL
  if (code === '23505') return res.status(409).json({ error: 'El registro ya existe' });
  if (code === '23503') return res.status(400).json({ error: 'Referencia a un registro inexistente' });

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}
