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

## Estructura del repositorio

```
HidrApp/
├── frontend/          # App React + TypeScript
├── backend/           # API Node.js + Express
├── docs/              # Documentación académica (entregas, plan de trabajo)
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
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Licencia

Proyecto académico — TUPaD, UTN. Uso educativo.
