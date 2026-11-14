import type { Estado, Superficie } from '../types';

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  activo: 'Funciona',
  roto: 'Fuera de servicio',
};

export const ETIQUETA_SUPERFICIE: Record<Superficie, string> = {
  asfalto: 'Asfalto',
  cesped: 'Césped',
  tierra: 'Tierra',
};

export function emojiDeTipo(tipo: string): string {
  const nombre = tipo.toLowerCase();
  if (nombre.includes('bebedero')) return '💧';
  if (nombre.includes('baño')) return '🚻';
  if (nombre.includes('sombra')) return '🌳';
  return '📍';
}

export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}
