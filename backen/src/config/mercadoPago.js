// ======================================
// MasaOS Enterprise
// Configuración de Mercado Pago
// ======================================

const {
  MercadoPagoConfig,
  Preference,
  Payment,
} = require("mercadopago");

const accessToken =
  process.env.MP_ACCESS_TOKEN;

if (!accessToken) {
  console.warn(
    "Mercado Pago no configurado: falta MP_ACCESS_TOKEN."
  );
}

const clienteMercadoPago =
  new MercadoPagoConfig({
    accessToken:
      accessToken || "TOKEN_NO_CONFIGURADO",

    options: {
      timeout: 10000,
    },
  });

const preferenceClient =
  new Preference(clienteMercadoPago);

const paymentClient =
  new Payment(clienteMercadoPago);

module.exports = {
  clienteMercadoPago,
  preferenceClient,
  paymentClient,
};