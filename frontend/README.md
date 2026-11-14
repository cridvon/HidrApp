# HidrApp – Frontend

Aplicación web (React 19 + TypeScript + Vite) con mapa Leaflet/OpenStreetMap.

## Qué hace
- Registro e inicio de sesión (JWT guardado en el navegador).
- Mapa con los puntos de interés (bebederos, baños, sombra) y filtros por tipo, estado y superficie.
- Alta de puntos tocando el mapa (requiere sesión) y baja por su creador.
- Reportes "Activo / Roto" por punto, con historial; el pin cambia de color según el estado actual.
- Vista adaptada a celulares.

## Estructura
```
src/
  api/        cliente HTTP (client.ts) y sus tests
  auth/       contexto de sesión y diálogo de acceso
  mapa/       mapa, formulario de alta, panel de detalle y reportes
  App.tsx, main.tsx, styles.css, types.ts
```

## Cómo correrlo
```bash
cp .env.example .env     # opcional en desarrollo
npm ci
npm run dev              # http://localhost:5173 (proxy /api → http://localhost:3000)
```
Requiere el backend levantado (ver `../backend/README.md`).

## Variables de entorno
| Variable | Uso |
|---|---|
| `VITE_API_URL` | URL base de la API en producción (ej. `https://hidrapp-api.up.railway.app/api`). Si no se define, usa `/api`. |

## Scripts
- `npm run dev` – servidor de desarrollo
- `npm run build` – compilación de producción en `dist/`
- `npm test` – tests del cliente de la API (vitest)
