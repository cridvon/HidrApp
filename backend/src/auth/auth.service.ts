import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { HttpError } from '../middleware/errors';
import * as model from './auth.model';

function aPublico(u: model.UsuarioRow) {
  return { id: u.id, nombre: u.nombre, email: u.email, fecha_registro: u.fecha_registro };
}

function firmarToken(u: model.UsuarioRow): string {
  return jwt.sign({ email: u.email }, config.jwtSecret, {
    subject: String(u.id),
    expiresIn: config.jwtExpiresIn,
  });
}

export async function registrar(nombre: string, email: string, password: string) {
  // El email es UNIQUE en la base: si ya existe, el errorHandler responde 409.
  const hash = await bcrypt.hash(password, 10);
  const usuario = await model.crear(nombre, email, hash);
  return { usuario: aPublico(usuario), token: firmarToken(usuario) };
}

export async function iniciarSesion(email: string, password: string) {
  const usuario = await model.buscarPorEmail(email);
  const valido = usuario ? await bcrypt.compare(password, usuario.password_hash) : false;
  if (!usuario || !valido) {
    throw new HttpError(401, 'Credenciales inválidas');
  }
  return { usuario: aPublico(usuario), token: firmarToken(usuario) };
}

export async function perfil(id: number) {
  const usuario = await model.buscarPorId(id);
  if (!usuario) throw new HttpError(404, 'Usuario no encontrado');
  return aPublico(usuario);
}
