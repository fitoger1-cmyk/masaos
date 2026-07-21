function formatearMoneda(valor) {
  return Number(valor || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

function responderVentas({ ventas, crearRespuesta }) {
  return crearRespuesta({
    tipo: "ventas",
    titulo: "Ventas de hoy",

    mensaje:
      `Hoy registraste ${formatearMoneda(
        ventas.totalHoy
      )} en ${Number(
        ventas.cantidadHoy || 0
      )} ventas.`,

    datos: [
      {
        etiqueta: "Facturación",
        valor: formatearMoneda(ventas.totalHoy),
      },
      {
        etiqueta: "Cantidad de ventas",
        valor: Number(ventas.cantidadHoy || 0),
      },
      {
        etiqueta: "Ticket promedio",
        valor: formatearMoneda(
          ventas.ticketPromedio
        ),
      },
      {
        etiqueta: "Productos vendidos",
        valor: Number(
          ventas.productosVendidos || 0
        ),
      },
    ],

    sugerencias: [
      "¿Cuál fue el producto más vendido?",
      "¿Cómo está la rentabilidad?",
      "¿Hay alertas importantes?",
    ],
  });
}

module.exports = {
  responderVentas,
};