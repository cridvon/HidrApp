-- ============================================================
-- HidrApp — Esquema de base de datos
-- Motor: PostgreSQL 15+ con extensión PostGIS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- ------------------------------------------------------------
-- usuarios
-- ------------------------------------------------------------
CREATE TABLE usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    fecha_registro  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- tipos_punto (catálogo: bebedero, baño, zona de sombra)
-- ------------------------------------------------------------
CREATE TABLE tipos_punto (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(50) NOT NULL UNIQUE,
    icono   VARCHAR(100)
);

-- ------------------------------------------------------------
-- puntos_interes (entidad central, con ubicación geográfica)
-- ------------------------------------------------------------
CREATE TABLE puntos_interes (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(120) NOT NULL,
    tipo_id             INTEGER NOT NULL REFERENCES tipos_punto(id),
    ubicacion           GEOGRAPHY(Point, 4326) NOT NULL,
    superficie          VARCHAR(20) NOT NULL
                        CHECK (superficie IN ('asfalto', 'cesped', 'tierra')),
    tiene_sombra        BOOLEAN NOT NULL DEFAULT FALSE,
    estado_actual       VARCHAR(10) NOT NULL DEFAULT 'activo'
                        CHECK (estado_actual IN ('activo', 'roto')),
    usuario_creador_id  INTEGER NOT NULL REFERENCES usuarios(id),
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice espacial: acelera consultas de proximidad (ST_DWithin)
CREATE INDEX idx_puntos_ubicacion ON puntos_interes USING GIST (ubicacion);
CREATE INDEX idx_puntos_tipo ON puntos_interes (tipo_id);

-- ------------------------------------------------------------
-- reportes_estado (historial colaborativo)
-- ------------------------------------------------------------
CREATE TABLE reportes_estado (
    id                SERIAL PRIMARY KEY,
    punto_id          INTEGER NOT NULL REFERENCES puntos_interes(id) ON DELETE CASCADE,
    usuario_id        INTEGER NOT NULL REFERENCES usuarios(id),
    estado_reportado  VARCHAR(10) NOT NULL
                      CHECK (estado_reportado IN ('activo', 'roto')),
    comentario        TEXT,
    fecha_reporte     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reportes_punto ON reportes_estado (punto_id, fecha_reporte DESC);

-- ------------------------------------------------------------
-- notificaciones (alertas de proximidad)
-- ------------------------------------------------------------
CREATE TABLE notificaciones (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    punto_id    INTEGER NOT NULL REFERENCES puntos_interes(id) ON DELETE CASCADE,
    tipo        VARCHAR(20) NOT NULL DEFAULT 'proximidad'
                CHECK (tipo IN ('proximidad')),
    enviada     BOOLEAN NOT NULL DEFAULT FALSE,
    fecha       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones (usuario_id, fecha DESC);

-- ------------------------------------------------------------
-- Datos iniciales
-- ------------------------------------------------------------
INSERT INTO tipos_punto (nombre, icono) VALUES
    ('Bebedero', 'droplet'),
    ('Baño',     'toilet'),
    ('Sombra',   'tree');

-- ------------------------------------------------------------
-- Ejemplo de consulta de proximidad: puntos a menos de 100 m
-- (longitud, latitud) de la posición del usuario
-- ------------------------------------------------------------
-- SELECT id, nombre, estado_actual,
--        ST_Distance(ubicacion, ST_MakePoint(-60.2257, -33.3350)::geography) AS metros
-- FROM puntos_interes
-- WHERE ST_DWithin(ubicacion, ST_MakePoint(-60.2257, -33.3350)::geography, 100)
-- ORDER BY metros;
