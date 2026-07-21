function generarGerenteVirtual({
  dashboard,
  recomendaciones,
  predicciones,
}) {
  const salud = dashboard.saludNegocio || {};
  const ventas = predicciones.ventas || {};
  const tendencia = predicciones.tendencia || {};

  const principal =
    recomendaciones.recomendacionPrincipal || {};

  return {
    generadoEn: new Date().toISOString(),

    estadoGeneral: {
      puntaje: salud.puntaje || 0,
      estado: salud.estado || "Sin datos",
    },

    ventas: {
      estimadasHoy: ventas.manana || 0,
      promedioDiario: ventas.promedioDiario || 0,
    },

    productoRecomendado:
      tendencia.productoMasVendido || null,

    prioridad: {
      titulo: principal.titulo || "",
      accion: principal.accion || "",
      prioridad: principal.prioridad || "media",
    },

    resumen: [
      `Estado general: ${salud.estado || "Sin datos"}`,
      `Venta estimada: $${Number(
        ventas.manana || 0
      ).toLocaleString("es-AR")}`,
      `Producto recomendado: ${
        tendencia.productoMasVendido ||
        "Sin datos"
      }`,
      principal.accion || "",
    ].filter(Boolean),
  };
}

module.exports = {
  generarGerenteVirtual,
};