function obtenerFecha(d) {
  return new Date(d).toDateString();
}

function convertirNumero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function generarPrediccionesMasaIA({
  ventas = [],
  productos = [],
}) {

  const hoy = new Date();

  const dias = {};

  ventas.forEach((venta) => {

    const fecha = obtenerFecha(
      venta.fecha || venta.createdAt || hoy
    );

    dias[fecha] = (dias[fecha] || 0)
      + convertirNumero(venta.total);
  });

  const historial =
    Object.values(dias);

  const promedio =
    historial.length
      ? historial.reduce(
          (a, b) => a + b,
          0
        ) / historial.length
      : 0;

  const prediccionManana =
    promedio * 1.05;

  const prediccionFinSemana =
    promedio * 1.40;

  const ranking = {};

  ventas.forEach((venta) => {

    if (!venta.producto) return;

    ranking[venta.producto] =
      (ranking[venta.producto] || 0) + 1;

  });

  const productoMasVendido =
    Object.entries(ranking)
      .sort((a,b)=>b[1]-a[1])[0];

  return {

    generadoEn:
      new Date().toISOString(),

    ventas:{

      promedioDiario:
        Math.round(promedio),

      manana:
        Math.round(prediccionManana),

      finDeSemana:
        Math.round(prediccionFinSemana)

    },

    tendencia:{

      productoMasVendido:
        productoMasVendido
          ? productoMasVendido[0]
          : null,

      unidades:
        productoMasVendido
          ? productoMasVendido[1]
          : 0

    }

  };

}

module.exports={
  generarPrediccionesMasaIA
};