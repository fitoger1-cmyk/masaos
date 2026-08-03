const comprasRepository = require("../repositories/comprasRepository");
const stockService = require("./stockService");

function crearError(mensaje, status = 400) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

function numeroSeguro(valor, defecto = 0) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : defecto;
}

function textoSeguro(valor) {
  return String(valor ?? "").trim();
}

function validarFecha(valor) {
  const texto = textoSeguro(valor);

  if (!texto) {
    return null;
  }

  const fecha = new Date(texto);

  if (Number.isNaN(fecha.getTime())) {
    throw crearError(
      "La fecha de la compra no es válida."
    );
  }

  return fecha.toISOString();
}

function prepararItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw crearError(
      "La compra debe contener al menos un insumo."
    );
  }

  return items.map((item, indice) => {
    const ingrediente = textoSeguro(
      item.ingrediente
    );

    if (!ingrediente) {
      throw crearError(
        `El ingrediente del ítem ${indice + 1} es obligatorio.`
      );
    }

    const cantidad = numeroSeguro(
      item.cantidad
    );

    if (cantidad <= 0) {
      throw crearError(
        `La cantidad de ${ingrediente} debe ser mayor que cero.`
      );
    }

    const precioTotal = numeroSeguro(
      item.precio ??
      item.subtotal
    );

    const precioUnitarioRecibido =
      numeroSeguro(
        item.precioUnitario
      );

    let precioUnitario =
      precioUnitarioRecibido;

    let subtotal =
      numeroSeguro(
        item.subtotal
      );

    if (
      precioUnitario <= 0 &&
      precioTotal > 0
    ) {
      precioUnitario =
        precioTotal / cantidad;
    }

    if (subtotal <= 0) {
      subtotal =
        precioUnitario * cantidad;
    }

    if (precioUnitario < 0 || subtotal < 0) {
      throw crearError(
        `El precio de ${ingrediente} no puede ser negativo.`
      );
    }

    return {
      insumoId:
        item.insumoId !== undefined &&
        item.insumoId !== null &&
        item.insumoId !== ""
          ? Number(item.insumoId)
          : null,

      ingrediente,

      cantidad,

      unidad:
        textoSeguro(item.unidad) ||
        "unidad",

      precioUnitario:
        Number(
          precioUnitario.toFixed(4)
        ),

      subtotal:
        Number(
          subtotal.toFixed(2)
        ),

      lote:
        textoSeguro(item.lote) ||
        null,

      fechaVencimiento:
        textoSeguro(
          item.fechaVencimiento
        ) || null,
    };
  });
}

function prepararCompra(body = {}, usuario = null) {
  const proveedor = textoSeguro(
    body.proveedor
  );

  if (!proveedor) {
    throw crearError(
      "El proveedor es obligatorio."
    );
  }

  const items = prepararItems(
    body.items
  );

  const subtotalCalculado =
    items.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );

  const descuento = Math.max(
    numeroSeguro(
      body.descuento
    ),
    0
  );

  const impuestos = Math.max(
    numeroSeguro(
      body.impuestos
    ),
    0
  );

  const totalCalculado =
    subtotalCalculado -
    descuento +
    impuestos;

  return {
    datosCompra: {
      numero:
        textoSeguro(body.numero) ||
        null,

      fecha:
        validarFecha(body.fecha),

      proveedor,

      proveedorId:
        body.proveedorId !== undefined &&
        body.proveedorId !== null &&
        body.proveedorId !== ""
          ? Number(body.proveedorId)
          : null,

      usuarioId:
        usuario?.id || null,

      usuarioNombre:
        usuario?.nombre ||
        usuario?.usuario ||
        "",

      subtotal:
        Number(
          subtotalCalculado.toFixed(2)
        ),

      descuento:
        Number(
          descuento.toFixed(2)
        ),

      impuestos:
        Number(
          impuestos.toFixed(2)
        ),

      total:
        Number(
          totalCalculado.toFixed(2)
        ),

      metodoPago:
        textoSeguro(
          body.metodoPago
        ),

      tipoDocumento:
        textoSeguro(
          body.tipoDocumento ??
          body.tipoComprobante
        ),

      numeroFactura:
        textoSeguro(
          body.numeroFactura ??
          body.numeroComprobante
        ),

      observaciones:
        textoSeguro(
          body.observaciones
        ),

      estado: "registrada",
    },

    items,
  };
}

async function resolverItemsStock(items) {
  const stockActual =
    await stockService.listarStock();

  return items.map((item) => {
    let insumo = null;

    if (item.insumoId) {
      insumo = stockActual.find(
        (actual) =>
          Number(actual.id) ===
          Number(item.insumoId)
      );
    }

    if (!insumo) {
      const nombreBuscado =
        textoSeguro(
          item.ingrediente
        ).toLowerCase();

      insumo = stockActual.find(
        (actual) =>
          textoSeguro(
            actual.ingrediente
          ).toLowerCase() ===
          nombreBuscado
      );
    }

    if (!insumo) {
      throw crearError(
        `El insumo ${item.ingrediente} no existe en Stock.`,
        404
      );
    }

    return {
      ...item,
      insumoId: insumo.id,
      ingrediente: insumo.ingrediente,
      unidad:
        item.unidad ||
        insumo.unidad ||
        "unidad",
      insumoActual: insumo,
    };
  });
}

async function listarCompras() {
  return comprasRepository
    .listarCompras();
}

async function obtenerCompra(id) {
  const compraId = Number(id);

  if (
    !Number.isInteger(compraId) ||
    compraId <= 0
  ) {
    throw crearError(
      "El ID de la compra no es válido."
    );
  }

  const compra =
    await comprasRepository
      .buscarCompraPorId(
        compraId
      );

  if (!compra) {
    throw crearError(
      "La compra no existe.",
      404
    );
  }

  return compra;
}

async function crearCompra({
  body,
  usuario,
}) {
  const {
    datosCompra,
    items,
  } = prepararCompra(body);

  /*
   * Validamos todos los insumos antes
   * de guardar la compra.
   */
  const itemsResueltos =
    await resolverItemsStock(
      items
    );

  const numeroActual =
    await comprasRepository
      .obtenerUltimoNumeroCompra();

  if (!datosCompra.numero) {
    datosCompra.numero =
      `COMP-${String(
        numeroActual + 1
      ).padStart(6, "0")}`;
  }

  datosCompra.usuarioId =
    usuario?.id || null;

  datosCompra.usuarioNombre =
    usuario?.nombre ||
    usuario?.usuario ||
    "";

  const itemsParaGuardar =
    itemsResueltos.map(
      ({
        insumoActual,
        ...item
      }) => item
    );

  const nuevaCompra =
    await comprasRepository
      .crearCompra(
        datosCompra,
        itemsParaGuardar
      );

  /*
   * Una vez registrada la compra,
   * aumentamos Stock PostgreSQL y
   * registramos stock_movimientos.
   */
  for (
    const item
    of itemsResueltos
  ) {
    await stockService.sumarStock(
      item.insumoId,
      {
        tipo: "compra",

        cantidad:
          item.cantidad,

        motivo:
          `Ingreso por compra ${nuevaCompra.numero || `#${nuevaCompra.id}`}`,

        referenciaTipo:
          "compra",

        referenciaId:
          nuevaCompra.id,

        usuarioId:
          usuario?.id || null,

        usuarioNombre:
          usuario?.nombre ||
          usuario?.usuario ||
          "Sistema",
      }
    );
  }

  return nuevaCompra;
}

module.exports = {
  prepararCompra,
  listarCompras,
  obtenerCompra,
  crearCompra,
};