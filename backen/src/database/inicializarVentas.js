const {
  pool,
} = require("../config/database");

async function inicializarVentas() {
  if (!pool) {
    console.warn(
      "Ventas: PostgreSQL no configurado; la tabla no se inicializará."
    );

    return;
  }

  try {
    /*
     * TABLA PRINCIPAL DE VENTAS
     */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ventas (
        id BIGSERIAL PRIMARY KEY,

        numero_venta VARCHAR(50),

        cliente VARCHAR(150)
          NOT NULL
          DEFAULT 'Mostrador',

        telefono VARCHAR(50)
          DEFAULT '',

        direccion TEXT
          DEFAULT '',

        tipo_pedido VARCHAR(50)
          NOT NULL
          DEFAULT 'Retiro',

        numero_mesa VARCHAR(50)
          DEFAULT '',

        cantidad INTEGER
          NOT NULL
          DEFAULT 0,

        subtotal NUMERIC(12, 2)
          NOT NULL
          DEFAULT 0,

        descuento NUMERIC(12, 2)
          NOT NULL
          DEFAULT 0,

        descuento_tipo VARCHAR(50)
          DEFAULT '',

        descuento_valor NUMERIC(12, 2)
          NOT NULL
          DEFAULT 0,

        total NUMERIC(12, 2)
          NOT NULL
          DEFAULT 0,

        forma_pago VARCHAR(80)
          DEFAULT '',

        monto_recibido NUMERIC(12, 2)
          NOT NULL
          DEFAULT 0,

        vuelto NUMERIC(12, 2)
          NOT NULL
          DEFAULT 0,

        estado VARCHAR(50)
          NOT NULL
          DEFAULT 'Nuevo',

        observaciones TEXT
          DEFAULT '',

        repartidor VARCHAR(150)
          DEFAULT '',

        repartidor_id VARCHAR(100)
          DEFAULT '',

        fecha_asignacion_repartidor
          TIMESTAMPTZ,

        hora_inicio_preparacion
          TIMESTAMPTZ,

        hora_listo
          TIMESTAMPTZ,

        hora_salida
          TIMESTAMPTZ,

        hora_entrega
          TIMESTAMPTZ,

        eta_minutos INTEGER
          NOT NULL
          DEFAULT 0,

        distancia_km NUMERIC(10, 2)
          NOT NULL
          DEFAULT 0,

        observaciones_delivery TEXT
          DEFAULT '',

        origen VARCHAR(50)
          NOT NULL
          DEFAULT 'Caja',

        fecha TIMESTAMPTZ
          NOT NULL
          DEFAULT NOW(),

        fecha_actualizacion TIMESTAMPTZ
          NOT NULL
          DEFAULT NOW(),

        created_at TIMESTAMPTZ
          NOT NULL
          DEFAULT NOW(),

        updated_at TIMESTAMPTZ
          NOT NULL
          DEFAULT NOW()
      );
    `);

    /*
     * DETALLE DE PRODUCTOS DE CADA VENTA
     */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS venta_detalle (
        id BIGSERIAL PRIMARY KEY,

        venta_id BIGINT
          NOT NULL
          REFERENCES ventas(id)
          ON DELETE CASCADE,

        producto_id VARCHAR(100),

        carrito_id VARCHAR(150),

        nombre VARCHAR(200)
          NOT NULL,

        cantidad INTEGER
          NOT NULL
          DEFAULT 1,

        precio_unitario NUMERIC(12, 2)
          NOT NULL
          DEFAULT 0,

        subtotal NUMERIC(12, 2)
          NOT NULL
          DEFAULT 0,

        observacion TEXT
          DEFAULT '',

        created_at TIMESTAMPTZ
          NOT NULL
          DEFAULT NOW()
      );
    `);

    /*
     * ÍNDICES PARA ACELERAR CONSULTAS
     */
    await pool.query(`
      CREATE INDEX IF NOT EXISTS
        idx_ventas_fecha
      ON ventas(fecha DESC);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
        idx_ventas_estado
      ON ventas(estado);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
        idx_ventas_cliente
      ON ventas(cliente);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
        idx_ventas_telefono
      ON ventas(telefono);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
        idx_venta_detalle_venta_id
      ON venta_detalle(venta_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
        idx_venta_detalle_producto_id
      ON venta_detalle(producto_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
        idx_venta_detalle_nombre
      ON venta_detalle(nombre);
    `);

    console.log(
      "Ventas: tablas ventas y venta_detalle listas."
    );
  } catch (error) {
    console.error(
      "Error inicializando las tablas de ventas:",
      error
    );

    throw error;
  }
}

module.exports = {
  inicializarVentas,
};