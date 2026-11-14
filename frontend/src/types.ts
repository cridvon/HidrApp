export type Estado = 'activo' | 'roto';
export type Superficie = 'asfalto' | 'cesped' | 'tierra';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface Tipo {
  id: number;
  nombre: string;
  icono: string | null;
}

export interface Punto {
  id: number;
  nombre: string;
  tipo_id: number;
  tipo: string;
  lat: number;
  lng: number;
  superficie: Superficie;
  tiene_sombra: boolean;
  estado_actual: Estado;
  usuario_creador_id: number;
  fecha_creacion: string;
}

export interface Reporte {
  id: number;
  punto_id: number;
  usuario_id: number;
  usuario: string;
  estado_reportado: Estado;
  comentario: string | null;
  fecha_reporte: string;
}

export interface NuevoPunto {
  nombre: string;
  tipo_id: number;
  lat: number;
  lng: number;
  superficie: Superficie;
  tiene_sombra: boolean;
}

export interface Sesion {
  usuario: Usuario;
  token: string;
}
