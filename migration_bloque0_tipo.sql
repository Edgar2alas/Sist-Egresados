-- ============================================================
--  MIGRACIÓN BLOQUE 0 — Diferenciación Titulado / Egresado
--  Ejecutar: psql -d egresados_db -f migration_bloque0_tipo.sql
-- ============================================================

-- 1. Crear el tipo enum para diferenciar titulado vs egresado
DO $$ BEGIN
  CREATE TYPE persona_tipo_enum AS ENUM ('Titulado', 'Egresado');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Agregar campo tipo (default 'Titulado' para no romper datos existentes)
ALTER TABLE egresado
  ADD COLUMN IF NOT EXISTS tipo persona_tipo_enum NOT NULL DEFAULT 'Titulado';

-- 3. Campos exclusivos de Egresado (sin título)
ALTER TABLE egresado
  ADD COLUMN IF NOT EXISTS inicio_proceso          BOOLEAN       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS motivo_no_titulacion    TEXT          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS planea_titularse        BOOLEAN       DEFAULT NULL;

-- 4. Campos nuevos compartidos (redes y metadatos)
ALTER TABLE egresado
  ADD COLUMN IF NOT EXISTS facebook                VARCHAR(200)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS linkedin                VARCHAR(200)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS area_especializacion    VARCHAR(150)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS observaciones           TEXT          DEFAULT NULL;

-- 5. Actualizar registros existentes: si tienen anio_titulacion → Titulado, si no → Egresado
UPDATE egresado
  SET tipo = 'Egresado'
  WHERE anio_titulacion IS NULL;

UPDATE egresado
  SET tipo = 'Titulado'
  WHERE anio_titulacion IS NOT NULL;

-- 6. Índice para filtrar por tipo rápidamente
CREATE INDEX IF NOT EXISTS idx_egresado_tipo ON egresado(tipo);

-- Verificación final
SELECT
  tipo,
  COUNT(*)::int AS cantidad
FROM egresado
GROUP BY tipo
ORDER BY tipo;

SELECT 'Migración Bloque 0 completada exitosamente' AS resultado;
