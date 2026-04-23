-- ============================================================
--  MIGRACIÓN BLOQUE 0 — Limpieza ingreso_aproximado
--  Ejecutar: psql -d egresados_db -f migration_bloque0.sql
-- ============================================================

-- Eliminar columna ingreso_aproximado de historial_laboral
-- (se hace de forma segura con IF EXISTS)
ALTER TABLE historial_laboral
  DROP COLUMN IF EXISTS ingreso_aproximado;

-- Verificación
SELECT 'ingreso_aproximado eliminado' AS resultado,
       NOT EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_name = 'historial_laboral'
           AND column_name = 'ingreso_aproximado'
       ) AS ok;
