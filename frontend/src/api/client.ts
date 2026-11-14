import type { Estado, NuevoPunto, Punto, Reporte, Sesion, Tipo, Usuario } from '../types';

const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'hidrapp_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export interface DetalleError {
  campo: string;
  mensaje: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detalles: DetalleError[] = [],
  ) {
    super(message);
  }
}

/** Texto listo para mostrar al usuario a partir de cualquier error. */
export function mensajeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.detalles.length > 0) {
      return error.detalles.map((d) => d.mensaje).join('. ');
    }
    return error.message;
  }
  return 'No se pudo conectar con el servidor. Probá de nuevo en un momento.';
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? 'Error inesperado', data?.detalles ?? []);
  }
  return data as T;
}

export const api = {
  registro: (nombre: string, email: string, password: string) =>
    request<Sesion>('POST', '/auth/registro', { nombre, email, password }),
  login: (email: string, password: string) => request<Sesion>('POST', '/auth/login', { email, password }),
  me: () => request<Usuario>('GET', '/auth/me'),

  tipos: () => request<Tipo[]>('GET', '/tipos'),
  puntos: (filtros: { tipoId?: number; estado?: Estado } = {}) => {
    const params = new URLSearchParams();
    if (filtros.tipoId) params.set('tipo_id', String(filtros.tipoId));
    if (filtros.estado) params.set('estado', filtros.estado);
    const qs = params.toString();
    return request<Punto[]>('GET', `/puntos${qs ? `?${qs}` : ''}`);
  },
  punto: (id: number) => request<Punto>('GET', `/puntos/${id}`),
  crearPunto: (datos: NuevoPunto) => request<Punto>('POST', '/puntos', datos),
  eliminarPunto: (id: number) => request<void>('DELETE', `/puntos/${id}`),

  reportes: (puntoId: number) => request<Reporte[]>('GET', `/puntos/${puntoId}/reportes`),
  reportar: (puntoId: number, estado: Estado, comentario?: string) =>
    request<Reporte>('POST', `/puntos/${puntoId}/reportes`, { estado, comentario }),
};
