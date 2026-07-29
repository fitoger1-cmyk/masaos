// ===========================================
// MasaOS Enterprise
// WhatsApp PRO
// ===========================================

const TELEFONO = "541140480762";

/**
 * Formatea dinero en pesos argentinos
 */
export function formatearPrecio(valor = 0) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

/**
 * Genera el texto completo del pedido
 */
export function generarMensajePedido({
  numeroPedido = "",
  cliente = "",
  telefono = "",
  direccion = "",
  observaciones = "",
  metodoPago = "",
  items = [],
  subtotal = 0,
  envio = 0,
  total = 0,
}) {
  const lineas = [];

  lineas.push("🍕 *NUEVO PEDIDO*");
  lineas.push("*El Club de la Masa G*");
  lineas.push("");
  
  if (numeroPedido) {
  lineas.push(`🧾 Pedido: #${numeroPedido}`);
  lineas.push("");
}

  lineas.push("━━━━━━━━━━━━━━━━━━");

  lineas.push(`👤 Cliente: ${cliente}`);
  lineas.push(`📞 Teléfono: ${telefono}`);
  lineas.push(`📍 Dirección: ${direccion}`);

  if (metodoPago) {
    lineas.push(`💳 Pago: ${metodoPago}`);
  }

  if (observaciones) {
    lineas.push(`📝 Obs: ${observaciones}`);
  }

  lineas.push("");
  lineas.push("🍕 PRODUCTOS");
  lineas.push("");

  items.forEach((item) => {
    lineas.push(
      `• ${item.cantidad} x ${item.nombre}`
    );

    if (item.tamaño) {
      lineas.push(`   Tamaño: ${item.tamaño}`);
    }

    if (item.precio) {
      lineas.push(`   ${formatearPrecio(item.precio)}`);
    }

    lineas.push("");
  });

  lineas.push("━━━━━━━━━━━━━━━━━━");

  lineas.push(`Subtotal: ${formatearPrecio(subtotal)}`);

  if (envio > 0) {
    lineas.push(`Envío: ${formatearPrecio(envio)}`);
  }

  lineas.push(`TOTAL: ${formatearPrecio(total)}`);

  lineas.push("");
  lineas.push("Gracias por elegir");
  lineas.push("🍕 El Club de la Masa G 🍕");

  return lineas.join("\n");
}

/**
 * Devuelve la URL completa de WhatsApp
 */
export function generarLinkWhatsApp(pedido) {
  return `https://wa.me/${TELEFONO}?text=${encodeURIComponent(
    generarMensajePedido(pedido)
  )}`;
}