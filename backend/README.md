# Backend — HidrApp

API REST en **Node.js + Express + TypeScript** sobre **PostgreSQL + PostGIS**.

## Módulos implementados

| Módulo | Carpeta | Descripción |
|---|---|---|
| Autenticación y Usuarios | `src/auth` | Registro, login (JWT) y perfil |
| Gestión de Puntos de Interés | `src/puntos` | Alta, listado, detalle, edición y baja de puntos |
| Reportes Colaborativos | `src/reportes` | Reportes de estado (activo / roto) e historial |

Cada módulo sigue la arquitectura en capas: `routes → controller → service → model`
(ver `docs/arquitectura.md`).

## Requisitos

- Node.js 20 o superior
- PostgreSQL 15+ con la extensión PostGIS (local o Supabase)

## Puesta en marcha

1. Crear la base de datos y cargar el esquema:
   ```bash
   createdb hidrapp
   psql -d hidrapp -f ../database/schema.sql
   ```
   En Supabase: ejecutar el contenido de `database/schema.sql` en el *SQL Editor*.
2. Configurar las variables de entorno:
   ```bash
   cp .env.example .env
   # completar DATABASE_URL y JWT_SECRET
   ```
3. Instalar dependencias y levantar el servidor:
   ```bash
   npm install
   npm run dev
   ```
   La API queda en `http://localhost:3000/api`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3000) |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `DATABASE_SSL` | `true` si la base exige SSL (Supabase) |
| `JWT_SECRET` | Clave para firmar los tokens (obligatoria en producción) |
| `CORS_ORIGIN` | Origen(es) permitidos del frontend, separados por coma |

## Pruebas

Las pruebas de integración usan una base real. **Vacían las tablas al iniciar**, por eso
deben correrse contra una base de pruebas:

```bash
createdb hidrapp_test
psql -d hidrapp_test -f ../database/schema.sql
TEST_DATABASE_URL=postgres://usuario:clave@localhost:5432/hidrapp_test npm test
```

Cubren autenticación, validaciones, permisos, el historial de reportes y la consistencia del
estado ante reportes concurrentes.

## Endpoints

Las rutas marcadas con 🔒 requieren el header `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servicio |
| POST | `/api/auth/registro` | Crea un usuario y devuelve el token |
| POST | `/api/auth/login` | Inicia sesión y devuelve el token |
| GET | `/api/auth/me` 🔒 | Datos del usuario autenticado |
| GET | `/api/tipos` | Tipos de punto (bebedero, baño, sombra) |
| GET | `/api/puntos` | Lista de puntos. Filtros: `?tipo_id=` y `?estado=activo\|roto` |
| GET | `/api/puntos/:id` | Detalle de un punto |
| POST | `/api/puntos` 🔒 | Crea un punto (`nombre`, `tipo_id`, `lat`, `lng`, `superficie`, `tiene_sombra`) |
| PUT | `/api/puntos/:id` 🔒 | Modifica un punto (solo su creador) |
| DELETE | `/api/puntos/:id` 🔒 | Elimina un punto (solo su creador) |
| GET | `/api/puntos/:id/reportes` | Historial de reportes (últimos 50) |
| POST | `/api/puntos/:id/reportes` 🔒 | Reporta el estado (`estado`: `activo` o `roto`, `comentario` opcional) |

## Decisiones de diseño

- **Estado consistente:** cada reporte se guarda y actualiza el estado vigente del punto en una
  única transacción, con el punto bloqueado (`FOR UPDATE`).
- **Contraseñas:** se guardan con hash bcrypt; la API nunca devuelve el hash.
- **Permisos:** solo quien creó un punto puede modificarlo o eliminarlo.
- **Ubicación:** se guarda como `geography(Point, 4326)` y la API la expone como `lat` / `lng`.
