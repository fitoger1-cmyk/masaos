const fs = require("fs");
const path = require("path");

const {
  pool,
} = require("../config/database");

const insumosPath = path.join(
  __dirname,
  "../controllers/insumos.json"
);

function leerInsumosJson() {
  try {
    if (!fs.existsSync(insumosPath)) {
      console.warn(
        "Stock: no se encontró controllers/insumos.json."
      );

      return [];
    }

    const contenido = fs.readFileSync(
      insumosPath,
      "utf8"
    );

    const datos = JSON.parse(contenido);

    return Array.isArray(datos)
      ? datos
      : [];
  } catch (error) {
    console.error(
      "Stock: no se pudo leer insumos.json:",
      error
    );

    return [];
  }
}

function convertirNumero(
  valor,
  valorPredeterminado = 0
) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : valorPredeterminado;
}

function normalizarTexto(valor = "") {
  return String(valor ?? "").trim();
}

async function crearTablaStock(
  conexion
) {
  await conexion.query(`
    CREATE TABLE IF NOT EXISTS stock (
      id SERIAL PRIMARY KEY,

      ingrediente VARCHAR(120) NOT NULL,

      categoria VARCHAR(80),

      cantidad NUMERIC(14, 3)
        NOT NULL DEFAULT 0,

      unidad VARCHAR(30)
        NOT NULL DEFAULT 'unidad',

      stock_minimo NUMERIC(14, 3)
        NOT NULL DEFAULT 0,

      costo_compra NUMERIC(14, 2)
        NOT NULL DEFAULT 0,

      cantidad_compra NUMERIC(14, 3)
        NOT NULL DEFAULT 0,

      costo_unitario NUMERIC(14, 2)
        NOT NULL DEFAULT 0,

      proveedor VARCHAR(120),

      activo BOOLEAN
        NOT NULL DEFAULT TRUE,

      created_at TIMESTAMP
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMP
        NOT NULL DEFAULT NOW()
    )
  `);

  /*
   * Estas instrucciones permiten actualizar una
   * instalación anterior sin borrar información.
   */
  await conexion.query(`
    ALTER TABLE stock
    ADD COLUMN IF NOT EXISTS categoria
      VARCHAR(80)
  `);

  await conexion.query(`
    ALTER TABLE stock
    ADD COLUMN IF NOT EXISTS stock_minimo
      NUMERIC(14, 3)
      NOT NULL DEFAULT 0
  `);

  await conexion.query(`
    ALTER TABLE stock
    ADD COLUMN IF NOT EXISTS proveedor
      VARCHAR(120)
  `);

  await conexion.query(`
    ALTER TABLE stock
    ADD COLUMN IF NOT EXISTS activo
      BOOLEAN
      NOT NULL DEFAULT TRUE
  `);

  await conexion.query(`
    ALTER TABLE stock
    ADD COLUMN IF NOT EXISTS created_at
      TIMESTAMP
      NOT NULL DEFAULT NOW()
  `);

  await conexion.query(`
    ALTER TABLE stock
    ADD COLUMN IF NOT EXISTS updated_at
      TIMESTAMP
      NOT NULL DEFAULT NOW()
  `);

  /*
   * Evita tener dos insumos con el mismo nombre,
   * aunque estén escritos con mayúsculas distintas.
   */
  await conexion.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS
      stock_ingrediente_unico
    ON stock (
      LOWER(ingrediente)
    )
  `);
}

async function crearTablaMovimientos(
  conexion
) {
  await conexion.query(`
    CREATE TABLE IF NOT EXISTS
      stock_movimientos (
        id SERIAL PRIMARY KEY,

        stock_id INTEGER
          NOT NULL REFERENCES stock(id),

        tipo VARCHAR(30)
          NOT NULL,

        cantidad NUMERIC(14, 3)
          NOT NULL,

        cantidad_anterior NUMERIC(14, 3)
          NOT NULL DEFAULT 0,

        cantidad_nueva NUMERIC(14, 3)
          NOT NULL DEFAULT 0,

        motivo VARCHAR(200),

        referencia_tipo VARCHAR(50),

        referencia_id VARCHAR(80),

        usuario_id INTEGER,

        usuario_nombre VARCHAR(120),

        fecha TIMESTAMP
          NOT NULL DEFAULT NOW(),

        created_at TIMESTAMP
          NOT NULL DEFAULT NOW()
      )
  `);

  await conexion.query(`
    CREATE INDEX IF NOT EXISTS
      stock_movimientos_stock_id_idx
    ON stock_movimientos (
      stock_id
    )
  `);

  await conexion.query(`
    CREATE INDEX IF NOT EXISTS
      stock_movimientos_fecha_idx
    ON stock_movimientos (
      fecha DESC
    )
  `);
}

async function migrarInsumosJson(
  conexion
) {
  const insumos =
    leerInsumosJson();

  if (insumos.length === 0) {
    console.log(
      "Stock: no hay insumos JSON para migrar."
    );

    return 0;
  }

  let migrados = 0;

  for (const insumo of insumos) {
    const ingrediente =
      normalizarTexto(
        insumo.ingrediente
      );

    if (!ingrediente) {
      continue;
    }

    const id =
      Number.isInteger(
        Number(insumo.id)
      )
        ? Number(insumo.id)
        : null;

    const resultado =
      await conexion.query(
        `
          INSERT INTO stock (
            id,
            ingrediente,
            cantidad,
            unidad,
            costo_compra,
            cantidad_compra,
            costo_unitario,
            stock_minimo,
            activo,
            created_at,
            updated_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            TRUE,
            NOW(),
            NOW()
          )
          ON CONFLICT DO NOTHING
          RETURNING id
        `,
        [
          id,
          ingrediente,

          convertirNumero(
            insumo.cantidad
          ),

          normalizarTexto(
            insumo.unidad
          ) || "unidad",

          convertirNumero(
            insumo.costoCompra
          ),

          convertirNumero(
            insumo.cantidadCompra
          ),

          convertirNumero(
            insumo.costoUnitario
          ),

          convertirNumero(
            insumo.stockMinimo
          ),
        ]
      );

    if (resultado.rowCount > 0) {
      migrados += 1;
    }
  }

  /*
   * Como la migración conserva los ID del JSON,
   * actualizamos la secuencia automática.
   */
  await conexion.query(`
    SELECT setval(
      pg_get_serial_sequence(
        'stock',
        'id'
      ),
      COALESCE(
        (
          SELECT MAX(id)
          FROM stock
        ),
        1
      ),
      EXISTS(
        SELECT 1
        FROM stock
      )
    )
  `);

  return migrados;
}

async function inicializarStock() {
  if (!pool) {
    console.log(
      "Stock: PostgreSQL no configurado; se mantiene JSON."
    );

    return;
  }

  const conexion =
    await pool.connect();

  try {
    await conexion.query("BEGIN");

    await crearTablaStock(
      conexion
    );

    await crearTablaMovimientos(
      conexion
    );

    const migrados =
      await migrarInsumosJson(
        conexion
      );

    await conexion.query("COMMIT");

    const resultado =
      await pool.query(`
        SELECT COUNT(*)::INTEGER
          AS total
        FROM stock
      `);

    const total =
      resultado.rows[0]?.total ?? 0;

    console.log(
      `Stock: tablas listas con ${total} insumos. Migrados ahora: ${migrados}.`
    );
  } catch (error) {
    await conexion.query(
      "ROLLBACK"
    );

    console.error(
      "Stock: error inicializando PostgreSQL:",
      error
    );

    throw error;
  } finally {
    conexion.release();
  }
}

module.exports = {
  inicializarStock,
};