-- ============================================================
--  MIGRACIÓN V3 — Sistema de Egresados
--  ⚠  Ejecutar en orden. Hace cambios destructivos (DROP TABLE).
--     Hacer backup antes si hay datos importantes.
-- ============================================================

-- ── 1. Nuevo ENUM para modalidad de titulación ────────────────
DO $$ BEGIN
  CREATE TYPE modalidad_titulacion_enum AS ENUM (
    'Tesis',
    'Proyecto de grado',
    'Trabajo dirigido',
    'Excelencia'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2. Nuevo ENUM para tipo de sugerencia ─────────────────────
DO $$ BEGIN
  CREATE TYPE sugerencia_tipo_enum AS ENUM (
    'Sugerencia general',
    'Sugerencia para el sistema',
    'Especializacion recomendada'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 3. Agregar columnas nuevas a egresado ─────────────────────
ALTER TABLE egresado
  -- Plan de estudios ahora es texto libre con lista sugerida
  ADD COLUMN IF NOT EXISTS plan_estudios_nombre VARCHAR(50),

  -- Modalidad de titulación (RF nuevo de supervisores)
  ADD COLUMN IF NOT EXISTS modalidad_titulacion modalidad_titulacion_enum,

  -- Año de titulación como integer (adicional a fecha_titulacion)
  -- Útil para filtros y reportes rápidos
  ADD COLUMN IF NOT EXISTS anio_titulacion INTEGER;

-- Poblar anio_titulacion desde fecha_titulacion si ya existe
UPDATE egresado
SET anio_titulacion = EXTRACT(YEAR FROM fecha_titulacion)::int
WHERE fecha_titulacion IS NOT NULL AND anio_titulacion IS NULL;

-- ── 4. Eliminar historial_planes (depende de plan_estudios) ───
DROP TABLE IF EXISTS historial_planes CASCADE;

-- ── 5. Quitar la FK de egresado.id_plan ───────────────────────
-- Primero identificar el nombre exacto del constraint
DO $$
DECLARE
  v_constraint TEXT;
BEGIN
  SELECT constraint_name INTO v_constraint
  FROM information_schema.table_constraints
  WHERE table_name = 'egresado'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%id_plan%';

  IF v_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE egresado DROP CONSTRAINT %I', v_constraint);
  END IF;
END $$;

-- Hacer nullable la columna id_plan (ya sin FK)
ALTER TABLE egresado ALTER COLUMN id_plan DROP NOT NULL;

-- ── 6. Eliminar tabla plan_estudios ───────────────────────────
-- (CASCADE elimina índices y constraints asociados)
DROP TABLE IF EXISTS plan_estudios CASCADE;

-- ── 7. Nueva tabla SUGERENCIAS ────────────────────────────────
CREATE TABLE IF NOT EXISTS sugerencias (
  id            SERIAL PRIMARY KEY,
  -- El egresado puede ser anónimo (id_egresado NULL)
  id_egresado   INTEGER REFERENCES egresado(id) ON DELETE SET NULL,
  tipo          sugerencia_tipo_enum NOT NULL DEFAULT 'Sugerencia general',
  mensaje       TEXT NOT NULL,
  -- Metadatos útiles para el admin
  es_anonima    BOOLEAN NOT NULL DEFAULT FALSE,
  leida         BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sugerencias_egresado
  ON sugerencias(id_egresado);

CREATE INDEX IF NOT EXISTS idx_sugerencias_leida
  ON sugerencias(leida, creado_en DESC);

-- ── 8. Trigger ultima_actualizacion para egresado ────────────
-- (Re-crear por si acaso después del DROP CASCADE)
CREATE OR REPLACE FUNCTION set_ultima_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_egresado_ultima_act
    BEFORE UPDATE ON egresado
    FOR EACH ROW EXECUTE FUNCTION set_ultima_actualizacion();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_historial_ultima_act
    BEFORE UPDATE ON historial_laboral
    FOR EACH ROW EXECUTE FUNCTION set_ultima_actualizacion();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_postgrado_ultima_act
    BEFORE UPDATE ON postgrado
    FOR EACH ROW EXECUTE FUNCTION set_ultima_actualizacion();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 9. Verificación ───────────────────────────────────────────
SELECT 'plan_estudios eliminada' AS resultado,
       NOT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_name = 'plan_estudios'
       ) AS ok
UNION ALL
SELECT 'sugerencias creada',
       EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_name = 'sugerencias'
       )
UNION ALL
SELECT 'plan_estudios_nombre en egresado',
       EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_name = 'egresado' AND column_name = 'plan_estudios_nombre'
       )
UNION ALL
SELECT 'modalidad_titulacion en egresado',
       EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_name = 'egresado' AND column_name = 'modalidad_titulacion'
       );
