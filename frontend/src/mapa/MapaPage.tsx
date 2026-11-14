import { useCallback, useEffect, useState } from 'react';
import { api, mensajeError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { Estado, Punto, Tipo } from '../types';
import MapaVista from './MapaVista';
import PuntoForm from './PuntoForm';
import PuntoPanel from './PuntoPanel';

interface Props {
  onPedirLogin: () => void;
}

export default function MapaPage({ onPedirLogin }: Props) {
  const { usuario } = useAuth();
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [filtroTipo, setFiltroTipo] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState<Estado | ''>('');
  const [seleccionado, setSeleccionado] = useState<Punto | null>(null);
  const [modoAgregar, setModoAgregar] = useState(false);
  const [borrador, setBorrador] = useState<{ lat: number; lng: number } | null>(null);
  const [centro, setCentro] = useState<[number, number] | null>(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    api.tipos().then(setTipos).catch((err) => setError(mensajeError(err)));
  }, []);

  const cargarPuntos = useCallback(async () => {
    try {
      setError('');
      setPuntos(
        await api.puntos({
          tipoId: filtroTipo || undefined,
          estado: filtroEstado || undefined,
        }),
      );
    } catch (err) {
      setError(mensajeError(err));
    }
  }, [filtroTipo, filtroEstado]);

  useEffect(() => {
    cargarPuntos();
  }, [cargarPuntos]);

  function alternarAgregar() {
    if (!usuario) {
      onPedirLogin();
      return;
    }
    setSeleccionado(null);
    setBorrador(null);
    setModoAgregar((activo) => !activo);
  }

  function cancelarAlta() {
    setModoAgregar(false);
    setBorrador(null);
  }

  function irAMiUbicacion() {
    setAviso('');
    if (!navigator.geolocation) {
      setAviso('Tu navegador no permite obtener la ubicación.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCentro([pos.coords.latitude, pos.coords.longitude]),
      () => setAviso('No pudimos obtener tu ubicación. Revisá los permisos del navegador.'),
    );
  }

  function puntoGuardado(punto: Punto) {
    setPuntos((lista) => [...lista, punto]);
    cancelarAlta();
    setSeleccionado(punto);
  }

  function puntoActualizado(punto: Punto) {
    setPuntos((lista) => lista.map((p) => (p.id === punto.id ? punto : p)));
    setSeleccionado(punto);
  }

  function puntoEliminado(id: number) {
    setPuntos((lista) => lista.filter((p) => p.id !== id));
    setSeleccionado(null);
  }

  return (
    <div className="contenido">
      <section className="zona-mapa">
        <div className="barra">
          <label>
            Tipo
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(Number(e.target.value))}>
              <option value={0}>Todos</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Estado
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as Estado | '')}>
              <option value="">Todos</option>
              <option value="activo">Funciona</option>
              <option value="roto">Fuera de servicio</option>
            </select>
          </label>
          <button type="button" className="btn" onClick={irAMiUbicacion}>
            📍 Mi ubicación
          </button>
          <button type="button" className={`btn${modoAgregar ? ' activo' : ' primario'}`} onClick={alternarAgregar}>
            {modoAgregar ? 'Cancelar' : '＋ Agregar punto'}
          </button>
        </div>

        {modoAgregar && !borrador && <p className="banner">Tocá el mapa para elegir dónde está el punto.</p>}
        {error && <p className="banner banner-error" role="alert">{error}</p>}
        {aviso && <p className="banner">{aviso}</p>}

        <MapaVista
          puntos={puntos}
          seleccionadoId={seleccionado?.id ?? null}
          borrador={borrador}
          modoAgregar={modoAgregar}
          centro={centro}
          onSeleccionar={(p) => {
            if (!modoAgregar) setSeleccionado(p);
          }}
          onElegirUbicacion={(lat, lng) => setBorrador({ lat, lng })}
        />
      </section>

      <aside className="panel">
        {modoAgregar && borrador ? (
          <PuntoForm tipos={tipos} ubicacion={borrador} onGuardado={puntoGuardado} onCancelar={cancelarAlta} />
        ) : seleccionado ? (
          <PuntoPanel
            punto={seleccionado}
            usuarioId={usuario?.id ?? null}
            onActualizado={puntoActualizado}
            onEliminado={puntoEliminado}
            onPedirLogin={onPedirLogin}
            onCerrar={() => setSeleccionado(null)}
          />
        ) : (
          <div className="vacio">
            <h2>Puntos cerca de tu recorrido</h2>
            <p>
              Tocá un punto del mapa para ver su estado y los últimos reportes. Hay <strong>{puntos.length}</strong>{' '}
              {puntos.length === 1 ? 'punto cargado' : 'puntos cargados'}.
            </p>
            <ul className="leyenda">
              <li>
                <span className="pin pin-activo chico">💧</span> Funciona
              </li>
              <li>
                <span className="pin pin-roto chico">💧</span> Fuera de servicio
              </li>
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
