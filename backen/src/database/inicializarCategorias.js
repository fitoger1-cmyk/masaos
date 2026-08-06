const fs = require("fs");
const path = require("path");
const { pool } = require("../config/database");

const categoriasPath = path.join(
  __dirname,
  "..",
  "controllers",
  "categorias.json"
);

async function inicializarCategorias() {
  if (!pool) {
    console.log(
      "Categorías: PostgreSQL no configurado; se utilizará JSON."
    );
    return { configurada: false, cantidad: 0 };
  }

  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");
    await cliente.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(80) NOT NULL,
        descripcion TEXT NOT NULL DEFAULT '',
        imagen TEXT NOT NULL DEFAULT '',
        icono VARCHAR(20) NOT NULL DEFAULT '',
        orden INTEGER NOT NULL DEFAULT 0,
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await cliente.query(`
      ALTER TABLE categorias ALTER COLUMN icono SET DEFAULT ''
    `);

    await cliente.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS categorias_nombre_unico
      ON categorias (LOWER(nombre))
    `);

    const categorias = JSON.parse(
      fs.readFileSync(categoriasPath, "utf8")
    );

    for (const categoria of categorias) {
      await cliente.query(
        `
          INSERT INTO categorias (
            nombre, descripcion, imagen, icono, orden, activo
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (LOWER(nombre)) DO NOTHING
        `,
        [
          String(categoria.nombre || "").trim(),
          String(categoria.descripcion || "").trim(),
          String(categoria.imagen || "").trim(),
          String(categoria.icono || "").trim(),
          Number(categoria.orden) || 0,
          categoria.activo !== false,
        ]
      );
    }

    await cliente.query(`
      INSERT INTO categorias (nombre, orden)
      SELECT DISTINCT
        TRIM(categoria),
        COALESCE((SELECT MAX(orden) FROM categorias), 0) +
          ROW_NUMBER() OVER (ORDER BY TRIM(categoria))
      FROM productos
      WHERE TRIM(COALESCE(categoria, '')) <> ''
      ON CONFLICT (LOWER(nombre)) DO NOTHING
    `);

    const resultado = await cliente.query(`
      SELECT COUNT(*)::INTEGER AS cantidad FROM categorias
    `);

    await cliente.query("COMMIT");
    const cantidad = resultado.rows[0].cantidad;
    console.log(
      `Categorías: tabla lista con ${cantidad} registros.`
    );
    return { configurada: true, cantidad };
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}

module.exports = { inicializarCategorias };
