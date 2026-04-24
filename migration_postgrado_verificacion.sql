-- Agregar campos de verificación a la tabla postgrado
ALTER TABLE postgrado
  ADD COLUMN IF NOT EXISTS verificacion_estado VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS documento_binario   BYTEA       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS documento_nombre    VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS documento_tipo      VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS documento_subido_en TIMESTAMP   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS verificado_en       TIMESTAMP   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rechazo_motivo      TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS es_solicitud_cambio BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS datos_propuestos    TEXT        DEFAULT NULL;

-- Índice para verificaciones pendientes
CREATE INDEX IF NOT EXISTS idx_postgrado_verificacion
  ON postgrado(verificacion_estado)
  WHERE verificacion_estado = 'pendiente';