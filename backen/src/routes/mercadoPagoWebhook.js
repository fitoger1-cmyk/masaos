const express = require("express");
const fs = require("fs");
const path = require("path");

const {
  paymentClient,
} = require("../config/mercadoPago");

const router = express.Router();

const pedidosPath = path.join(
  __dirname,
  "../controllers/pedidos.json"
);

function leerPedidos() {
  try {
    if (!fs.existsSync(pedidosPath)) {
      return [];
    }

    const contenido = fs.readFileSync(
      pedidosPath,
      "utf8"
    );

    if (!contenido.trim()) {
      return [];
    }

    const pedidos = JSON.parse(contenido);

    return Array.isArray(pedidos)
      ? pedidos
      : [];
  } catch (error) {
    console.error(
      "Error leyendo pedidos:",
      error.message
    );

    return [];
  }
}

function guardarPedidos(pedidos) {
  fs.writeFileSync(
    pedidosPath,
    JSON.stringify(pedidos, null, 2),
    "utf8"
  );
}

function convertirEstadoPago(
  estadoMercadoPago
) {
  const estados = {
    approved: "Pagado",
    pending: "Pendiente",
    in_process: "En proceso",
    rejected: "Rechazado",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
    charged_back: "Contracargo",
  };

  return (
    estados[estadoMercadoPago] ||
    estadoMercadoPago
  );
}

router.post("/", async (req, res) => {
  try {
    const tipoEvento =
      req.body?.type ||
      req.query?.type ||
      req.body?.topic ||
      req.query?.topic ||
      "desconocido";

    const paymentId =
      req.body?.data?.id ||
      req.query?.["data.id"] ||
      req.query?.id ||
      null;

    console.log(
      "===== WEBHOOK MERCADO PAGO ====="
    );

    console.log(
      "Tipo de evento:",
      tipoEvento
    );

    console.log(
      "ID del pago:",
      paymentId
    );

    /*
     * Mercado Pago también puede enviar
     * otros tipos de notificaciones.
     */
    if (
      tipoEvento !== "payment" ||
      !paymentId
    ) {
      return res.status(200).json({
        ok: true,
        recibido: true,
        procesado: false,
      });
    }

    /*
     * Consultamos el pago directamente
     * en Mercado Pago.
     */
    const pago = await paymentClient.get({
      id: paymentId,
    });

    console.log(
      "===== PAGO CONSULTADO ====="
    );

    console.log("Estado:", pago.status);
    console.log(
      "Detalle:",
      pago.status_detail
    );
    console.log(
      "Referencia externa:",
      pago.external_reference
    );
    console.log(
      "Monto:",
      pago.transaction_amount
    );
    console.log(
      "Método:",
      pago.payment_method_id
    );

    const numeroPedido =
      pago.external_reference;

    if (!numeroPedido) {
      console.warn(
        "El pago no contiene external_reference."
      );

      return res.status(200).json({
        ok: true,
        recibido: true,
        procesado: false,
        motivo:
          "El pago no contiene referencia del pedido.",
      });
    }

    const pedidos = leerPedidos();

    const indicePedido =
      pedidos.findIndex(
        (pedido) =>
          String(pedido.numeroPedido) ===
          String(numeroPedido)
      );

    if (indicePedido === -1) {
      console.warn(
        `No se encontró el pedido ${numeroPedido}.`
      );

      return res.status(200).json({
        ok: true,
        recibido: true,
        procesado: false,
        motivo:
          "No se encontró el pedido en MasaOS.",
        numeroPedido,
      });
    }

    const estadoPago =
      convertirEstadoPago(pago.status);

    const pedidoActual =
      pedidos[indicePedido];

    /*
     * Conservamos el estado operativo:
     * Nuevo, Preparando, Listo, etc.
     *
     * Solo actualizamos el estado del pago.
     */
    pedidos[indicePedido] = {
      ...pedidoActual,

      pago: {
        ...(pedidoActual.pago || {}),

        estado: estadoPago,

        mercadoPago: {
          paymentId: String(pago.id),
          estado: pago.status,
          detalle:
            pago.status_detail || "",
          metodo:
            pago.payment_method_id || "",
          tipo:
            pago.payment_type_id || "",
          monto:
            pago.transaction_amount || 0,
          moneda:
            pago.currency_id || "ARS",
          fechaAprobacion:
            pago.date_approved || null,
          fechaActualizacion:
            pago.date_last_updated ||
            new Date().toISOString(),
        },
      },

      fechaActualizacion:
        new Date().toISOString(),
    };

    guardarPedidos(pedidos);

    console.log(
      "===== PEDIDO ACTUALIZADO ====="
    );

    console.log(
      "Pedido:",
      numeroPedido
    );

    console.log(
      "Estado del pago:",
      estadoPago
    );

    console.log(
      "Payment ID:",
      pago.id
    );

    console.log(
      "=============================="
    );

    /*
     * Emisión opcional por Socket.IO.
     * Funcionará cuando server.js guarde
     * la instancia de io en app.
     */
    const io = req.app.get("io");

    if (io) {
      io.emit("pedidoActualizado", {
        numeroPedido,
        pedido:
          pedidos[indicePedido],
      });

      io.emit("pagoActualizado", {
        numeroPedido,
        estadoPago,
        paymentId: pago.id,
      });
    }

    return res.status(200).json({
      ok: true,
      recibido: true,
      procesado: true,

      pedido: {
        numeroPedido,
        estadoPago,
      },

      pago: {
        id: pago.id,
        estado: pago.status,
        detalle:
          pago.status_detail,
        referencia:
          pago.external_reference,
        monto:
          pago.transaction_amount,
      },
    });
  } catch (error) {
    console.error(
      "Error procesando Webhook de Mercado Pago:",
      error?.message || error
    );

    return res.status(500).json({
      ok: false,
      error:
        "No se pudo procesar el pago de Mercado Pago.",
    });
  }
});

module.exports = router;