const {
  pool,
} = require("../config/database");

function verificarPostgreSQL() {
  if (!pool) {
    const error = new Error(
      "PostgreSQL no está configurado."
    );

    error.codigo = "POSTGRES_NO_CONFIGURADO";

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
    id:
      fila.producto_id || "",

    productoId:
      fila.producto_id || "",

    carritoId:
      fila.carrito_id || "",

    nombre:
      fila.nombre || "",

    cantidad:
      convertirNumero(fila.cantidad),

    precio:
      convertirNumero(
        fila.precio_unitario
      ),

    subtotal:
      convertirNumero(fila.subtotal),

    observacion:
      fila.observacion || "",
  };
}

function crearTextoProductos(productos) {
  return productos
    .map((producto) => {
      const base =
        `${producto.nombre} x${producto.cantidad}`;

      return producto.observacion
        ? `${base} (${producto.observacion})`
        : base;
    })
    .join(", ");
}

function convertirVenta(
  fila,
  productos = []
) {
  const fechaHora =
    convertirFecha(fila.fecha);

  const fechaActualizacion =
    convertirFecha(
      fila.fecha_actualizacion
    ) || fechaHora;

  return {
    id:
      convertirNumero(fila.id),

    numeroVenta:
      fila.numero_venta || "",

    cliente:
      fila.cliente || "Mostrador",

    telefono:
      fila.telefono || "",

    direccion:
      fila.direccion || "",

    tipoPedido:
      fila.tipo_pedido || "Retiro",

    numeroMesa:
      fila.numero_mesa || "",

    producto:
      crearTextoProductos(productos),

    productos,

    cantidad:
      convertirNumero(fila.cantidad),

    subtotal:
      convertirNumero(fila.subtotal),

    descuento:
      convertirNumero(fila.descuento),

    descuentoTipo:
      fila.descuento_tipo || "",

    descuentoValor:
      convertirNumero(
        fila.descuento_valor
      ),

    total:
      convertirNumero(fila.total),

    formaPago:
      fila.forma_pago || "",

    montoRecibido:
      convertirNumero(
        fila.monto_recibido
      ),

    vuelto:
      convertirNumero(fila.vuelto),

    fecha:
      fechaHora
        ? fechaHora.split("T")[0]
        : "",

    fechaHora,

    estado:
      fila.estado || "Nuevo",

    observaciones:
      fila.observaciones || "",

    repartidor:
      fila.repartidor || "",

    repartidorId:
      fila.repartidor_id || "",

    fechaAsignacionRepartidor:
      convertirFecha(
        fila.fecha_asignacion_repartidor
      ),

    horaInicioPreparacion:
      convertirFecha(
        fila.hora_inicio_preparacion
      ),

    horaListo:
      convertirFecha(
        fila.hora_listo
      ),

    horaSalida:
      convertirFecha(
        fila.hora_salida
      ),

    horaEntrega:
      convertirFecha(
        fila.hora_entrega
      ),

    etaMinutos:
      convertirNumero(
        fila.eta_minutos
      ),

    distanciaKm:
      convertirNumero(
        fila.distancia_km
      ),

    observacionesDelivery:
      fila.observaciones_delivery || "",

    origen:
      fila.origen || "Caja",

    fechaActualizacion,
  };
}

async function obtenerDetalleVenta(
  conexion,
  ventaId
) {
  const resultado =
    await conexion.query(
      `
        SELECT
          producto_id,
          carrito_id,
          nombre,
          cantidad,
          precio_unitario,
          subtotal,
          observacion
        FROM venta_detalle
        WHERE venta_id = $1
        ORDER BY id ASC
      `,
      [ventaId]
    );

  return resultado.rows.map(
    convertirDetalle
  );
}

async function listarVentas() {
  verificarPostgreSQL();

  const resultado =
    await pool.query(`
      SELECT *
      FROM ventas
      ORDER BY fecha DESC, id DESC
    `);

  const ventas = [];

  for (const fila of resultado.rows) {
    const productos =
      await obtenerDetalleVenta(
        pool,
        fila.id
      );

    ventas.push(
      convertirVenta(
        fila,
        productos
      )
    );
  }

  return ventas;
}

async function buscarVentaPorId(
  ventaId,
  conexion = pool
) {
  verificarPostgreSQL();

  const resultado =
    await conexion.query(
      `
        SELECT *
        FROM ventas
        WHERE id = $1
      `,
      [ventaId]
    );

  if (resultado.rowCount === 0) {
    return null;
  }

  const productos =
    await obtenerDetalleVenta(
      conexion,
      ventaId
    );

  return convertirVenta(
    resultado.rows[0],
    productos
  );
}

async function crearVenta(
  datosVenta,
  productos
) {
  verificarPostgreSQL();

  const conexion =
    await pool.connect();

  try {
    await conexion.query("BEGIN");

    const resultadoVenta =
      await conexion.query(
        `
          INSERT INTO ventas (
            numero_venta,
            cliente,
            telefono,
            direccion,
            tipo_pedido,
            numero_mesa,
            cantidad,
            subtotal,
            descuento,
            descuento_tipo,
            descuento_valor,
            total,
            forma_pago,
            monto_recibido,
            vuelto,
            estado,
            observaciones,
            repartidor,
            repartidor_id,
            origen,
            fecha,
            fecha_actualizacion,
            updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14,
            $15, $16, $17, $18,
            $19, $20, NOW(), NOW(),
            NOW()
          )
          RETURNING id
        `,
        [
          datosVenta.numeroVenta,
          datosVenta.cliente,
          datosVenta.telefono,
          datosVenta.direccion,
          datosVenta.tipoPedido,
          datosVenta.numeroMesa,
          datosVenta.cantidad,
          datosVenta.subtotal,
          datosVenta.descuento,
          datosVenta.descuentoTipo,
          datosVenta.descuentoValor,
          datosVenta.total,
          datosVenta.formaPago,
          datosVenta.montoRecibido,
          datosVenta.vuelto,
          datosVenta.estado,
          datosVenta.observaciones,
          datosVenta.repartidor,
          datosVenta.repartidorId,
          datosVenta.origen,
        ]
      );

    const ventaId =
      resultadoVenta.rows[0].id;

    for (const producto of productos) {
      await conexion.query(
        `
          INSERT INTO venta_detalle (
            venta_id,
            producto_id,
            carrito_id,
            nombre,
            cantidad,
            precio_unitario,
            subtotal,
            observacion
          )
          VALUES (
            $1, $2, $3, $4,
            $5, $6, $7, $8
          )
        `,
        [
          ventaId,
          producto.id,
          producto.carritoId,
          producto.nombre,
          producto.cantidad,
          producto.precio,
          producto.subtotal,
          producto.observacion,
        ]
      );
    }

    await conexion.query("COMMIT");

    return buscarVentaPorId(
      ventaId
    );
  } catch (error) {
    await conexion.query(
      "ROLLBACK"
    );

    throw error;
  } finally {
    conexion.release();
  }
}

async function actualizarVenta(
  ventaId,
  cambios
) {
  verificarPostgreSQL();

  const resultado =
    await pool.query(
      `
        UPDATE ventas
        SET
          estado = $1,
          repartidor = $2,
          repartidor_id = $3,
          fecha_asignacion_repartidor = $4,
          hora_salida = $5,
          hora_entrega = $6,
          eta_minutos = $7,
          distancia_km = $8,
          observaciones_delivery = $9,
          fecha_actualizacion = NOW(),
          updated_at = NOW()
        WHERE id = $10
        RETURNING id
      `,
      [
        cambios.estado,
        cambios.repartidor,
        cambios.repartidorId,
        cambios.fechaAsignacionRepartidor,
        cambios.horaSalida,
        cambios.horaEntrega,
        cambios.etaMinutos,
        cambios.distanciaKm,
        cambios.observacionesDelivery,
        ventaId,
      ]
    );

  if (resultado.rowCount === 0) {
    return null;
  }

  return buscarVentaPorId(
    ventaId
  );
}

async function actualizarEstado(
  ventaId,
  estado
) {
  verificarPostgreSQL();

  const resultado =
    await pool.query(
      `
        UPDATE ventas
        SET
          estado = $1,

          hora_inicio_preparacion =
            CASE
              WHEN $1 IN (
                'Preparando',
                'En preparación'
              )
              THEN COALESCE(
                hora_inicio_preparacion,
                NOW()
              )
              ELSE hora_inicio_preparacion
            END,

          hora_listo =
            CASE
              WHEN $1 = 'Listo'
              THEN COALESCE(
                hora_listo,
                NOW()
              )
              ELSE hora_listo
            END,

          hora_salida =
            CASE
              WHEN $1 IN (
                'En reparto',
                'En camino'
              )
              THEN COALESCE(
                hora_salida,
                NOW()
              )
              ELSE hora_salida
            END,

          hora_entrega =
            CASE
              WHEN $1 = 'Entregado'
              THEN COALESCE(
                hora_entrega,
                NOW()
              )
              ELSE hora_entrega
            END,

          fecha_actualizacion = NOW(),
          updated_at = NOW()

        WHERE id = $2
        RETURNING id
      `,
      [
        estado,
        ventaId,
      ]
    );

  if (resultado.rowCount === 0) {
    return null;
  }

  return buscarVentaPorId(
    ventaId
  );
}

module.exports = {
  listarVentas,
  buscarVentaPorId,
  crearVenta,
  actualizarVenta,
  actualizarEstado,
};