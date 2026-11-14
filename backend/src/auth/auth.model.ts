import { query } from '../db';

export interface UsuarioRow {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  fecha_registro: Date;
}

export async function buscarPorEmail(email: string): Promise<UsuarioRow | undefined> {
  const rows = await query<UsuarioRow>('SELECT * FROM usuarios WHERE email = $1', [email]);
  return rows[0];
}

export async function buscarPorId(id: number): Promise<UsuarioRow | undefined> {
  const rows = await query<UsuarioRow>('SELECT * FROM usuarios WHERE id = $1', [id]);
  return rows[0];
}

export async function crear(nombre: string, email: string, passwordHash: string): Promise<UsuarioRow> {
  const rows = await query<UsuarioRow>(
    'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [nombre, email, passwordHash],
  );
  return rows[0];
}
