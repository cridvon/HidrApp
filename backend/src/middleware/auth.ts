import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { HttpError } from './errors';

export interface AuthUser {
  id: number;
  email: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

/** Exige un token JWT válido en el header Authorization: Bearer <token>. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Token requerido');
  }
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as jwt.JwtPayload;
    req.user = { id: Number(payload.sub), email: String(payload.email) };
  } catch {
    throw new HttpError(401, 'Token inválido o vencido');
  }
  next();
}

/** Devuelve el usuario autenticado (solo usar detrás de requireAuth). */
export function usuarioActual(req: Request): AuthUser {
  if (!req.user) throw new HttpError(401, 'Token requerido');
  return req.user;
}
