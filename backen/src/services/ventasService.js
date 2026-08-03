const fs = require("fs");

const ventasRepository = require(
  "../repositories/ventasRepository"
);
const stockService = require(
  "./stockService"
);

const estadosPermitidos = [
  "Nuevo",
  "Preparando",
  "En preparación",
  "Listo",
  "En reparto",
  "En camino",
  "Entregado",
  "Cancelado",
];

function normalizarTexto(valor = "") {
  return String(valor ?? "").trim();
}

function normalizarClave(valor = "") {
  return normalizarTexto(valor).toLowerCase();
}

function numeroSeguro(
  valor,
  valorPredeterminado = 0
) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : valorPredeterminado;
}

function fechaOpcional(valor) {
  const texto = normalizarTexto(valor);

  return texto || null;
}

function guardarJson(ruta, datos) {
  fs.writeFileSync(
    ruta,
    JSON.stringify(datos, null, 2),
    "utf8"
  );
}

function obtenerProductosVendidos(body) {
  if (
    Array.isArray(body.productos) &&
    body.productos.length > 0
  ) {
    return body.productos
      .map((producto, indice) => {
        const cantidad = Math.max(
          numeroSeguro(
            producto.cantidad,
            1
          ),
          1
        );

        const precio = Math.max(
          numeroSeguro(
            producto.precio,
            0
          ),
          0
        );

        return {
          id:
            producto.id ??
            producto.productoId ??
            `producto-${indice}`,

          carritoId:
            producto.carritoId ??
            `linea-${Date.now()}-${indice}`,

          nombre:
            normalizarTexto(
              producto.nombre
            ),

          cantidad,

          precio,

          subtotal: Number(
            (
              cantidad * precio
            ).toFixed(2)
          ),

          observacion:
            normalizarTexto(
              producto.observacion
            ),
        };
      })
      .filter(
        (producto) =>
          producto.nombre
      );
  }

  const textoProductos =
    normalizarTexto(body.producto);

  if (!textoProductos) {
    return [];
  }

  return textoProductos
    .split(",")
    .map((texto, indice) => {
      const item = texto.trim();

      const coincidencia =
        item.match(
          /^(.*?)\s+x(\d+)(?:\s+\((.*)\))?$/i
        );

      if (coincidencia) {
        return {
          id: `producto-${indice}`,

          carritoId:
            `linea-${Date.now()}-${indice}`,

          nombre:
            coincidencia[1].trim(),

          cantidad: Math.max(
            numeroSeguro(
              coincidencia[2],
              1
            ),
            1
          ),

          precio: 0,

          subtotal: 0,

          observacion:
            normalizarTexto(
              coincidencia[3]
            ),
        };
      }

      return {
        id: `producto-${indice}`,

        carritoId:
          `linea-${Date.now()}-${indice}`,

        nombre: item,

        cantidad: 1,

        precio: 0,

        subtotal: 0,

        observacion: "",
      };
    })
    .filter(
      (producto) =>
        producto.nombre
    );
}

function buscarReceta(
  recetas,
  nombreProducto
) {
  return recetas.find(
    (receta) =>
      normalizarClave(
        receta.producto
      ) ===
      normalizarClave(
        nombreProducto
      )
  );
}

function construirConsumosStock({
  productos,
  recetas,
}) {
  const consumos = new Map();

  for (const producto of productos) {
    const receta = buscarReceta(
      recetas,
      producto.nombre
    );

    if (!receta) {
      console.warn(
        `No se encontró una receta para: ${producto.nombre}`
      );

      continue;
    }

    const ingredientes =
      Array.isArray(receta.ingredientes)
        ? receta.ingredientes
        : [];

    for (const ingredienteReceta of ingredientes) {
      const ingrediente =
        normalizarTexto(
          ingredienteReceta.ingrediente
        );

      if (!ingrediente) {
        continue;
      }

      const cantidadNecesaria =
        numeroSeguro(
          ingredienteReceta.cantidad
        ) *
        numeroSeguro(
          producto.cantidad,
          1
        );

      if (cantidadNecesaria <= 0) {
        continue;
      }

      const clave =
        normalizarClave(ingrediente);

      const consumoActual =
        consumos.get(clave);

      if (consumoActual) {
        consumoActual.cantidad +=
          cantidadNecesaria;
      } else {
        consumos.set(clave, {
          ingrediente,
          cantidad:
            cantidadNecesaria,
        });
      }
    }
  }

  return Array.from(
    consumos.values()
  ).map((consumo) => ({
    ...consumo,

    cantidad: Number(
      consumo.cantidad.toFixed(3)
    ),
  }));
}

function buscarInsumoPostgres(
  stock,
  ingrediente
) {
  return stock.find(
    (item) =>
      normalizarClave(
        item.ingrediente
      ) ===
      normalizarClave(
        ingrediente
      )
  );
}

function validarStockPostgres({
  consumos,
  stock,
}) {
  for (const consumo of consumos) {
    const insumo =
      buscarInsumoPostgres(
        stock,
        consumo.ingrediente
      );

    if (!insumo) {
      const error = new Error(
        `No existe el insumo ${consumo.ingrediente} en el stock.`
      );

      error.status = 400;

      throw error;
    }

    if (
      numeroSeguro(insumo.cantidad) <
      numeroSeguro(consumo.cantidad)
    ) {
      const error = new Error(
        `Stock insuficiente de ${consumo.ingrediente}. Disponible: ${insumo.cantidad} ${insumo.unidad}.`
      );

      error.status = 409;

      throw error;
    }
  }
}

async function descontarStockPostgres({
  consumos,
  stock,
  venta,
}) {
  for (const consumo of consumos) {
    const insumo = buscarInsumoPostgres(
      stock,
      consumo.ingrediente
    );

    if (!insumo) {
      continue;
    }

    await stockService.descontarStock(
      insumo.id,
      {
        tipo: "venta",
        cantidad: consumo.cantidad,
        motivo: `Consumo automático por venta #${venta.id}`,
        referenciaTipo: "venta",
        referenciaId: venta.id,
        usuarioId: null,
        usuarioNombre: "Sistema",
      }
    );
  }
}



function actualizarClienteJson({
  venta,
  clientes,
  clientesPath,
}) {
  const nombreCliente =
    normalizarTexto(
      venta.cliente
    );

  const telefonoCliente =
    normalizarTexto(
      venta.telefono
    );

  const direccionCliente =
    normalizarTexto(
      venta.direccion
    );

  if (
    !nombreCliente ||
    normalizarClave(
      nombreCliente
    ) === "mostrador"
  ) {
    return;
  }

  const clienteExistente =
    clientes.find((cliente) => {
      if (
        telefonoCliente &&
        cliente.telefono
      ) {
        return (
          normalizarTexto(
            cliente.telefono
          ) === telefonoCliente
        );
      }

      return (
        normalizarClave(
          cliente.nombre
        ) ===
        normalizarClave(
          nombreCliente
        )
      );
    });

  if (clienteExistente) {
    clienteExistente.nombre =
      nombreCliente;

    clienteExistente.telefono =
      telefonoCliente ||
      clienteExistente.telefono;

    clienteExistente.direccion =
      direccionCliente ||
      clienteExistente.direccion;

    clienteExistente.cantidadPedidos =
      numeroSeguro(
        clienteExistente.cantidadPedidos
      ) + 1;

    clienteExistente.totalGastado =
      numeroSeguro(
        clienteExistente.totalGastado
      ) +
      numeroSeguro(
        venta.total
      );

    clienteExistente.ultimaCompra =
      venta.fecha;
  } else {
    const idsClientes =
      clientes
        .map(
          (cliente) =>
            Number(cliente.id)
        )
        .filter(
          Number.isFinite
        );

    const siguienteClienteId =
      idsClientes.length > 0
        ? Math.max(
            ...idsClientes
          ) + 1
        : 1;

    clientes.push({
      id: siguienteClienteId,

      nombre:
        nombreCliente,

      telefono:
        telefonoCliente,

      direccion:
        direccionCliente,

      cantidadPedidos: 1,

      totalGastado:
        numeroSeguro(
          venta.total
        ),

      ultimaCompra:
        venta.fecha,
    });
  }

  guardarJson(
    clientesPath,
    clientes
  );
}

function sincronizarVentaJson({
  venta,
  ventas,
  ventasPath,
}) {
  const indice =
    ventas.findIndex(
      (item) =>
        Number(item.id) ===
        Number(venta.id)
    );

  if (indice >= 0) {
    ventas[indice] = venta;
  } else {
    ventas.push(venta);
  }

  guardarJson(
    ventasPath,
    ventas
  );
}

function construirDatosVenta(
  body,
  productos
) {
  const cantidad =
    productos.reduce(
      (total, producto) =>
        total +
        numeroSeguro(
          producto.cantidad,
          1
        ),
      0
    );

  return {
    numeroVenta:
      normalizarTexto(
        body.numeroVenta ??
        body.numero
      ),

    cliente:
      normalizarTexto(
        body.cliente
      ) || "Mostrador",

    telefono:
      normalizarTexto(
        body.telefono
      ),

    direccion:
      normalizarTexto(
        body.direccion
      ),

    tipoPedido:
      normalizarTexto(
        body.tipoPedido
      ) || "Retiro",

    numeroMesa:
      normalizarTexto(
        body.numeroMesa
      ),

    cantidad,

    subtotal:
      numeroSeguro(
        body.subtotal,
        numeroSeguro(
          body.total
        )
      ),

    descuento:
      numeroSeguro(
        body.descuento
      ),

    descuentoTipo:
      normalizarTexto(
        body.descuentoTipo
      ),

    descuentoValor:
      numeroSeguro(
        body.descuentoValor
      ),

    total:
      numeroSeguro(
        body.total
      ),

    formaPago:
      normalizarTexto(
        body.formaPago
      ),

    montoRecibido:
      numeroSeguro(
        body.montoRecibido
      ),

    vuelto:
      numeroSeguro(
        body.vuelto
      ),

    estado: "Nuevo",

    observaciones:
      normalizarTexto(
        body.observaciones
      ),

    repartidor: "",

    repartidorId: "",

    origen:
      normalizarTexto(
        body.origen
      ) || "Caja",
  };
}

async function listarVentas() {
  return ventasRepository
    .listarVentas();
}

async function crearVenta({
  body,
  recetas,
  clientes,
  ventas,
  ventasPath,
  clientesPath,
}) {
  const productos =
    obtenerProductosVendidos(
      body
    );

  if (productos.length === 0) {
    const error = new Error(
      "La venta debe contener al menos un producto."
    );

    error.status = 400;

    throw error;
  }

    const consumos =
    construirConsumosStock({
      productos,
      recetas,
    });

  const stockPostgres =
    await stockService.listarStock();

  validarStockPostgres({
    consumos,
    stock: stockPostgres,
  });

  const datosVenta =
    construirDatosVenta(
      body,
      productos
    );

  const nuevaVenta =
    await ventasRepository
      .crearVenta(
        datosVenta,
        productos
      );

    await descontarStockPostgres({
    consumos,
    stock: stockPostgres,
    venta: nuevaVenta,
  });

  actualizarClienteJson({
    venta: nuevaVenta,
    clientes,
    clientesPath,
  });

  sincronizarVentaJson({
    venta: nuevaVenta,
    ventas,
    ventasPath,
  });

  return nuevaVenta;
}

async function actualizarVenta({
  ventaId,
  body,
  ventas,
  ventasPath,
}) {
  const ventaActual =
    await ventasRepository
      .buscarVentaPorId(
        ventaId
      );

  if (!ventaActual) {
    const error = new Error(
      "Venta no encontrada."
    );

    error.status = 404;

    throw error;
  }

  let estado =
    ventaActual.estado;

  if (
    body.estado !== undefined
  ) {
    const nuevoEstado =
      normalizarTexto(
        body.estado
      );

    if (
      !estadosPermitidos.includes(
        nuevoEstado
      )
    ) {
      const error = new Error(
        "Estado de pedido no válido."
      );

      error.status = 400;

      throw error;
    }

    estado = nuevoEstado;
  }

  const cambios = {
    estado,

    repartidor:
      body.repartidor !== undefined
        ? normalizarTexto(
            body.repartidor
          )
        : ventaActual.repartidor,

    repartidorId:
      body.repartidorId !== undefined
        ? normalizarTexto(
            body.repartidorId
          )
        : ventaActual.repartidorId,

    fechaAsignacionRepartidor:
      body.fechaAsignacionRepartidor !==
      undefined
        ? fechaOpcional(
            body.fechaAsignacionRepartidor
          )
        : fechaOpcional(
            ventaActual
              .fechaAsignacionRepartidor
          ),

    horaSalida:
      body.horaSalida !== undefined
        ? fechaOpcional(
            body.horaSalida
          )
        : fechaOpcional(
            ventaActual.horaSalida
          ),

    horaEntrega:
      body.horaEntrega !== undefined
        ? fechaOpcional(
            body.horaEntrega
          )
        : fechaOpcional(
            ventaActual.horaEntrega
          ),

    etaMinutos:
      body.etaMinutos !== undefined
        ? Math.max(
            numeroSeguro(
              body.etaMinutos
            ),
            0
          )
        : ventaActual.etaMinutos,

    distanciaKm:
      body.distanciaKm !== undefined
        ? Math.max(
            numeroSeguro(
              body.distanciaKm
            ),
            0
          )
        : ventaActual.distanciaKm,

    observacionesDelivery:
      body.observacionesDelivery !==
      undefined
        ? normalizarTexto(
            body.observacionesDelivery
          )
        : ventaActual
            .observacionesDelivery,
  };

  const ventaActualizada =
    await ventasRepository
      .actualizarVenta(
        ventaId,
        cambios
      );

  sincronizarVentaJson({
    venta: ventaActualizada,
    ventas,
    ventasPath,
  });

  return ventaActualizada;
}

async function actualizarEstado({
  ventaId,
  estado,
  ventas,
  ventasPath,
}) {
  const nuevoEstado =
    normalizarTexto(estado);

  if (
    !estadosPermitidos.includes(
      nuevoEstado
    )
  ) {
    const error = new Error(
      "Estado de pedido no válido."
    );

    error.status = 400;

    throw error;
  }

  const ventaActualizada =
    await ventasRepository
      .actualizarEstado(
        ventaId,
        nuevoEstado
      );

  if (!ventaActualizada) {
    const error = new Error(
      "Venta no encontrada."
    );

    error.status = 404;

    throw error;
  }

  sincronizarVentaJson({
    venta: ventaActualizada,
    ventas,
    ventasPath,
  });

  return ventaActualizada;
}

module.exports = {
  listarVentas,
  crearVenta,
  actualizarVenta,
  actualizarEstado,
};