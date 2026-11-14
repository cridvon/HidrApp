import { useCallback, useEffect, useState } from 'react';
import { api, mensajeError } from '../api/client';
import type { Estado, Punto, Reporte } from '../types';
import { ETIQUETA_ESTADO, ETIQUETA_SUPERFICIE, emojiDeTipo, formatearFecha } from './etiquetas';

interface Props {
  punto: Punto;
  usuarioId: number | null;
  onActualizado: (punto: Punto) => void;
  onEliminado: (id: number) => void;
  onPedirLogin: () => void;
  onCerrar: () => void;
}

export default function PuntoPanel({ punto, usuarioId, onActualizado, onEliminado, onPedirLogin, onCerrar }: Props) {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargarReportes = useCallback(async () => {
    try {
      setReportes(await api.reportes(punto.id));
    } catch (err) {
      setError(mensajeError(err));
    }
  }, [punto.id]);

  useEffect(() => {
    setComentario('');
    setError('');
    cargarReportes();
  }, [cargarReportes]);

  async function reportar(estado: Estado) {
    setError('');
    setEnviando(true);
    try {
      await api.reportar(punto.id, estado, comentario.trim() || undefined);
      const [actualizado, lista] = await Promise.all([api.punto(punto.id), api.reportes(punto.id)]);
      setReportes(lista);
      setComentario('');
      onActualizado(actualizado);
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar "${punto.nombre}"? Se borrarán también sus reportes.`)) return;
    try {
      await api.eliminarPunto(punto.id);
      onEliminado(punto.id);
    } catch (err) {
      setError(mensajeError(err));
    }
  }

  const esCreador = usuarioId !== null && usuarioId === punto.usuario_creador_id;

  return (
    <div className="detalle">
      <div className="detalle-cabecera">
        <h2>
          <span aria-hidden="true">{emojiDeTipo(punto.tipo)}</span> {punto.nombre}
        </h2>
        <button type="button" className="btn icono" onClick={onCerrar} aria-label="Cerrar detalle">
          ✕
        </button>
      </div>

      <p>
        <span className={`insignia insignia-${punto.estado_actual}`}>{ETIQUETA_ESTADO[punto.estado_actual]}</span>
      </p>
      <dl className="datos">
        <dt>Tipo</dt>
        <dd>{punto.tipo}</dd>
        <dt>Superficie</dt>
        <dd>{ETIQUETA_SUPERFICIE[punto.superficie]}</dd>
        <dt>Sombra</dt>
        <dd>{punto.tiene_sombra ? 'Sí' : 'No'}</dd>
      </dl>

      <section>
        <h3>¿Cómo está ahora?</h3>
        {usuarioId === null ? (
          <button type="button" className="btn primario" onClick={onPedirLogin}>
            Iniciá sesión para reportar
          </button>
        ) : (
          <>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Comentario (opcional)"
              maxLength={500}
              rows={2}
              aria-label="Comentario del reporte"
            />
            <div className="acciones">
              <button type="button" className="btn ok" disabled={enviando} onClick={() => reportar('activo')}>
                💧 Funciona
              </button>
              <button type="button" className="btn peligro" disabled={enviando} onClick={() => reportar('roto')}>
                🚫 Está roto
              </button>
            </div>
          </>
        )}
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      <section>
        <h3>Últimos reportes</h3>
        {reportes.length === 0 ? (
          <p className="ayuda">Todavía nadie reportó este punto.</p>
        ) : (
          <ul className="reportes">
            {reportes.map((r) => (
              <li key={r.id}>
                <span className={`insignia insignia-${r.estado_reportado}`}>{ETIQUETA_ESTADO[r.estado_reportado]}</span>
                <span className="meta">
                  {r.usuario} · {formatearFecha(r.fecha_reporte)}
                </span>
                {r.comentario && <p>{r.comentario}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {esCreador && (
        <button type="button" className="btn peligro-suave" onClick={eliminar}>
          Eliminar este punto
        </button>
      )}
    </div>
  );
}
