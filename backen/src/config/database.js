const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

const esConexionLocal =
  databaseUrl?.includes("localhost") ||
  databaseUrl?.includes("127.0.0.1");

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: esConexionLocal
        ? false
        : {
            rejectUnauthorized: false,
          },
    })
  : null;

async function verificarConexionBD() {
  if (!pool) {
    return {
      ok: false,
      configurada: false,
      mensaje:
        "DATABASE_URL no está configurada.",
    };
  }

  const resultado = await pool.query(`
    SELECT
      NOW() AS fecha_hora,
      CURRENT_DATABASE() AS base_datos,
      VERSION() AS version
  `);

  return {
    ok: true,
    configurada: true,
    baseDatos: resultado.rows[0].base_datos,
    fechaHora: resultado.rows[0].fecha_hora,
    version: resultado.rows[0].version,
  };
}

module.exports = {
  pool,
  verificarConexionBD,
};