const express = require("express");
const fs = require("fs");

const ESTADOS_PERMITIDOS = [
  "Nuevo",
  "Preparando",
  "Listo",
  "Entregado",
  "Cancelado",
];

function textoSeguro(valor, valorDefault = "") {
  if (valor === null || valor === undefined) {
    return valorDefault;
  }

  return String(valor).trim();
}

function numeroSeguro(valor, valorDefault = 0) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : valorDefault;
}

function normalizarTipoEntrega(valor) {
  const tipo = textoSeguro(valor, "Retiro").toLowerCase();

  if (tipo === "delivery" || tipo === "envio" || tipo === "envío") {
    return "Delivery";
  }

  return "Retiro";
}

function normalizarFormaPago(valor) {
  const formaPago = textoSeguro(valor).toLowerCase();

  const formasPago = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    mercado_pago: "Mercado Pago",
    "mercado pago": "Mercado Pago",
    tarjeta: "Tarjeta",
  };

  return formasPago[formaPago] || textoSeguro(valor);
}

function normalizarProducto(producto, indice) {
  const cantidad = Math.max(
    1,
    numeroSeguro(producto?.cantidad, 1)
  );

  const precio = Math.max(
    0,
    numeroSeguro(producto?.precio, 0)
  );

  return {
    id:
      producto?.id ??
      producto?._id ??
      producto?.carritoId ??
      indice + 1,

    nombre: textoSeguro(
      producto?.nombre ??
        producto?.name,
      `Producto ${indice + 1}`
    ),

    categoria: textoSeguro(
      producto?.categoria
    ),

    precio,
    cantidad,

    subtotal:
      numeroSeguro(
        producto?.subtotal,
        precio * cantidad
      ),

    observaciones: textoSeguro(
      producto?.observaciones
    ),
  };
}

function construirProductosDesdeFormatoAntiguo(body) {
  const nombreProducto = textoSeguro(body.producto);

  if (!nombreProducto) {
    return [];
  }

  const cantidad = Math.max(
    1,
    numeroSeguro(body.cantidad, 1)
  );

  const total = Math.max(
    0,
    numeroSeguro(body.total, 0)
  );

  const precioUnitario =
    cantidad > 0
      ? total / cantidad
      : total;

  return [
    {
      id: 1,
      nombre: nombreProducto,
      categoria: "",
      precio: precioUnitario,
      cantidad,
      subtotal: total,
      observaciones: "",
    },
  ];
}

function obtenerSiguienteId(pedidos) {
  if (!pedidos.length) {
    return 1;
  }

  const idsValidos = pedidos
    .map((pedido) => Number(pedido.id))
    .filter(Number.isFinite);

  if (!idsValidos.length) {
    return pedidos.length + 1;
  }

  return Math.max(...idsValidos) + 1;
}

function guardarPedidos({
  pedidos,
  pedidosPath,
  setPedidos,
}) {
  fs.writeFileSync(
    pedidosPath,
    JSON.stringify(pedidos, null, 2),
    "utf8"
  );

  setPedidos(pedidos);
}

function crearPedidosRouter({
  pedidos,
  setPedidos,
  pedidosPath,
  io = null,
}) {
  const router = express.Router();

  router.get("/", (req, res) => {
   console.log(
  "GET /api/pedidos ->",
  pedidos.map((p) => ({
    numero: p.numeroPedido,
    estado: p.estado,
  }))
);

  res.json(pedidos);

  });

  router.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    const pedido = pedidos.find(
      (item) => Number(item.id) === id
    );

    if (!pedido) {
      return res.status(404).json({
        error: "Pedido no encontrado.",
      });
    }

    res.json(pedido);
  });

  router.post("/", (req, res) => {
    try {
      const body = req.body || {};

      const productosRecibidos = Array.isArray(
        body.productos
      )
        ? body.productos
        : [];

      const productos =
        productosRecibidos.length > 0
          ? productosRecibidos.map(
              normalizarProducto
            )
          : construirProductosDesdeFormatoAntiguo(
              body
            );

      if (!productos.length) {
        return res.status(400).json({
          error:
            "El pedido debe contener al menos un producto.",
        });
      }

      const productosInvalidos =
        productos.some(
          (producto) =>
            !producto.nombre ||
            producto.cantidad <= 0
        );

      if (productosInvalidos) {
        return res.status(400).json({
          error:
            "Uno o más productos del pedido no son válidos.",
        });
      }

      const clienteRecibido =
        typeof body.cliente === "object" &&
        body.cliente !== null
          ? body.cliente
          : {};

      const entregaRecibida =
        typeof body.entrega === "object" &&
        body.entrega !== null
          ? body.entrega
          : {};

      const pagoRecibido =
        typeof body.pago === "object" &&
        body.pago !== null
          ? body.pago
          : {};

      const nombreCliente = textoSeguro(
        clienteRecibido.nombre ??
          body.cliente,
        "Mostrador"
      );

      const telefonoCliente = textoSeguro(
        clienteRecibido.telefono ??
          body.telefono
      );

      const tipoEntrega =
        normalizarTipoEntrega(
          entregaRecibida.tipo ??
            body.tipoEntrega
        );

      const direccionEntrega =
        tipoEntrega === "Delivery"
          ? textoSeguro(
              entregaRecibida.direccion ??
                body.direccion
            )
          : "";

      if (
        tipoEntrega === "Delivery" &&
        !direccionEntrega
      ) {
        return res.status(400).json({
          error:
            "Los pedidos con delivery deben incluir una dirección.",
        });
      }

      const cantidadCalculada =
        productos.reduce(
          (total, producto) =>
            total +
            numeroSeguro(
              producto.cantidad,
              0
            ),
          0
        );

      const subtotalCalculado =
        productos.reduce(
          (total, producto) =>
            total +
            numeroSeguro(
              producto.subtotal,
              0
            ),
          0
        );

      const cantidadTotal = Math.max(
        1,
        numeroSeguro(
          body.cantidadTotal ??
            body.cantidad,
          cantidadCalculada
        )
      );

      const subtotal = Math.max(
        0,
        numeroSeguro(
          body.subtotal ??
            body.total,
          subtotalCalculado
        )
      );

      const costoEnvio = Math.max(
        0,
        numeroSeguro(
          body.costoEnvio ??
            entregaRecibida.costo,
          0
        )
      );

      const total = subtotal + costoEnvio;

      const ahora = new Date();

      const nuevoPedido = {
        id: obtenerSiguienteId(pedidos),

        numeroPedido: `WEB-${String(
          obtenerSiguienteId(pedidos)
        ).padStart(5, "0")}`,

        cliente: {
          nombre: nombreCliente,
          telefono: telefonoCliente,
        },

        entrega: {
          tipo: tipoEntrega,

          direccion: direccionEntrega,

          localidad: textoSeguro(
            entregaRecibida.localidad
          ),

          referencia: textoSeguro(
            entregaRecibida.referencia
          ),

          costo: costoEnvio,
        },

        pago: {
          metodo: normalizarFormaPago(
            pagoRecibido.metodo ??
              body.formaPago
          ),

          pagaCon:
            pagoRecibido.pagaCon === null ||
            pagoRecibido.pagaCon ===
              undefined
              ? null
              : numeroSeguro(
                  pagoRecibido.pagaCon,
                  null
                ),

          estado: textoSeguro(
            pagoRecibido.estado,
            "Pendiente"
          ),
        },

        productos,

        cantidadTotal,
        subtotal,
        costoEnvio,
        total,

        observaciones: textoSeguro(
          body.observaciones
        ),

        origen: textoSeguro(
          body.origen,
          productosRecibidos.length > 0
            ? "Web 3.0"
            : "MasaOS"
        ),

        estado: "Nuevo",

        fecha: ahora
          .toISOString()
          .split("T")[0],

        fechaHora: ahora.toISOString(),

        fechaActualizacion:
          ahora.toISOString(),
      };

      pedidos.push(nuevoPedido);
      console.log("===== PEDIDO NUEVO =====");
console.log("Total pedidos:", pedidos.length);
console.log("Último pedido:", nuevoPedido.numeroPedido);
console.log("Estado:", nuevoPedido.estado);
console.log("========================");

      guardarPedidos({
        pedidos,
        pedidosPath,
        setPedidos,
      });

      if (io) {
        io.emit(
          "pedido:nuevo",
          nuevoPedido
        );

        io.emit(
          "pedidos:actualizados",
          pedidos
        );
      }

      return res.status(201).json({
        ok: true,

        mensaje:
          "Pedido registrado correctamente.",

        pedido: nuevoPedido,
      });
    } catch (error) {
      console.error(
        "Error creando pedido:",
        error
      );

      return res.status(500).json({
        error:
          "No se pudo registrar el pedido.",
      });
    }
  });

  router.put("/:id/estado", (req, res) => {
    try {
      const id = Number(req.params.id);

      const nuevoEstado = textoSeguro(
        req.body.estado
      );

      if (
        !ESTADOS_PERMITIDOS.includes(
          nuevoEstado
        )
      ) {
        return res.status(400).json({
          error:
            "Estado de pedido no válido.",
        });
      }

      const pedido = pedidos.find(
        (item) =>
          Number(item.id) === id
      );

      if (!pedido) {
        return res.status(404).json({
          error:
            "Pedido no encontrado.",
        });
      }

      pedido.estado = nuevoEstado;
      pedido.fechaActualizacion =
        new Date().toISOString();

      guardarPedidos({
        pedidos,
        pedidosPath,
        setPedidos,
      });

      if (io) {
        io.emit(
          "pedido:estado-actualizado",
          pedido
        );

        io.emit(
          "pedidos:actualizados",
          pedidos
        );
      }

      return res.json({
        ok: true,

        mensaje:
          "Estado actualizado correctamente.",

        pedido,
      });
    } catch (error) {
      console.error(
        "Error actualizando pedido:",
        error
      );

      return res.status(500).json({
        error:
          "No se pudo actualizar el estado.",
      });
    }
  });

  router.delete("/:id", (req, res) => {
    try {
      const id = Number(req.params.id);

      const indice = pedidos.findIndex(
        (item) =>
          Number(item.id) === id
      );

      if (indice === -1) {
        return res.status(404).json({
          error:
            "Pedido no encontrado.",
        });
      }

      const [pedidoEliminado] =
        pedidos.splice(indice, 1);

      guardarPedidos({
        pedidos,
        pedidosPath,
        setPedidos,
      });

      if (io) {
        io.emit(
          "pedido:eliminado",
          pedidoEliminado
        );

        io.emit(
          "pedidos:actualizados",
          pedidos
        );
      }

      return res.json({
        ok: true,

        mensaje:
          "Pedido eliminado correctamente.",

        pedido: pedidoEliminado,
      });
    } catch (error) {
      console.error(
        "Error eliminando pedido:",
        error
      );

      return res.status(500).json({
        error:
          "No se pudo eliminar el pedido.",
      });
    }
  });

  return router;
}

module.exports = crearPedidosRouter;