const stockRepository = require("../repositories/stockRepository");

function crearError(mensaje, status = 400) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

function convertirNumero(valor, nombreCampo, valorPredeterminado = 0) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return valorPredeterminado;
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    throw crearError(
      `${nombreCampo} debe ser un número válido.`
    );
  }

  return numero;
}

function normalizarTexto(valor) {
  return String(valor ?? "").trim();
}

function validarId(id) {
  const idNumerico = Number(id);

  if (
    !Number.isInteger(idNumerico) ||
    idNumerico <= 0
  ) {
    throw crearError(
      "El ID del insumo no es válido."
    );
  }

  return idNumerico;
}

function validarTipoMovimiento(tipo) {
  const tiposPermitidos = [
    "entrada",
    "salida",
    "ajuste",
    "compra",
    "venta",
    "produccion",
    "merma",
    "devolucion",
  ];

  const tipoNormalizado = normalizarTexto(tipo)
    .toLowerCase();

  if (!tiposPermitidos.includes(tipoNormalizado)) {
    throw crearError(
      `Tipo de movimiento inválido. Permitidos: ${tiposPermitidos.join(
        ", "
      )}.`
    );
  }

  return tipoNormalizado;
}

function calcularCostoUnitario({
  costoCompra,
  cantidadCompra,
  costoUnitario,
}) {
  const costoUnitarioRecibido =
    convertirNumero(
      costoUnitario,
      "El costo unitario",
      0
    );

  if (costoUnitarioRecibido > 0) {
    return costoUnitarioRecibido;
  }

  const costoCompraNumerico =
    convertirNumero(
      costoCompra,
      "El costo de compra",
      0
    );

  const cantidadCompraNumerica =
    convertirNumero(
      cantidadCompra,
      "La cantidad de compra",
      0
    );

  if (
    costoCompraNumerico > 0 &&
    cantidadCompraNumerica > 0
  ) {
    return Number(
      (
        costoCompraNumerico /
        cantidadCompraNumerica
      ).toFixed(2)
    );
  }

  return 0;
}

function prepararDatosInsumo(datos = {}, insumoActual = null) {
  const ingrediente = normalizarTexto(
    datos.ingrediente ??
      insumoActual?.ingrediente
  );

  if (!ingrediente) {
    throw crearError(
      "El nombre del ingrediente es obligatorio."
    );
  }

  const unidad = normalizarTexto(
    datos.unidad ??
      insumoActual?.unidad ??
      "unidad"
  );

  if (!unidad) {
    throw crearError(
      "La unidad del ingrediente es obligatoria."
    );
  }

  const cantidad = convertirNumero(
    datos.cantidad ??
      insumoActual?.cantidad,
    "La cantidad",
    0
  );

  const stockMinimo = convertirNumero(
    datos.stockMinimo ??
      insumoActual?.stockMinimo,
    "El stock mínimo",
    0
  );

  const costoCompra = convertirNumero(
    datos.costoCompra ??
      insumoActual?.costoCompra,
    "El costo de compra",
    0
  );

  const cantidadCompra = convertirNumero(
    datos.cantidadCompra ??
      insumoActual?.cantidadCompra,
    "La cantidad de compra",
    0
  );

  const costoUnitario = calcularCostoUnitario({
    costoCompra,
    cantidadCompra,
    costoUnitario:
      datos.costoUnitario ??
      insumoActual?.costoUnitario,
  });

  if (cantidad < 0) {
    throw crearError(
      "La cantidad no puede ser negativa."
    );
  }

  if (stockMinimo < 0) {
    throw crearError(
      "El stock mínimo no puede ser negativo."
    );
  }

  if (costoCompra < 0) {
    throw crearError(
      "El costo de compra no puede ser negativo."
    );
  }

  if (cantidadCompra < 0) {
    throw crearError(
      "La cantidad de compra no puede ser negativa."
    );
  }

  if (costoUnitario < 0) {
    throw crearError(
      "El costo unitario no puede ser negativo."
    );
  }

  return {
    ingrediente,
    categoria:
      normalizarTexto(
        datos.categoria ??
          insumoActual?.categoria
      ) || null,

    cantidad,
    unidad,
    stockMinimo,
    costoCompra,
    cantidadCompra,
    costoUnitario,

    proveedor:
      normalizarTexto(
        datos.proveedor ??
          insumoActual?.proveedor
      ) || null,
  };
}

function agregarEstadoStock(insumo) {
  const cantidad = Number(insumo.cantidad);
  const stockMinimo = Number(
    insumo.stockMinimo
  );

  let estadoStock = "disponible";

  if (cantidad <= 0) {
    estadoStock = "sin_stock";
  } else if (
    stockMinimo > 0 &&
    cantidad <= stockMinimo
  ) {
    estadoStock = "critico";
  }

  return {
    ...insumo,
    stockCritico: estadoStock !== "disponible",
    estadoStock,
  };
}

async function listarStock() {
  const stock =
    await stockRepository.listarStock();

  return stock.map(agregarEstadoStock);
}

async function obtenerInsumo(id) {
  const idNumerico = validarId(id);

  const insumo =
    await stockRepository.buscarInsumoPorId(
      idNumerico
    );

  if (!insumo || !insumo.activo) {
    throw crearError(
      "El insumo no existe.",
      404
    );
  }

  return agregarEstadoStock(insumo);
}

async function crearInsumo(datos) {
  const datosPreparados =
    prepararDatosInsumo(datos);

  const insumoExistente =
    await stockRepository.buscarInsumoPorNombre(
      datosPreparados.ingrediente
    );

  if (
    insumoExistente &&
    insumoExistente.activo
  ) {
    throw crearError(
      "Ya existe un insumo con ese nombre.",
      409
    );
  }

  const nuevoInsumo =
    await stockRepository.crearInsumo(
      datosPreparados
    );

  if (nuevoInsumo.cantidad > 0) {
    await stockRepository.registrarMovimiento({
      stockId: nuevoInsumo.id,
      tipo: "entrada",
      cantidad: nuevoInsumo.cantidad,
      cantidadAnterior: 0,
      cantidadNueva: nuevoInsumo.cantidad,
      motivo: "Stock inicial",
      referenciaTipo: "alta_insumo",
      referenciaId: String(nuevoInsumo.id),
      usuarioId: datos.usuarioId || null,
      usuarioNombre:
        normalizarTexto(
          datos.usuarioNombre
        ) || null,
    });
  }

  return agregarEstadoStock(nuevoInsumo);
}

async function editarInsumo(id, datos) {
  const idNumerico = validarId(id);

  const insumoActual =
    await stockRepository.buscarInsumoPorId(
      idNumerico
    );

  if (!insumoActual || !insumoActual.activo) {
    throw crearError(
      "El insumo no existe.",
      404
    );
  }

  const datosPreparados =
    prepararDatosInsumo(
      datos,
      insumoActual
    );

  const insumoConMismoNombre =
    await stockRepository.buscarInsumoPorNombre(
      datosPreparados.ingrediente
    );

  if (
    insumoConMismoNombre &&
    insumoConMismoNombre.id !== idNumerico &&
    insumoConMismoNombre.activo
  ) {
    throw crearError(
      "Ya existe otro insumo con ese nombre.",
      409
    );
  }

  const cantidadAnterior = Number(
    insumoActual.cantidad
  );

  const insumoActualizado =
    await stockRepository.actualizarInsumo(
      idNumerico,
      datosPreparados
    );

  if (
    Number(insumoActualizado.cantidad) !==
    cantidadAnterior
  ) {
    await stockRepository.registrarMovimiento({
      stockId: idNumerico,
      tipo: "ajuste",
      cantidad: Math.abs(
        Number(insumoActualizado.cantidad) -
          cantidadAnterior
      ),
      cantidadAnterior,
      cantidadNueva: Number(
        insumoActualizado.cantidad
      ),
      motivo:
        normalizarTexto(datos.motivo) ||
        "Edición manual del insumo",
      referenciaTipo: "edicion",
      referenciaId: String(idNumerico),
      usuarioId: datos.usuarioId || null,
      usuarioNombre:
        normalizarTexto(
          datos.usuarioNombre
        ) || null,
    });
  }

  return agregarEstadoStock(
    insumoActualizado
  );
}

async function aplicarMovimiento({
  id,
  tipo,
  cantidad,
  motivo,
  referenciaTipo,
  referenciaId,
  usuarioId,
  usuarioNombre,
  permitirStockNegativo = false,
}) {
  const idNumerico = validarId(id);
  const tipoNormalizado =
    validarTipoMovimiento(tipo);

  const cantidadNumerica =
    convertirNumero(
      cantidad,
      "La cantidad"
    );

  if (cantidadNumerica <= 0) {
    throw crearError(
      "La cantidad del movimiento debe ser mayor que cero."
    );
  }

  const insumo =
    await stockRepository.buscarInsumoPorId(
      idNumerico
    );

  if (!insumo || !insumo.activo) {
    throw crearError(
      "El insumo no existe.",
      404
    );
  }

  const cantidadAnterior = Number(
    insumo.cantidad
  );

  const movimientosDeEntrada = [
    "entrada",
    "compra",
    "devolucion",
  ];

  const movimientosDeSalida = [
    "salida",
    "venta",
    "produccion",
    "merma",
  ];

  let cantidadNueva;

  if (
    movimientosDeEntrada.includes(
      tipoNormalizado
    )
  ) {
    cantidadNueva =
      cantidadAnterior +
      cantidadNumerica;
  } else if (
    movimientosDeSalida.includes(
      tipoNormalizado
    )
  ) {
    cantidadNueva =
      cantidadAnterior -
      cantidadNumerica;
  } else {
    throw crearError(
      "Para un ajuste debe utilizarse ajustarStock()."
    );
  }

  if (
    cantidadNueva < 0 &&
    !permitirStockNegativo
  ) {
    throw crearError(
      `Stock insuficiente de ${insumo.ingrediente}. Disponible: ${cantidadAnterior} ${insumo.unidad}.`,
      409
    );
  }

  const insumoActualizado =
    await stockRepository.actualizarCantidad(
      idNumerico,
      cantidadNueva
    );

  await stockRepository.registrarMovimiento({
    stockId: idNumerico,
    tipo: tipoNormalizado,
    cantidad: cantidadNumerica,
    cantidadAnterior,
    cantidadNueva,
    motivo:
      normalizarTexto(motivo) ||
      `Movimiento de ${tipoNormalizado}`,
    referenciaTipo:
      normalizarTexto(referenciaTipo) ||
      null,
    referenciaId:
      referenciaId !== undefined &&
      referenciaId !== null
        ? String(referenciaId)
        : null,
    usuarioId: usuarioId || null,
    usuarioNombre:
      normalizarTexto(usuarioNombre) ||
      null,
  });

  return agregarEstadoStock(
    insumoActualizado
  );
}

async function sumarStock(id, datos = {}) {
  return aplicarMovimiento({
    id,
    tipo: datos.tipo || "entrada",
    cantidad: datos.cantidad,
    motivo: datos.motivo,
    referenciaTipo:
      datos.referenciaTipo,
    referenciaId: datos.referenciaId,
    usuarioId: datos.usuarioId,
    usuarioNombre: datos.usuarioNombre,
  });
}

async function descontarStock(id, datos = {}) {
  return aplicarMovimiento({
    id,
    tipo: datos.tipo || "salida",
    cantidad: datos.cantidad,
    motivo: datos.motivo,
    referenciaTipo:
      datos.referenciaTipo,
    referenciaId: datos.referenciaId,
    usuarioId: datos.usuarioId,
    usuarioNombre: datos.usuarioNombre,
    permitirStockNegativo:
      Boolean(
        datos.permitirStockNegativo
      ),
  });
}

async function ajustarStock(id, datos = {}) {
  const idNumerico = validarId(id);

  const nuevaCantidad =
    convertirNumero(
      datos.cantidad,
      "La nueva cantidad"
    );

  if (nuevaCantidad < 0) {
    throw crearError(
      "La nueva cantidad no puede ser negativa."
    );
  }

  const insumo =
    await stockRepository.buscarInsumoPorId(
      idNumerico
    );

  if (!insumo || !insumo.activo) {
    throw crearError(
      "El insumo no existe.",
      404
    );
  }

  const cantidadAnterior = Number(
    insumo.cantidad
  );

  const insumoActualizado =
    await stockRepository.actualizarCantidad(
      idNumerico,
      nuevaCantidad
    );

  await stockRepository.registrarMovimiento({
    stockId: idNumerico,
    tipo: "ajuste",
    cantidad: Math.abs(
      nuevaCantidad -
        cantidadAnterior
    ),
    cantidadAnterior,
    cantidadNueva: nuevaCantidad,
    motivo:
      normalizarTexto(datos.motivo) ||
      "Ajuste manual de stock",
    referenciaTipo:
      normalizarTexto(
        datos.referenciaTipo
      ) || "ajuste_manual",
    referenciaId:
      datos.referenciaId !== undefined &&
      datos.referenciaId !== null
        ? String(datos.referenciaId)
        : null,
    usuarioId: datos.usuarioId || null,
    usuarioNombre:
      normalizarTexto(
        datos.usuarioNombre
      ) || null,
  });

  return agregarEstadoStock(
    insumoActualizado
  );
}

async function eliminarInsumo(id) {
  const idNumerico = validarId(id);

  const insumo =
    await stockRepository.buscarInsumoPorId(
      idNumerico
    );

  if (!insumo || !insumo.activo) {
    throw crearError(
      "El insumo no existe.",
      404
    );
  }

  await stockRepository.eliminarInsumo(
    idNumerico
  );

  return {
    mensaje: "Insumo desactivado correctamente.",
    id: idNumerico,
  };
}

async function obtenerAlertasStock() {
  const stock = await listarStock();

  return stock.filter(
    (insumo) => insumo.stockCritico
  );
}

module.exports = {
  listarStock,
  obtenerInsumo,
  crearInsumo,
  editarInsumo,
  eliminarInsumo,
  sumarStock,
  descontarStock,
  ajustarStock,
  obtenerAlertasStock,
};