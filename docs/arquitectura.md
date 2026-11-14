# HidrApp — Arquitectura del proyecto

## Estilo arquitectónico

Arquitectura **cliente-servidor** con una SPA como cliente y una **API REST** como servidor. El backend se organiza en **capas** y se complementa con un canal **WebSocket** para actualizaciones en tiempo real.

```
┌──────────────────────┐        HTTPS / REST         ┌────────────────────────────┐
│  Frontend (SPA)      │ ◄─────────────────────────► │  Backend (Node + Express)  │
│  React + TypeScript  │                             │                            │
│  Leaflet (mapa)      │        WebSocket            │  routes → controllers      │
│  PWA + Notifications │ ◄─────────────────────────► │  → services → models       │
└──────────────────────┘        (Socket.io)          └─────────────┬──────────────┘
                                                                   │ SQL
                                                     ┌─────────────▼──────────────┐
                                                     │ PostgreSQL + PostGIS       │
                                                     └────────────────────────────┘
```

## Capas del backend

| Capa | Responsabilidad |
|---|---|
| Rutas (`routes`) | Define los endpoints REST y los asocia a un controlador |
| Controladores (`controllers`) | Reciben la solicitud, validan datos de entrada y devuelven la respuesta |
| Servicios (`services`) | Contienen la lógica de negocio (por ejemplo, actualizar el estado vigente de un punto al recibir un reporte) |
| Modelos (`models`) | Acceso a datos: consultas SQL sobre PostgreSQL/PostGIS |

Cada módulo (`auth`, `puntos`, `reportes`, `geolocalizacion`, `notificaciones`, `realtime`) replica esta organización dentro de su propia carpeta.

## Frontend

SPA basada en **componentes** de React, organizada por módulo funcional (`mapa`, `auth`, `notificaciones`). Se comunica con el backend por REST y escucha cambios de estado por Socket.io. Funciona como **PWA** para habilitar notificaciones de proximidad sin app nativa.

## Tecnologías definitivas

| Capa | Tecnología |
|---|---|
| Frontend | React + TypeScript + Vite |
| Mapas | Leaflet.js |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL + PostGIS |
| Tiempo real | Socket.io |
| Notificaciones | Web Notifications API (PWA) |
| Despliegue | Vercel (frontend) · Railway (backend) · Supabase (base de datos) |

## Justificación de decisiones técnicas

- **PostgreSQL + PostGIS (y no una base documental):** el sistema depende de consultas geoespaciales, como encontrar puntos a menos de 100 m del usuario. PostGIS las resuelve de forma nativa (`ST_DWithin`) y con índices espaciales (GIST).
- **Modelo relacional:** las entidades (usuarios, puntos, reportes, notificaciones) tienen relaciones claras y se benefician de claves foráneas y restricciones de integridad.
- **React + TypeScript + Vite:** tecnologías ya conocidas por el equipo; el tipado reduce errores y Vite agiliza el desarrollo.
- **Node.js + Express:** API REST simple, mismo lenguaje (TypeScript/JavaScript) que el frontend, lo que facilita el trabajo en equipo.
- **Leaflet.js:** librería de mapas gratuita, sin necesidad de API key paga.
- **Socket.io:** permite que el estado "con agua / roto" se actualice en todos los clientes sin refrescar la página.
- **PWA + Web Notifications:** habilita alertas de proximidad sin desarrollar una app nativa.
- **Vercel + Railway + Supabase:** capas gratuitas suficientes para el proyecto académico; Supabase ofrece PostgreSQL con PostGIS.
