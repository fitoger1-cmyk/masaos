function responderProduccion({
  ventas,
  predicciones,
  crearRespuesta,
}) {
  const ranking = Array.isArray(
    ventas.rankingProductos
  )
    ? ventas.rankingProductos
    : [];

  if (ranking.length === 0) {
    return crearRespuesta({
      tipo: "produccion",
      titulo: "Producción recomendada",
      mensaje:
        "Todavía no existe suficiente historial para sugerir una producción.",

      sugerencias: [
        "¿Cuánto voy a vender mañana?",
        "¿Qué producto tendrá más demanda?"
      ]
    });
  }

  const sugeridos = ranking.slice(0, 8);

  const productoDemanda =
    predicciones?.tendencia
      ?.productoMasVendido;

  return crearRespuesta({
    tipo: "produccion",

    titulo:
      "Producción recomendada para mañana",

    mensaje:
      "Según el historial de ventas y la tendencia registrada, estos son los productos que conviene preparar primero.",

    datos: sugeridos.map((producto) => ({
      etiqueta: producto.nombre,
      valor:
        `${producto.cantidad} unidades vendidas`
    })),

    sugerencias: [
      "¿Qué tengo que comprar?",
      "¿Cuánto voy a vender mañana?",
      "¿Qué producto tendrá más demanda?"
    ]
  });
}

module.exports = {
  responderProduccion,
};