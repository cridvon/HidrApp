# HidrApp — Listado de módulos

Los módulos se corresponden con el alcance del MVP y se organizan como carpetas independientes dentro del repositorio.

| Módulo | Descripción | Prioridad |
|---|---|---|
| Autenticación y Usuarios | Registro e inicio de sesión de usuarios; gestión de sesión. | Alta |
| Gestión de Puntos de Interés | ABM de puntos: alta, edición, baja lógica y consulta por tipo/zona. | Alta |
| Mapa Interactivo | Visualización de puntos sobre mapa, filtros por tipo de servicio. | Alta |
| Reportes Colaborativos | Carga de reportes de estado por la comunidad y actualización del estado vigente del punto. | Alta |
| Geolocalización y Proximidad | Cálculo de puntos cercanos a la posición del usuario mediante consultas espaciales. | Media |
| Tiempo Real | Propagación en vivo de cambios de estado a todos los clientes conectados. | Media |
| Notificaciones | Alertas al usuario cuando se aproxima a un punto de interés. | Baja |

**Criterio de prioridad:** *Alta* = núcleo sin el cual la app no funciona; *Media* = diferencial del producto, se implementa una vez estable el núcleo; *Baja* = mejora que depende de módulos anteriores.

## Componentes técnicos por módulo

| Módulo | Componentes |
|---|---|
| Autenticación y Usuarios | Express + JWT, tabla `usuarios` |
| Gestión de Puntos de Interés | API REST, tabla `puntos_interes` |
| Mapa Interactivo | React + Leaflet.js |
| Reportes Colaborativos | API REST, tabla `reportes_estado` |
| Geolocalización y Proximidad | PostGIS (`ST_DWithin`) |
| Tiempo Real | Socket.io |
| Notificaciones | Web Notifications API, tabla `notificaciones` |

## Ubicación en el repositorio

```
backend/src/
  ├── auth/             (Autenticación y Usuarios)
  ├── puntos/           (Gestión de Puntos de Interés)
  ├── reportes/         (Reportes Colaborativos)
  ├── geolocalizacion/  (Geolocalización y Proximidad)
  ├── notificaciones/   (Notificaciones)
  └── realtime/         (Tiempo Real — Socket.io)

frontend/src/
  ├── mapa/             (Mapa Interactivo)
  ├── auth/
  └── notificaciones/
```
