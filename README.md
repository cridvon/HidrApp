# HidrApp 💧

Red colaborativa de puntos de hidratación y servicios urbanos para runners, ciclistas y personas que entrenan al aire libre.

**Proyecto Final — Tecnicatura Universitaria en Programación a Distancia (TUPaD), UTN**

## Integrantes

- Chiavón Cristian
- Chiavón Facundo

## Docente tutor

Juan Ignacio Schiavonni

## Problemática

Quienes entrenan al aire libre no cuentan con información centralizada y en tiempo real sobre bebederos, baños accesibles, zonas de sombra y tipo de superficie en su recorrido, lo que dificulta planificar entrenamientos largos, especialmente en días de calor.

## Solución

Plataforma web colaborativa donde la comunidad mapea y actualiza en tiempo real el estado de puntos de hidratación y servicios urbanos. Los usuarios reportan si un punto "funciona" o está "roto", generando un mapa vivo y confiable, con notificaciones de proximidad al acercarse a un punto.

## Alcance del MVP

- [ ] Mapa interactivo con puntos cargados por usuarios
- [ ] CRUD de puntos (bebedero, baño, sombra, superficie)
- [ ] Estado colaborativo del punto (funciona / roto)
- [ ] Notificación de proximidad (push)
- [ ] Actualización en tiempo real del estado (Socket.io)

> Alertas por voz y geofencing avanzado quedan planificados para una etapa posterior.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + TypeScript + Vite |
| Mapas | Leaflet.js |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL + PostGIS |
| Tiempo real | Socket.io |
| Notificaciones | Web Notifications API (PWA) |
| Plataforma | Vercel (front) · Railway (back) · Supabase (BD) |

## Modelo de datos

Base relacional en PostgreSQL + PostGIS (ver diagrama ER completo en `docs/`):

| Entidad | Propósito |
|---|---|
| `usuarios` | Personas registradas que cargan puntos y reportan estados |
| `tipos_punto` | Catálogo de categorías (bebedero, baño, zona de sombra) |
| `puntos_interes` | Entidad central: ubicación geográfica, superficie, sombra, estado |
| `reportes_estado` | Historial colaborativo de reportes sobre el estado de un punto |
| `notificaciones` | Registro de alertas de proximidad enviadas a usuarios |

## Módulos

| Módulo | Descripción |
|---|---|
| Autenticación y Usuarios | Registro, login y gestión de sesión |
| Gestión de Puntos de Interés | ABM de puntos y consulta por tipo/zona |
| Mapa Interactivo | Visualización de puntos sobre mapa (Leaflet) |
| Reportes Colaborativos | Carga de reportes de estado por la comunidad |
| Geolocalización y Proximidad | Consultas espaciales (PostGIS `ST_DWithin`) |
| Notificaciones | Alertas de proximidad al usuario |
| Tiempo Real | Propagación en vivo de cambios (Socket.io) |

## Estructura del repositorio

```
HidrApp/
├── backend/
│   └── src/
│       ├── auth/
│       ├── puntos/
│       ├── reportes/
│       ├── geolocalizacion/
│       ├── notificaciones/
│       └── realtime/
├── frontend/
│   └── src/
│       ├── mapa/
│       ├── auth/
│       └── notificaciones/
├── docs/              # Documentación académica (entregas, diagramas)
└── README.md
```

## Repositorio

https://github.com/cridvon/HidrApp

## Plan de trabajo

| Etapa | Período | Objetivo |
|---|---|---|
| 1 | Semana 1-2 | Repositorio, estructura y modelo de datos |
| 2 | Semana 3-4 | CRUD de puntos y mapa interactivo |
| 3 | Semana 5-6 | Geofencing básico y notificaciones |
| 4 | Semana 7-8 | Tiempo real (Socket.io), pruebas y pulido |
| 5 | Semana 9+ | Documentación final, video demo y coloquio |

## Cómo correr el proyecto

### Backend
```bash
TBD
```

### Frontend
```bash
TBD
```

## Licencia

Proyecto académico — TUPaD, UTN. Uso educativo.
