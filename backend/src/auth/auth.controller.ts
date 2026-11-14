import type { Request, Response } from 'express';
import { z } from 'zod';
import { usuarioActual } from '../middleware/auth';
import * as service from './auth.service';

const registroSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().trim().toLowerCase().email('Email inválido').max(150),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export async function registro(req: Request, res: Response) {
  const { nombre, email, password } = registroSchema.parse(req.body);
  res.status(201).json(await service.registrar(nombre, email, password));
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);
  res.json(await service.iniciarSesion(email, password));
}

export async function me(req: Request, res: Response) {
  res.json(await service.perfil(usuarioActual(req).id));
}
