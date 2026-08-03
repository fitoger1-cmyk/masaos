const {
  pool,
} = require("../config/database");

function verificarPostgreSQL() {
  if (!pool) {
    const error = new Error(
      "PostgreSQL no está configurado."
    );

    error.codigo =
      "POSTGRES_NO_CONFIGURADO";

    throw error;
  }
}

function convertirNumero(valor) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : 0;
}

function convertirFecha(valor) {
  if (!valor) {
    return "";
  }

  return new Date(valor).toISOString();
}

function convertirDetalle(fila) {
  return {
    id: convertirNumero(fila.id),

    compraId:
      convertirNumero(
        fila.compra_id
      ),

    insumoId:
      fila.insumo_id !== null
        ? convertirNumero(
            fila.insumo_id
          )
        : null,

    ingrediente:
      fila.ingrediente || "",

    cantidad:
      convertirNumero(
        fila.cantidad
      ),

    unidad:
      fila.unidad || "",

    precioUnitario:
      convertirNumero(
        fila.precio_unitario
      ),

    subtotal:
      convertirNumero(
        fila.subtotal
      ),

    lote:
      fila.lote || "",

    fechaVencimiento:
      fila.fecha_vencimiento
        ? new Date(
            fila.fecha_vencimiento
          )
            .toISOString()
            .split("T")[0]
        : "",
  };
}

function convertirCompra(
  fila,
  items = []
) {
  return {
    id:
      convertirNumero(fila.id),

    numero:
      fila.numero || "",

    fecha:
      convertirFecha(fila.fecha),

    proveedor:
      fila.proveedor || "",

    proveedorId:
      fila.proveedor_id !== null
        ? convertirNumero(
            fila.proveedor_id
          )
        : null,

    usuarioId:
      fila.usuario_id !== null
        ? convertirNumero(
            fila.usuario_id
          )
        : null,

    usuarioNombre:
      fila.usuario_nombre || "",

    subtotal:
      convertirNumero(
        fila.subtotal
      ),

    descuento:
      convertirNumero(
        fila.descuento
      ),

    impuestos:
      convertirNumero(
        fila.impuestos
      ),

    total:
      convertirNumero(
        fila.total
      ),

    metodoPago:
      fila.metodo_pago || "",

    tipoDocumento:
      fila.tipo_documento || "",

    numeroFactura:
      fila.numero_factura || "",

    tipoComprobante:
      fila.tipo_documento || "",

    numeroComprobante:
      fila.numero_factura || "",

    observaciones:
      fila.observaciones || "",

    estado:
      fila.estado || "registrada",

    activo:
      Boolean(fila.activo),

    items,

    createdAt:
      convertirFecha(
        fila.created_at
      ),

    updatedAt:
      convertirFecha(
        fila.updated_at
      ),
  };
}

async function obtenerDetalleCompra(
  conexion,
  compraId
) {
  const resultado =
    await conexion.query(
      `
        SELECT
          id,
          compra_id,
          insumo_id,
          ingrediente,
          cantidad,
          unidad,
          precio_unitario,
          subtotal,
          lote,
          fecha_vencimiento
        FROM compra_detalle
        WHERE compra_id = $1
        ORDER BY id ASC
      `,
      [compraId]
    );

  return resultado.rows.map(
    convertirDetalle
  );
}

async function listarCompras() {
  verificarPostgreSQL();

  const resultado =
    await pool.query(`
      SELECT *
      FROM compras
      WHERE activo = TRUE
      ORDER BY fecha DESC, id DESC
    `);

  const compras = [];

  for (
    const fila
    of resultado.rows
  ) {
    const items =
      await obtenerDetalleCompra(
        pool,
        fila.id
      );

    compras.push(
      convertirCompra(
        fila,
        items
      )
    );
  }

  return compras;
}

async function buscarCompraPorId(
  compraId,
  conexion = pool
) {
  verificarPostgreSQL();

  const resultado =
    await conexion.query(
      `
        SELECT *
        FROM compras
        WHERE id = $1
        LIMIT 1
      `,
      [compraId]
    );

  if (
    resultado.rowCount === 0
  ) {
    return null;
  }

  const items =
    await obtenerDetalleCompra(
      conexion,
      compraId
    );

  return convertirCompra(
    resultado.rows[0],
    items
  );
}

async function crearCompra(
  datosCompra,
  items
) {
  verificarPostgreSQL();

  const conexion =
    await pool.connect();

  try {
    await conexion.query(
      "BEGIN"
    );

    const resultadoCompra =
      await conexion.query(
        `
          INSERT INTO compras (
            numero,
            fecha,
            proveedor,
            proveedor_id,
            usuario_id,
            usuario_nombre,
            subtotal,
            descuento,
            impuestos,
            total,
            metodo_pago,
            tipo_documento,
            numero_factura,
            observaciones,
            estado,
            activo,
            created_at,
            updated_at
          )
          VALUES (
            $1,
            COALESCE($2, NOW()),
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14,
            $15,
            TRUE,
            NOW(),
            NOW()
          )
          RETURNING id
        `,
        [
          datosCompra.numero ||
            null,

          datosCompra.fecha ||
            null,

          datosCompra.proveedor ||
            null,

          datosCompra.proveedorId ||
            null,

          datosCompra.usuarioId ||
            null,

          datosCompra.usuarioNombre ||
            null,

          datosCompra.subtotal,

          datosCompra.descuento,

          datosCompra.impuestos,

          datosCompra.total,

          datosCompra.metodoPago ||
            null,

          datosCompra.tipoDocumento ||
            null,

          datosCompra.numeroFactura ||
            null,

          datosCompra.observaciones ||
            null,

          datosCompra.estado ||
            "registrada",
        ]
      );

    const compraId =
      resultadoCompra.rows[0].id;

    for (
      const item
      of items
    ) {
      await conexion.query(
        `
          INSERT INTO compra_detalle (
            compra_id,
            insumo_id,
            ingrediente,
            cantidad,
            unidad,
            precio_unitario,
            subtotal,
            lote,
            fecha_vencimiento,
            created_at
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
            $9,
            NOW()
          )
        `,
        [
          compraId,

          item.insumoId ||
            null,

          item.ingrediente,

          item.cantidad,

          item.unidad ||
            null,

          item.precioUnitario,

          item.subtotal,

          item.lote ||
            null,

          item.fechaVencimiento ||
            null,
        ]
      );
    }

    await conexion.query(
      "COMMIT"
    );

    return buscarCompraPorId(
      compraId
    );
  } catch (error) {
    try {
      await conexion.query(
        "ROLLBACK"
      );
    } catch (
      errorRollback
    ) {
      console.error(
        "Error ejecutando ROLLBACK de compra:",
        errorRollback
      );
    }

    throw error;
  } finally {
    conexion.release();
  }
}

async function actualizarEstado(
  compraId,
  estado
) {
  verificarPostgreSQL();

  const resultado =
    await pool.query(
      `
        UPDATE compras
        SET
          estado = $1,
          updated_at = NOW()
        WHERE id = $2
          AND activo = TRUE
        RETURNING id
      `,
      [
        estado,
        compraId,
      ]
    );

  if (
    resultado.rowCount === 0
  ) {
    return null;
  }

  return buscarCompraPorId(
    compraId
  );
}

async function anularCompra(
  compraId
) {
  verificarPostgreSQL();

  const resultado =
    await pool.query(
      `
        UPDATE compras
        SET
          estado = 'anulada',
          activo = FALSE,
          updated_at = NOW()
        WHERE id = $1
          AND activo = TRUE
        RETURNING id
      `,
      [compraId]
    );

  if (
    resultado.rowCount === 0
  ) {
    return null;
  }

  return {
    id:
      convertirNumero(
        resultado.rows[0].id
      ),

    estado: "anulada",

    activo: false,
  };
}

async function obtenerUltimoNumeroCompra() {
  verificarPostgreSQL();

  const resultado =
    await pool.query(`
      SELECT
        COALESCE(
          MAX(id),
          0
        )::INTEGER AS ultimo
      FROM compras
    `);

  return (
    resultado.rows[0]?.ultimo ||
    0
  );
}

module.exports = {
  listarCompras,
  buscarCompraPorId,
  crearCompra,
  actualizarEstado,
  anularCompra,
  obtenerUltimoNumeroCompra,
};