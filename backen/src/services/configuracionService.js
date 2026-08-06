const fs = require("fs");
const path = require("path");
const { pool } = require("../config/database");

const configuracionPath = path.join(
  __dirname,
  "..",
  "controllers",
  "configuracion.json"
);

let inicializacionPendiente = null;

function leerJSON() {
  try {
    const contenido = fs.readFileSync(configuracionPath, "utf8").trim();
    return contenido ? JSON.parse(contenido) : {};
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

function guardarJSON(configuracion) {
  fs.mkdirSync(path.dirname(configuracionPath), { recursive: true });
  fs.writeFileSync(
    configuracionPath,
    JSON.stringify(configuracion, null, 2),
    "utf8"
  );
}

async function inicializarConfiguracion() {
  if (!pool) return { postgres: false, migrados: 0 };

  if (!inicializacionPendiente) {
    inicializacionPendiente = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS configuracion_web (
          id SMALLINT PRIMARY KEY CHECK (id = 1),
          datos JSONB NOT NULL DEFAULT '{}'::jsonb,
          creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      const existente = await pool.query(
        "SELECT id FROM configuracion_web WHERE id = 1"
      );

      let migrados = 0;
      if (existente.rowCount === 0) {
        const configuracionJSON = leerJSON();
        await pool.query(
          `INSERT INTO configuracion_web (id, datos)
           VALUES (1, $1::jsonb)
           ON CONFLICT (id) DO NOTHING`,
          [JSON.stringify(configuracionJSON)]
        );
        migrados = 1;
      }

      console.log(
        `Configuración web: tabla lista. Migrados ahora: ${migrados}.`
      );
      return { postgres: true, migrados };
    })().catch((error) => {
      inicializacionPendiente = null;
      throw error;
    });
  }

  return inicializacionPendiente;
}

async function obtenerConfiguracion() {
  if (!pool) return leerJSON();

  await inicializarConfiguracion();
  const resultado = await pool.query(
    "SELECT datos FROM configuracion_web WHERE id = 1"
  );
  return resultado.rows[0]?.datos || leerJSON();
}

async function guardarConfiguracion(configuracion) {
  if (!pool) {
    guardarJSON(configuracion);
    return configuracion;
  }

  await inicializarConfiguracion();
  await pool.query(
    `INSERT INTO configuracion_web (id, datos, actualizado_en)
     VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET
       datos = EXCLUDED.datos,
       actualizado_en = NOW()`,
    [JSON.stringify(configuracion)]
  );
  return configuracion;
}

module.exports = {
  inicializarConfiguracion,
  obtenerConfiguracion,
  guardarConfiguracion,
};
