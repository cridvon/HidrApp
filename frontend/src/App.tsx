import { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AuthDialog from './auth/AuthDialog';
import MapaPage from './mapa/MapaPage';

function Contenido() {
  const { usuario, cargando, logout } = useAuth();
  const [mostrarAuth, setMostrarAuth] = useState(false);

  return (
    <>
      <header className="encabezado">
        <div className="marca">
          <img src="/favicon.svg" alt="" width={28} height={28} />
          <div>
            <h1>HidrApp</h1>
            <p>Bebederos, baños y sombra para entrenar al aire libre</p>
          </div>
        </div>
        <div className="sesion">
          {cargando ? null : usuario ? (
            <>
              <span>Hola, {usuario.nombre}</span>
              <button type="button" className="btn" onClick={logout}>
                Salir
              </button>
            </>
          ) : (
            <button type="button" className="btn primario" onClick={() => setMostrarAuth(true)}>
              Iniciar sesión
            </button>
          )}
        </div>
      </header>

      <main>
        <MapaPage onPedirLogin={() => setMostrarAuth(true)} />
      </main>

      {mostrarAuth && <AuthDialog onCerrar={() => setMostrarAuth(false)} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Contenido />
    </AuthProvider>
  );
}
