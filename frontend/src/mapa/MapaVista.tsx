import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { Punto } from '../types';
import { emojiDeTipo } from './etiquetas';

// Punto de partida si el navegador no comparte la ubicación (Buenos Aires).
const CENTRO_POR_DEFECTO: [number, number] = [-34.6037, -58.3816];

function iconoPunto(punto: Punto, seleccionado: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="pin pin-${punto.estado_actual}${seleccionado ? ' pin-sel' : ''}">${emojiDeTipo(punto.tipo)}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

const ICONO_BORRADOR = L.divIcon({
  className: '',
  html: '<div class="pin pin-borrador">＋</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function CapturaClicks({ activo, onClick }: { activo: boolean; onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (activo) onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recentrar({ centro }: { centro: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (centro) map.setView(centro, 15);
  }, [centro, map]);
  return null;
}

interface Props {
  puntos: Punto[];
  seleccionadoId: number | null;
  borrador: { lat: number; lng: number } | null;
  modoAgregar: boolean;
  centro: [number, number] | null;
  onSeleccionar: (punto: Punto) => void;
  onElegirUbicacion: (lat: number, lng: number) => void;
}

export default function MapaVista({
  puntos,
  seleccionadoId,
  borrador,
  modoAgregar,
  centro,
  onSeleccionar,
  onElegirUbicacion,
}: Props) {
  return (
    <MapContainer
      center={CENTRO_POR_DEFECTO}
      zoom={12}
      className={`mapa${modoAgregar ? ' mapa-agregar' : ''}`}
      aria-label="Mapa de puntos de hidratación y servicios"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recentrar centro={centro} />
      <CapturaClicks activo={modoAgregar} onClick={onElegirUbicacion} />

      {puntos.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={iconoPunto(p, p.id === seleccionadoId)}
          title={p.nombre}
          eventHandlers={{ click: () => onSeleccionar(p) }}
        />
      ))}

      {borrador && <Marker position={[borrador.lat, borrador.lng]} icon={ICONO_BORRADOR} interactive={false} />}
    </MapContainer>
  );
}
