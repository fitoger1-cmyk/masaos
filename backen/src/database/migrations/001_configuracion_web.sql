CREATE TABLE IF NOT EXISTS configuracion_web (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  configuracion JSONB NOT NULL DEFAULT '{}'::jsonb,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

