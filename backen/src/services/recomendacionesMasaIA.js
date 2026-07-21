function convertirNumero(valor, valorPredeterminado = 0) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : valorPredeterminado;
}

function crearRecomendacion({
  id,
  tipo,
  prioridad = "media",
  titulo,
  mensaje,
  accion = "",
  datos = {},
}) {
  return {
    id,
    tipo,
    prioridad,
    titulo,
    mensaje,
    accion,
    datos,
  };
}

function prioridadNumerica(prioridad) {
  const prioridades = {
    critica: 1,
    alta: 2,
    media: 3,
    baja: 4,
    positiva: 5,
  };

  return prioridades[prioridad] || 99;
}

function generarRecomendacionesStock(dashboard) {
  const recomendaciones = [];

  const stock = dashboard.stock || {};

  const criticos = Array.isArray(stock.criticos)
    ? stock.criticos
    : [];

  criticos.forEach((item, indice) => {
    const nombre =
      item.ingrediente ||
      "Insumo sin nombre";

    const cantidad =
      convertirNumero(item.cantidad);

    const unidad = item.unidad
      ? ` ${item.unidad}`
      : "";

    if (item.nivel === "agotado") {
      recomendaciones.push(
        crearRecomendacion({
          id: `stock-agotado-${indice}`,
          tipo: "stock",
          prioridad: "critica",
          titulo: `${nombre} está agotado`,
          mensaje:
            `No queda stock de ${nombre}. Esto puede impedir la preparación de productos.`,
          accion:
            `Comprar ${nombre} de manera urgente.`,
          datos: {
            ingrediente: nombre,
            cantidad,
            unidad: item.unidad || "",
            nivel: item.nivel,
          },
        })
      );

      return;
    }

    if (item.nivel === "critico") {
      recomendaciones.push(
        crearRecomendacion({
          id: `stock-critico-${indice}`,
          tipo: "stock",
          prioridad: "alta",
          titulo: `Stock crítico de ${nombre}`,
          mensaje:
            `Quedan ${cantidad}${unidad} de ${nombre}. El nivel está por debajo de lo recomendado.`,
          accion:
            `Incluir ${nombre} en la próxima compra.`,
          datos: {
            ingrediente: nombre,
            cantidad,
            unidad: item.unidad || "",
            nivel: item.nivel,
          },
        })
      );

      return;
    }

    recomendaciones.push(
      crearRecomendacion({
        id: `stock-bajo-${indice}`,
        tipo: "stock",
        prioridad: "media",
        titulo: `Stock bajo de ${nombre}`,
        mensaje:
          `${nombre} se encuentra cerca del nivel mínimo.`,
        accion:
          `Revisar el consumo y programar su reposición.`,
        datos: {
          ingrediente: nombre,
          cantidad,
          unidad: item.unidad || "",
          nivel: item.nivel,
        },
      })
    );
  });

  return recomendaciones;
}

function generarRecomendacionesVentas(dashboard) {
  const recomendaciones = [];

  const ventas = dashboard.ventas || {};

  const cantidadHoy =
    convertirNumero(ventas.cantidadHoy);

  const totalHoy =
    convertirNumero(ventas.totalHoy);

  const ranking = Array.isArray(
    ventas.rankingProductos
  )
    ? ventas.rankingProductos
    : [];

  if (cantidadHoy === 0) {
    recomendaciones.push(
      crearRecomendacion({
        id: "ventas-sin-movimiento",
        tipo: "ventas",
        prioridad: "alta",
        titulo: "Todavía no hay ventas registradas",
        mensaje:
          "No se detectaron ventas durante el día analizado.",
        accion:
          "Revisar si Caja está registrando correctamente las operaciones o preparar una promoción.",
        datos: {
          cantidadVentas: 0,
          totalVendido: 0,
        },
      })
    );

    return recomendaciones;
  }

  const productoTop = ranking[0];

  if (productoTop) {
    recomendaciones.push(
      crearRecomendacion({
        id: "ventas-producto-lider",
        tipo: "ventas",
        prioridad: "positiva",
        titulo: `${productoTop.nombre} lidera las ventas`,
        mensaje:
          `Se vendieron ${convertirNumero(
            productoTop.cantidad
          )} unidades del producto más solicitado.`,
        accion:
          "Mantener disponibilidad de sus ingredientes y controlar su preparación.",
        datos: {
          producto: productoTop.nombre,
          cantidad: convertirNumero(
            productoTop.cantidad
          ),
          facturacion: convertirNumero(
            productoTop.facturacion
          ),
        },
      })
    );
  }

  recomendaciones.push(
    crearRecomendacion({
      id: "ventas-resumen-dia",
      tipo: "ventas",
      prioridad: "baja",
      titulo: "Rendimiento de ventas del día",
      mensaje:
        `Se registraron ${cantidadHoy} ventas por un total de $${Math.round(
          totalHoy
        ).toLocaleString("es-AR")}.`,
      accion:
        "Comparar este resultado con otros días de la semana cuando exista suficiente historial.",
      datos: {
        cantidadVentas: cantidadHoy,
        totalVendido: totalHoy,
        ticketPromedio: convertirNumero(
          ventas.ticketPromedio
        ),
      },
    })
  );

  return recomendaciones;
}

function generarRecomendacionesRentabilidad(
  dashboard
) {
  const recomendaciones = [];

  const rentabilidad =
    dashboard.rentabilidad || {};

  const promedio =
    convertirNumero(
      rentabilidad.promedio
    );

  const productoMasRentable =
    rentabilidad.productoMasRentable;

  if (promedio > 0 && promedio < 30) {
    recomendaciones.push(
      crearRecomendacion({
        id: "rentabilidad-margen-bajo",
        tipo: "rentabilidad",
        prioridad: "alta",
        titulo: "Rentabilidad promedio baja",
        mensaje:
          `El margen promedio estimado es de ${promedio.toFixed(
            1
          )} %.`,
        accion:
          "Revisar precios de venta, costos de recetas y desperdicios.",
        datos: {
          margenPromedio: promedio,
        },
      })
    );
  } else if (promedio >= 30) {
    recomendaciones.push(
      crearRecomendacion({
        id: "rentabilidad-margen-saludable",
        tipo: "rentabilidad",
        prioridad: "positiva",
        titulo: "Margen promedio saludable",
        mensaje:
          `La rentabilidad promedio estimada es de ${promedio.toFixed(
            1
          )} %.`,
        accion:
          "Mantener actualizados los precios de insumos para conservar la precisión.",
        datos: {
          margenPromedio: promedio,
        },
      })
    );
  }

  if (productoMasRentable) {
    recomendaciones.push(
      crearRecomendacion({
        id: "rentabilidad-producto-lider",
        tipo: "rentabilidad",
        prioridad: "media",
        titulo:
          `${productoMasRentable.nombre} tiene el mejor margen`,
        mensaje:
          `Su margen estimado es de ${convertirNumero(
            productoMasRentable.margen
          ).toFixed(1)} %.`,
        accion:
          "Evaluar su incorporación en promociones sin reducir excesivamente el margen.",
        datos: {
          producto:
            productoMasRentable.nombre,
          precio: convertirNumero(
            productoMasRentable.precio
          ),
          costo: convertirNumero(
            productoMasRentable.costo
          ),
          ganancia: convertirNumero(
            productoMasRentable.ganancia
          ),
          margen: convertirNumero(
            productoMasRentable.margen
          ),
        },
      })
    );
  }

  return recomendaciones;
}

function generarRecomendacionesDelivery(
  dashboard
) {
  const recomendaciones = [];

  const delivery = dashboard.delivery || {};

  const disponibles =
    convertirNumero(delivery.disponibles);

  const enReparto =
    convertirNumero(delivery.enReparto);

  const tiempoPromedio =
    convertirNumero(
      delivery.tiempoPromedio
    );

  if (
    enReparto > 0 &&
    disponibles === 0
  ) {
    recomendaciones.push(
      crearRecomendacion({
        id: "delivery-sin-disponibles",
        tipo: "delivery",
        prioridad: "alta",
        titulo:
          "No hay repartidores disponibles",
        mensaje:
          "Todos los repartidores activos se encuentran realizando entregas.",
        accion:
          "Informar tiempos estimados más largos o limitar temporalmente nuevos envíos.",
        datos: {
          disponibles,
          enReparto,
        },
      })
    );
  }

  if (tiempoPromedio > 45) {
    recomendaciones.push(
      crearRecomendacion({
        id: "delivery-demoras",
        tipo: "delivery",
        prioridad: "media",
        titulo:
          "El tiempo promedio de entrega es elevado",
        mensaje:
          `Las entregas están demorando aproximadamente ${tiempoPromedio.toFixed(
            0
          )} minutos.`,
        accion:
          "Revisar zonas de reparto, cantidad de pedidos simultáneos y disponibilidad de repartidores.",
        datos: {
          tiempoPromedio,
        },
      })
    );
  }

  return recomendaciones;
}

function generarRecomendacionesSalud(
  dashboard
) {
  const recomendaciones = [];

  const salud =
    dashboard.saludNegocio || {};

  const puntaje =
    convertirNumero(salud.puntaje);

  if (puntaje < 55) {
    recomendaciones.push(
      crearRecomendacion({
        id: "salud-critica",
        tipo: "salud",
        prioridad: "critica",
        titulo:
          "La salud general del negocio requiere atención",
        mensaje:
          `El puntaje actual es ${puntaje} sobre 100.`,
        accion:
          "Atender primero las recomendaciones críticas de stock, rentabilidad y ventas.",
        datos: {
          puntaje,
          estado: salud.estado || "",
        },
      })
    );
  } else if (puntaje < 70) {
    recomendaciones.push(
      crearRecomendacion({
        id: "salud-atencion",
        tipo: "salud",
        prioridad: "alta",
        titulo:
          "Hay áreas importantes para mejorar",
        mensaje:
          `La salud del negocio es ${salud.estado || "Atención"} con ${puntaje} puntos.`,
        accion:
          "Revisar los indicadores con menor puntaje.",
        datos: {
          puntaje,
          estado: salud.estado || "",
          detalle: salud.detalle || {},
        },
      })
    );
  } else {
    recomendaciones.push(
      crearRecomendacion({
        id: "salud-positiva",
        tipo: "salud",
        prioridad: "positiva",
        titulo:
          "La operación presenta una buena salud general",
        mensaje:
          `El negocio tiene un puntaje de ${puntaje} sobre 100.`,
        accion:
          "Mantener el control de stock, costos y ventas para conservar este resultado.",
        datos: {
          puntaje,
          estado: salud.estado || "",
        },
      })
    );
  }

  return recomendaciones;
}

function generarRecomendacionesMasaIA(
  dashboard
) {
  if (
    !dashboard ||
    typeof dashboard !== "object"
  ) {
    throw new Error(
      "Se necesita un dashboard válido para generar recomendaciones."
    );
  }

  const recomendaciones = [
    ...generarRecomendacionesStock(
      dashboard
    ),
    ...generarRecomendacionesVentas(
      dashboard
    ),
    ...generarRecomendacionesRentabilidad(
      dashboard
    ),
    ...generarRecomendacionesDelivery(
      dashboard
    ),
    ...generarRecomendacionesSalud(
      dashboard
    ),
  ];

  recomendaciones.sort(
    (recomendacionA, recomendacionB) =>
      prioridadNumerica(
        recomendacionA.prioridad
      ) -
      prioridadNumerica(
        recomendacionB.prioridad
      )
  );

  const cantidadCriticas =
    recomendaciones.filter(
      (item) =>
        item.prioridad === "critica"
    ).length;

  const cantidadAltas =
    recomendaciones.filter(
      (item) =>
        item.prioridad === "alta"
    ).length;

  return {
    generadoEn: new Date().toISOString(),

    resumen: {
      cantidadTotal:
        recomendaciones.length,

      cantidadCriticas,

      cantidadAltas,

      requiereAtencion:
        cantidadCriticas > 0 ||
        cantidadAltas > 0,
    },

    recomendacionPrincipal:
      recomendaciones[0] || null,

    recomendaciones:
      recomendaciones.slice(0, 20),
  };
}

module.exports = {
  generarRecomendacionesMasaIA,
};