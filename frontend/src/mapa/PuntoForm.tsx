import { useState, type FormEvent } from 'react';
import { api, mensajeError } from '../api/client';
import type { Punto, Superficie, Tipo } from '../types';
import { ETIQUETA_SUPERFICIE } from './etiquetas';

interface Props {
  tipos: Tipo[];
  ubicacion: { lat: number; lng: number };
  onGuardado: (punto: Punto) => void;
  onCancelar: () => void;
}

export default function PuntoForm({ tipos, ubicacion, onGuardado, onCancelar }: Props) {
  const [nombre, setNombre] = useState('');
  const [tipoId, setTipoId] = useState(tipos[0]?.id ?? 0);
  const [superficie, setSuperficie] = useState<Superficie>('asfalto');
  const [tieneSombra, setTieneSombra] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const punto = await api.crearPunto({
        nombre,
        tipo_id: tipoId,
        lat: ubicacion.lat,
        lng: ubicacion.lng,
        superficie,
        tiene_sombra: tieneSombra,
      });
      onGuardado(punto);
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={guardar}>
      <h2>Nuevo punto</h2>
      <p className="ayuda">
        Ubicación elegida: {ubicacion.lat.toFixed(5)}, {ubicacion.lng.toFixed(5)}
      </p>

      <label>
        Nombre
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej.: Bebedero de la plaza"
          required
          minLength={2}
          maxLength={120}
        />
      </label>

      <label>
        Tipo
        <select value={tipoId} onChange={(e) => setTipoId(Number(e.target.value))}>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
      </label>

      <label>
        Superficie
        <select value={superficie} onChange={(e) => setSuperficie(e.target.value as Superficie)}>
          {Object.entries(ETIQUETA_SUPERFICIE).map(([valor, texto]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </select>
      </label>

      <label className="check">
        <input type="checkbox" checked={tieneSombra} onChange={(e) => setTieneSombra(e.target.checked)} />
        Tiene sombra
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="acciones">
        <button type="submit" className="btn primario" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar punto'}
        </button>
        <button type="button" className="btn" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
