-- ============================================================
--  MIGRACIÓN V7 — Directorio público de egresados (Bloque E)
-- ============================================================

ALTER TABLE egresado
  ADD COLUMN IF NOT EXISTS mostrar_en_directorio BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_egresado_directorio
  ON egresado(mostrar_en_directorio)
  WHERE mostrar_en_directorio = TRUE;

SELECT 'mostrar_en_directorio en egresado' AS resultado,
       EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_name = 'egresado' AND column_name = 'mostrar_en_directorio'
       ) AS ok;
