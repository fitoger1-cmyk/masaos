const { pool } = require("../config/database");

async function inicializarCompras() {
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    /*
     * Encabezado de la compra
     */

    await cliente.query(`
      CREATE TABLE IF NOT EXISTS compras (
        id SERIAL PRIMARY KEY,

        numero VARCHAR(100),
        fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        proveedor VARCHAR(255),
        proveedor_id INTEGER,

        usuario_id INTEGER,
        usuario_nombre VARCHAR(255),

        subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
        descuento NUMERIC(14, 2) NOT NULL DEFAULT 0,
        impuestos NUMERIC(14, 2) NOT NULL DEFAULT 0,
        total NUMERIC(14, 2) NOT NULL DEFAULT 0,

        metodo_pago VARCHAR(100),

        tipo_documento VARCHAR(50),
        numero_factura VARCHAR(150),

        observaciones TEXT,

        estado VARCHAR(50) NOT NULL DEFAULT 'registrada',
        activo BOOLEAN NOT NULL DEFAULT TRUE,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    /*
     * Productos o insumos incluidos en cada compra
     */
    await cliente.query(`
      CREATE TABLE IF NOT EXISTS compra_detalle (
        id SERIAL PRIMARY KEY,

        compra_id INTEGER NOT NULL
          REFERENCES compras(id)
          ON DELETE CASCADE,

        insumo_id INTEGER,
        ingrediente VARCHAR(255) NOT NULL,

        cantidad NUMERIC(14, 3) NOT NULL DEFAULT 0,
        unidad VARCHAR(50),

        precio_unitario NUMERIC(14, 4) NOT NULL DEFAULT 0,
        subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,

        lote VARCHAR(150),
        fecha_vencimiento DATE,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await cliente.query(`
  ALTER TABLE compras
  ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(50);
`);

await cliente.query(`
  ALTER TABLE compras
  ADD COLUMN IF NOT EXISTS numero_factura VARCHAR(150);
`);

    /*
     * Índices para mejorar las búsquedas
     */
    await cliente.query(`
      CREATE INDEX IF NOT EXISTS idx_compras_fecha
      ON compras(fecha DESC);
    `);

    await cliente.query(`
      CREATE INDEX IF NOT EXISTS idx_compras_proveedor
      ON compras(proveedor);
    `);

    await cliente.query(`
      CREATE INDEX IF NOT EXISTS idx_compras_estado
      ON compras(estado);
    `);

    await cliente.query(`
      CREATE INDEX IF NOT EXISTS idx_compra_detalle_compra_id
      ON compra_detalle(compra_id);
    `);

    await cliente.query(`
      CREATE INDEX IF NOT EXISTS idx_compra_detalle_insumo_id
      ON compra_detalle(insumo_id);
    `);

    await cliente.query(`
      CREATE INDEX IF NOT EXISTS idx_compra_detalle_ingrediente
      ON compra_detalle(ingrediente);
    `);

    const resultadoCompras = await cliente.query(`
      SELECT COUNT(*)::INTEGER AS cantidad
      FROM compras
      WHERE activo = TRUE;
    `);

    const resultadoDetalles = await cliente.query(`
      SELECT COUNT(*)::INTEGER AS cantidad
      FROM compra_detalle;
    `);

    await cliente.query("COMMIT");

    const cantidadCompras =
      resultadoCompras.rows[0]?.cantidad || 0;

    const cantidadDetalles =
      resultadoDetalles.rows[0]?.cantidad || 0;

    console.log(
      `Compras: tablas listas con ${cantidadCompras} compras y ${cantidadDetalles} detalles.`
    );
  } catch (error) {
    await cliente.query("ROLLBACK");

    console.error(
      "Error inicializando las tablas de compras:",
      error
    );

    throw error;
  } finally {
    cliente.release();
  }
}

module.exports = {
  inicializarCompras,
};