const express = require("express");

const {
  preferenceClient,
} = require("../config/mercadoPago");

const router = express.Router();

router.post("/preferencia", async (req, res) => {
  try {
    const pedido = req.body;

    console.log(
      "===== CREANDO PREFERENCIA MERCADO PAGO ====="
    );

    console.log(
      "Pedido recibido:",
      JSON.stringify(pedido, null, 2)
    );

    const productos =
      pedido.productos ||
      pedido.items ||
      [];

    const items = productos.map(
      (producto, indice) => ({
        id: String(
          producto.id ||
            `producto-${indice + 1}`
        ),

        title:
          producto.nombre ||
          producto.title ||
          "Producto MasaOS",

        description:
          producto.descripcion ||
          producto.tamaño ||
          producto.tamano ||
          "",

        quantity: Number(
          producto.cantidad || 1
        ),

        unit_price: Number(
          producto.precio ||
          producto.precioUnitario ||
          producto.unit_price ||
          0
        ),

        currency_id: "ARS",
      })
    );

    console.log(
      "Items enviados a Mercado Pago:",
      items
    );

    if (items.length === 0) {
      return res.status(400).json({
        ok: false,
        error:
          "El pedido no contiene productos para generar el pago.",
      });
    }

    const itemInvalido = items.find(
      (item) =>
        !item.title ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.unit_price) ||
        item.unit_price <= 0
    );

    if (itemInvalido) {
      console.error(
        "Item inválido:",
        itemInvalido
      );

      return res.status(400).json({
        ok: false,
        error:
          "Uno de los productos tiene cantidad o precio inválido.",
        item: itemInvalido,
      });
    }

    const numeroPedido =
      pedido.numeroPedido ||
      pedido.numero_pedido ||
      pedido.id ||
      Date.now();

    const resultado =
      await preferenceClient.create({
        body: {
          items,

          external_reference:
            String(numeroPedido),

          statement_descriptor:
            "CLUB DE LA MASA",

          metadata: {
  origen: "MasaOS Enterprise",
  numeroPedido: String(numeroPedido),
},

notification_url:
  "https://masaos-enterprise-api.onrender.com/api/mercadopago/webhook",

back_urls: {
  success: "https://masaos-web.vercel.app/?pago=exitoso",
  failure: "https://masaos-web.vercel.app/?pago=error",
  pending: "https://masaos-web.vercel.app/?pago=pendiente",
},

auto_return: "approved",
         },
      });

    console.log(
      "Respuesta completa del SDK:",
      JSON.stringify(resultado, null, 2)
    );

    const initPoint =
      resultado?.init_point ||
      resultado?.response?.init_point;

    const sandboxInitPoint =
      resultado?.sandbox_init_point ||
      resultado?.response
        ?.sandbox_init_point;

    const preferenceId =
      resultado?.id ||
      resultado?.response?.id;

    if (
      !initPoint &&
      !sandboxInitPoint
    ) {
      console.error(
        "Mercado Pago creó una respuesta sin enlace:",
        resultado
      );

      return res.status(502).json({
        ok: false,
        error:
          "Mercado Pago no devolvió un enlace de pago.",
        detalle: resultado,
      });
    }

    return res.status(201).json({
      ok: true,
      preferenceId,
      init_point: initPoint,
      sandbox_init_point:
        sandboxInitPoint,
    });
  } catch (error) {
    console.error(
      "Error creando preferencia Mercado Pago:"
    );

    console.error(
      error?.message || error
    );

    console.error(
      error?.cause || ""
    );

    return res.status(500).json({
      ok: false,
      error:
        error?.message ||
        "No se pudo crear la preferencia de Mercado Pago.",
    });
  }
});

module.exports = router;