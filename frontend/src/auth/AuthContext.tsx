import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStore } from '../api/client';
import type { Sesion, Usuario } from '../types';

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  registro: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(Boolean(tokenStore.get()));

  // Si hay un token guardado, se valida con el servidor al abrir la app.
  useEffect(() => {
    if (!tokenStore.get()) return;
    api
      .me()
      .then(setUsuario)
      .catch(() => tokenStore.clear())
      .finally(() => setCargando(false));
  }, []);

  const iniciar = useCallback((sesion: Sesion) => {
    tokenStore.set(sesion.token);
    setUsuario(sesion.usuario);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      cargando,
      login: async (email, password) => iniciar(await api.login(email, password)),
      registro: async (nombre, email, password) => iniciar(await api.registro(nombre, email, password)),
      logout: () => {
        tokenStore.clear();
        setUsuario(null);
      },
    }),
    [usuario, cargando, iniciar],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
