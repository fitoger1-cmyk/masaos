const fs = require("fs");
const path = require("path");

const { pool } = require("../config/database");

const configuracionPath = path.join(
  __dirname,
  "..",
  "controllers",
  "configuracion.json"
);

async function inicializarConfiguracionWeb() {
  if (!pool) {
    console.log(
      "PostgreSQL no configurado: configuración web continúa en JSON."
    );

    return {
      configurada: false,
    };
  }

  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    await cliente.query(`
      CREATE TABLE IF NOT EXISTS configuracion_web (
        id INTEGER PRIMARY KEY,
        datos JSONB NOT NULL,
        creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const existe = await cliente.query(`
      SELECT id
      FROM configuracion_web
      WHERE id = 1
    `);

    if (existe.rows.length === 0) {
      const contenido = fs.readFileSync(
        configuracionPath,
        "utf8"
      );

      const configuracion =
        JSON.parse(contenido);

      await cliente.query(
        `
          INSERT INTO configuracion_web
          (
            id,
            datos
          )
          VALUES
          (
            1,
            $1
          )
        `,
        [configuracion]
      );

      console.log(
        "Configuración web migrada a PostgreSQL."
      );
    }

    await cliente.query("COMMIT");

    return {
      configurada: true,
    };
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}

module.exports = {
  inicializarConfiguracionWeb,
};