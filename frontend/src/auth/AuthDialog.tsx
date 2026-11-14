import { useState, type FormEvent } from 'react';
import { mensajeError } from '../api/client';
import { useAuth } from './AuthContext';

interface Props {
  onCerrar: () => void;
}

export default function AuthDialog({ onCerrar }: Props) {
  const { login, registro } = useAuth();
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      if (modo === 'login') await login(email, password);
      else await registro(nombre, email, password);
      onCerrar();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="overlay" role="presentation" onClick={onCerrar}>
      <form
        className="dialogo"
        role="dialog"
        aria-modal="true"
        aria-label={modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        onClick={(e) => e.stopPropagation()}
        onSubmit={enviar}
      >
        <h2>{modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>

        {modo === 'registro' && (
          <label>
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" required minLength={2} />
          </label>
        )}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={modo === 'registro' ? 6 : 1}
          />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" className="btn primario" disabled={enviando}>
          {enviando ? 'Enviando…' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
        <button
          type="button"
          className="btn enlace"
          onClick={() => {
            setModo(modo === 'login' ? 'registro' : 'login');
            setError('');
          }}
        >
          {modo === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
        </button>
      </form>
    </div>
  );
}
