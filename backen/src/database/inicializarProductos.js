const fs = require("fs");
const path = require("path");

const {
  pool,
} = require("../config/database");

const productosPath = path.join(
  __dirname,
  "..",
  "controllers",
  "productos.json"
);

async function inicializarProductos() {
  if (!pool) {
    console.log(
      "PostgreSQL no configurado: se mantienen productos en JSON."
    );

    return {
      configurada: false,
      cantidad: 0,
    };
  }

  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    await cliente.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        categoria VARCHAR(80) NOT NULL,
        precio NUMERIC(12, 2) NOT NULL DEFAULT 0,
        descripcion TEXT NOT NULL DEFAULT '',
        imagen TEXT NOT NULL DEFAULT '',
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const contenido = fs.readFileSync(
      productosPath,
      "utf8"
    );

    const productos = JSON.parse(contenido);

    for (const producto of productos) {
      await cliente.query(
        `
          INSERT INTO productos (
            id,
            nombre,
            categoria,
            precio,
            descripcion,
            imagen,
            activo
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          Number(producto.id),
          String(producto.nombre || "").trim(),
          String(producto.categoria || "").trim(),
          Number(producto.precio) || 0,
          String(producto.descripcion || "").trim(),
          String(producto.imagen || "").trim(),
          producto.activo !== false,
        ]
      );
    }

    await cliente.query(`
      SELECT SETVAL(
        PG_GET_SERIAL_SEQUENCE(
          'productos',
          'id'
        ),
        GREATEST(
          COALESCE(
            (SELECT MAX(id) FROM productos),
            0
          ),
          1
        ),
        EXISTS(
          SELECT 1 FROM productos
        )
      )
    `);

    const resultadoCantidad =
      await cliente.query(`
        SELECT COUNT(*)::INTEGER AS cantidad
        FROM productos
      `);

    await cliente.query("COMMIT");

    const cantidad =
      resultadoCantidad.rows[0].cantidad;

    console.log(
      `PostgreSQL: tabla productos lista con ${cantidad} registros.`
    );

    return {
      configurada: true,
      cantidad,
    };
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}

module.exports = {
  inicializarProductos,
};