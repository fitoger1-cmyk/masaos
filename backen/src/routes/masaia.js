    const express = require("express");

const {
  generarDashboardMasaIA,
} = require("../services/masaIAService");
const {
  generarRecomendacionesMasaIA,
} = require("../services/recomendacionesMasaIA");
const {
  generarGerenteVirtual,
} = require("../services/gerenteVirtualMasaIA");
const {
  generarPrediccionesMasaIA,
} = require("../services/prediccionesMasaIA");
const {
  detectarIntencion,
} = require("../services/intencionesMasaIA");
const {
  responderVentas,
} = require("../services/intenciones/ventasMasaIA");
const {
  responderProduccion,
} = require("../services/intenciones/produccionMasaIA");

function normalizarTexto(valor = "") {
  return String(valor)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatearMoneda(valor) {
  return Number(valor || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

function crearRespuesta({
  titulo,
  mensaje,
  datos = [],
  sugerencias = [],
  tipo = "informacion",
}) {
  return {
    tipo,
    titulo,
    mensaje,
    datos,
    sugerencias,
    generadoEn: new Date().toISOString(),
  };
}

function responderPregunta(
  pregunta,
  dashboard,
  predicciones
) {
  const texto = normalizarTexto(pregunta);
  const analisis = detectarIntencion(pregunta);

  const intencion = analisis.intencion;

  const resumen = dashboard.resumen || {};
  const ventas = dashboard.ventas || {};
  const clientes = dashboard.clientes || {};
  const stock = dashboard.stock || {};
  const rentabilidad = dashboard.rentabilidad || {};
  const delivery = dashboard.delivery || {};
  const salud = dashboard.saludNegocio || {};
  const alertas = Array.isArray(dashboard.alertas)
    ? dashboard.alertas
    : [];

const prediccionVentas =
  predicciones?.ventas || {};

const tendencia =
  predicciones?.tendencia || {};
  /*
   * VENTAS DEL DÍA
   */

  if (intencion === "ventas_hoy") {
  return responderVentas({
    ventas,
    crearRespuesta,
  });
}

  /*
   * PRODUCTO MÁS VENDIDO
   */
  if (
    texto.includes("producto mas vendido") ||
    texto.includes("producto más vendido") ||
    texto.includes("pizza mas vendida") ||
    texto.includes("pizza más vendida") ||
    texto.includes("que vendo mas") ||
    texto.includes("qué vendo más") ||
    texto.includes("ranking")
  ) {
    const ranking = Array.isArray(
      ventas.rankingProductos
    )
      ? ventas.rankingProductos
      : [];

    const productoTop = ranking[0];

    if (!productoTop) {
      return crearRespuesta({
        tipo: "producto",
        titulo: "Ranking de productos",
        mensaje:
          "Todavía no hay ventas suficientes para identificar un producto líder.",
        sugerencias: [
          "¿Cuánto vendí hoy?",
          "¿Cómo está el stock?",
        ],
      });
    }

    return crearRespuesta({
      tipo: "producto",
      titulo: "Producto más vendido",
      mensaje:
        `${productoTop.nombre} lidera las ventas con ${productoTop.cantidad} unidades.`,
      datos: ranking
        .slice(0, 5)
        .map((producto) => ({
          etiqueta:
            `${producto.posicion}. ${producto.nombre}`,
          valor:
            `${producto.cantidad} unidades`,
        })),
      sugerencias: [
        "¿Qué producto deja más ganancia?",
        "¿Qué insumos están bajos?",
        "¿Cuánto vendí hoy?",
      ],
    });
  }

  /*
   * PRODUCTO MÁS RENTABLE
   */
  if (
    texto.includes("mas rentable") ||
    texto.includes("más rentable") ||
    texto.includes("deja mas ganancia") ||
    texto.includes("deja más ganancia") ||
    texto.includes("mejor margen") ||
    texto.includes("rentabilidad")
  ) {
    const producto =
      rentabilidad.productoMasRentable;

    if (!producto) {
      return crearRespuesta({
        tipo: "rentabilidad",
        titulo: "Rentabilidad",
        mensaje:
          "No hay información suficiente para calcular la rentabilidad de los productos.",
      });
    }

    return crearRespuesta({
      tipo: "rentabilidad",
      titulo: "Producto más rentable",
      mensaje:
        `${producto.nombre} tiene el margen estimado más alto: ${Number(
          producto.margen || 0
        ).toFixed(1)} %.`,
      datos: [
        {
          etiqueta: "Precio de venta",
          valor: formatearMoneda(
            producto.precio
          ),
        },
        {
          etiqueta: "Costo estimado",
          valor: formatearMoneda(
            producto.costo
          ),
        },
        {
          etiqueta: "Ganancia estimada",
          valor: formatearMoneda(
            producto.ganancia
          ),
        },
        {
          etiqueta: "Margen",
          valor:
            `${Number(
              producto.margen || 0
            ).toFixed(1)} %`,
        },
        {
          etiqueta: "Margen promedio",
          valor:
            `${Number(
              rentabilidad.promedio || 0
            ).toFixed(1)} %`,
        },
      ],
      sugerencias: [
        "¿Cuál es el producto más vendido?",
        "¿Cómo está la salud del negocio?",
      ],
    });
  }

  /*
   * CLIENTE DESTACADO
   */
  if (
    texto.includes("mejor cliente") ||
    texto.includes("cliente destacado") ||
    texto.includes("cliente que mas compra") ||
    texto.includes("cliente que más compra") ||
    texto.includes("quien compra mas") ||
    texto.includes("quién compra más")
  ) {
    const cliente = clientes.destacado;

    if (!cliente) {
      return crearRespuesta({
        tipo: "cliente",
        titulo: "Cliente destacado",
        mensaje:
          "Todavía no hay información suficiente para identificar al mejor cliente.",
      });
    }

    return crearRespuesta({
      tipo: "cliente",
      titulo: "Cliente destacado",
      mensaje:
        `${cliente.nombre} es actualmente el cliente con mayor volumen de compras.`,
      datos: [
        {
          etiqueta: "Pedidos",
          valor: Number(
            cliente.cantidadPedidos || 0
          ),
        },
        {
          etiqueta: "Total gastado",
          valor: formatearMoneda(
            cliente.totalGastado
          ),
        },
        {
          etiqueta: "Teléfono",
          valor:
            cliente.telefono ||
            "Sin teléfono",
        },
        {
          etiqueta: "Última compra",
          valor:
            cliente.ultimaCompra ||
            "Sin fecha",
        },
      ],
      sugerencias: [
        "¿Cuánto vendí hoy?",
        "¿Cuál fue el producto más vendido?",
      ],
    });
  }

  /*
   * STOCK Y COMPRAS
   */
  if (
    texto.includes("que tengo que comprar") ||
    texto.includes("qué tengo que comprar") ||
    texto.includes("que debo comprar") ||
    texto.includes("qué debo comprar") ||
    texto.includes("stock bajo") ||
    texto.includes("stock critico") ||
    texto.includes("stock crítico") ||
    texto.includes("insumos bajos") ||
    texto.includes("reponer")
  ) {
    const criticos = Array.isArray(
      stock.criticos
    )
      ? stock.criticos
      : [];

    if (criticos.length === 0) {
      return crearRespuesta({
        tipo: "stock",
        titulo: "Estado del stock",
        mensaje:
          "No hay insumos en nivel crítico o bajo. No se detectan compras urgentes.",
        datos: [
          {
            etiqueta: "Insumos controlados",
            valor: Number(
              stock.cantidadInsumos || 0
            ),
          },
          {
            etiqueta: "Insumos críticos",
            valor: 0,
          },
        ],
        sugerencias: [
          "¿Cómo está la salud del negocio?",
          "¿Cuánto vendí hoy?",
        ],
      });
    }

    return crearRespuesta({
      tipo: "stock",
      titulo: "Compra recomendada",
      mensaje:
        `Hay ${criticos.length} insumo${
          criticos.length === 1 ? "" : "s"
        } que requiere${
          criticos.length === 1 ? "" : "n"
        } atención.`,
      datos: criticos
        .slice(0, 8)
        .map((item) => ({
          etiqueta: item.ingrediente,
          valor:
            `${item.cantidad}${
              item.unidad
                ? ` ${item.unidad}`
                : ""
            } · ${item.nivel}`,
        })),
      sugerencias: [
        "¿Cuál es el producto más rentable?",
        "¿Hay alertas importantes?",
      ],
      tipo: "advertencia",
    });
  }

  /*
   * DELIVERY
   */
  if (
    texto.includes("delivery") ||
    texto.includes("repartidor") ||
    texto.includes("repartidores") ||
    texto.includes("entregas")
  ) {
    return crearRespuesta({
      tipo: "delivery",
      titulo: "Estado del delivery",
      mensaje:
        `Hay ${Number(
          delivery.disponibles || 0
        )} repartidores disponibles y ${Number(
          delivery.enReparto || 0
        )} en reparto.`,
      datos: [
        {
          etiqueta: "Repartidores activos",
          valor: Number(
            delivery.repartidoresActivos ||
              0
          ),
        },
        {
          etiqueta: "Disponibles",
          valor: Number(
            delivery.disponibles || 0
          ),
        },
        {
          etiqueta: "En reparto",
          valor: Number(
            delivery.enReparto || 0
          ),
        },
        {
          etiqueta: "Entregados hoy",
          valor: Number(
            delivery.entregadosHoy || 0
          ),
        },
        {
          etiqueta: "Tiempo promedio",
          valor:
            `${Number(
              delivery.tiempoPromedio || 0
            ).toFixed(1)} min`,
        },
      ],
      sugerencias: [
        "¿Hay alertas importantes?",
        "¿Cómo está la salud del negocio?",
      ],
    });
  }

  /*
   * SALUD DEL NEGOCIO
   */
  if (
    texto.includes("salud del negocio") ||
    texto.includes("como esta el negocio") ||
    texto.includes("cómo está el negocio") ||
    texto.includes("estado general") ||
    texto.includes("resumen general")
  ) {
    return crearRespuesta({
      tipo: "salud",
      titulo: "Salud del negocio",
      mensaje:
        `El estado general es ${salud.estado || "Sin datos"}, con un puntaje de ${Number(
          salud.puntaje || 0
        )} sobre 100.`,
      datos: [
        {
          etiqueta: "Ventas",
          valor:
            `${Number(
              salud.detalle?.ventas || 0
            )} / 100`,
        },
        {
          etiqueta: "Stock",
          valor:
            `${Number(
              salud.detalle?.stock || 0
            )} / 100`,
        },
        {
          etiqueta: "Rentabilidad",
          valor:
            `${Number(
              salud.detalle
                ?.rentabilidad || 0
            )} / 100`,
        },
        {
          etiqueta: "Clientes",
          valor:
            `${Number(
              salud.detalle?.clientes ||
                0
            )} / 100`,
        },
        {
          etiqueta: "Delivery",
          valor:
            `${Number(
              salud.detalle?.delivery ||
                0
            )} / 100`,
        },
      ],
      sugerencias: [
        "¿Qué tengo que comprar?",
        "¿Cuál es el producto más rentable?",
        "¿Cuánto vendí hoy?",
      ],
    });
  }
/*
 * RECOMENDACIONES INTELIGENTES
 */
if (
  texto.includes("que me recomendas") ||
  texto.includes("qué me recomendás") ||
  texto.includes("que recomendas") ||
  texto.includes("qué recomendás") ||
  texto.includes("que deberia hacer") ||
  texto.includes("qué debería hacer") ||
  texto.includes("que hago hoy") ||
  texto.includes("qué hago hoy") ||
  texto.includes("que atender primero") ||
  texto.includes("qué atender primero") ||
  texto.includes("prioridades") ||
  texto.includes("decisiones")
) {
  const analisis =
    generarRecomendacionesMasaIA(
      dashboard
    );

  const recomendaciones = Array.isArray(
    analisis.recomendaciones
  )
    ? analisis.recomendaciones
    : [];

  if (recomendaciones.length === 0) {
    return crearRespuesta({
      tipo: "recomendaciones",
      titulo: "Recomendaciones de MasaIA",
      mensaje:
        "No se detectaron recomendaciones importantes en este momento.",
      sugerencias: [
        "¿Cómo está la salud del negocio?",
        "¿Hay alertas importantes?",
        "¿Cuánto vendí hoy?",
      ],
    });
  }

  const principal =
    analisis.recomendacionPrincipal;

  return crearRespuesta({
    tipo: principal?.prioridad === "critica"
      ? "critico"
      : principal?.prioridad === "alta"
        ? "advertencia"
        : "recomendaciones",

    titulo: "Prioridades recomendadas",

    mensaje: principal
      ? `${principal.titulo}. ${principal.accion}`
      : "MasaIA generó recomendaciones para mejorar la operación.",

    datos: recomendaciones
      .slice(0, 8)
      .map((item) => ({
        etiqueta:
          `[${String(
            item.prioridad
          ).toUpperCase()}] ${item.titulo}`,

        valor:
          item.accion ||
          item.mensaje,
      })),

    sugerencias: [
      "¿Qué tengo que comprar?",
      "¿Cuál es el producto más rentable?",
      "¿Cómo está la salud del negocio?",
      "¿Hay alertas importantes?",
    ],
  });
}
  /*
   * ALERTAS
   */
  if (
    texto.includes("alerta") ||
    texto.includes("problema") ||
    texto.includes("atencion") ||
    texto.includes("atención") ||
    texto.includes("recomendacion") ||
    texto.includes("recomendación")
  ) {
    if (alertas.length === 0) {
      return crearRespuesta({
        tipo: "alertas",
        titulo: "Alertas de MasaIA",
        mensaje:
          "No hay alertas activas. La operación se encuentra estable.",
      });
    }

    return crearRespuesta({
      tipo: "alertas",
      titulo: "Alertas y recomendaciones",
      mensaje:
        `MasaIA detectó ${alertas.length} observaciones relevantes.`,
      datos: alertas.map(
        (alerta) => ({
          etiqueta: alerta.titulo,
          valor: alerta.mensaje,
        })
      ),
      sugerencias: [
        "¿Qué tengo que comprar?",
        "¿Cómo está la salud del negocio?",
      ],
    });
  }

  /*
   * AYUDA
   */
  if (
    texto.includes("que podes hacer") ||
    texto.includes("qué podés hacer") ||
    texto.includes("ayuda") ||
    texto.includes("preguntas")
  ) {
    return crearRespuesta({
      tipo: "ayuda",
      titulo: "¿Qué podés preguntarle a MasaIA?",
      mensaje:
        "Puedo analizar ventas, productos, rentabilidad, clientes, stock, delivery, alertas y salud general del negocio.",
      datos: [
        {
          etiqueta: "Ventas",
          valor: "¿Cuánto vendí hoy?",
        },
        {
          etiqueta: "Productos",
          valor:
            "¿Cuál fue el producto más vendido?",
        },
        {
          etiqueta: "Rentabilidad",
          valor:
            "¿Qué producto deja más ganancia?",
        },
        {
          etiqueta: "Stock",
          valor:
            "¿Qué tengo que comprar?",
        },
        {
          etiqueta: "Clientes",
          valor:
            "¿Quién es mi mejor cliente?",
        },
        {
          etiqueta: "Delivery",
          valor:
            "¿Cómo están los repartidores?",
        },
      ],
    });
  }
/*
 * PREDICCIÓN DE VENTAS PARA MAÑANA
 */
if (
  texto.includes("cuanto voy a vender mañana") ||
  texto.includes("cuánto voy a vender mañana") ||
  texto.includes("cuanto vendere mañana") ||
  texto.includes("cuánto venderé mañana") ||
  texto.includes("prediccion de mañana") ||
  texto.includes("predicción de mañana") ||
  texto.includes("ventas de mañana")
) {
  const montoManana = Number(
    prediccionVentas.manana || 0
  );

  const promedioDiario = Number(
    prediccionVentas.promedioDiario || 0
  );

  if (promedioDiario <= 0) {
    return crearRespuesta({
      tipo: "prediccion",
      titulo: "Predicción de ventas",
      mensaje:
        "Todavía no hay suficiente historial de ventas para estimar cuánto podrías vender mañana.",
      sugerencias: [
        "¿Cuánto vendí hoy?",
        "¿Qué me recomendás hacer?",
        "¿Cómo está la salud del negocio?",
      ],
    });
  }

  return crearRespuesta({
    tipo: "prediccion",
    titulo: "Predicción para mañana",
    mensaje:
      `Según el historial disponible, mañana podrías facturar aproximadamente ${formatearMoneda(
        montoManana
      )}.`,
    datos: [
      {
        etiqueta: "Venta estimada",
        valor: formatearMoneda(
          montoManana
        ),
      },
      {
        etiqueta: "Promedio diario",
        valor: formatearMoneda(
          promedioDiario
        ),
      },
      {
        etiqueta: "Producto con mayor demanda",
        valor:
          tendencia.productoMasVendido ||
          "Sin datos suficientes",
      },
      {
        etiqueta: "Unidades históricas",
        valor: Number(
          tendencia.unidades || 0
        ),
      },
    ],
    sugerencias: [
      "¿Cómo viene el fin de semana?",
      "¿Qué producto tendrá más demanda?",
      "¿Qué debería producir?",
    ],
  });
}

/*
 * PREDICCIÓN DEL FIN DE SEMANA
 */
if (
  texto.includes("fin de semana") ||
  texto.includes("finde") ||
  texto.includes("sabado y domingo") ||
  texto.includes("sábado y domingo")
) {
  const estimado = Number(
    prediccionVentas.finDeSemana || 0
  );

  const promedioDiario = Number(
    prediccionVentas.promedioDiario || 0
  );

  if (promedioDiario <= 0) {
    return crearRespuesta({
      tipo: "prediccion",
      titulo:
        "Predicción para el fin de semana",
      mensaje:
        "Todavía no hay suficiente historial para calcular una estimación confiable del fin de semana.",
      sugerencias: [
        "¿Cuánto vendí hoy?",
        "¿Qué me recomendás hacer?",
      ],
    });
  }

  return crearRespuesta({
    tipo: "prediccion",
    titulo:
      "Predicción para el fin de semana",
    mensaje:
      `La facturación diaria estimada para el fin de semana es de aproximadamente ${formatearMoneda(
        estimado
      )}.`,
    datos: [
      {
        etiqueta:
          "Facturación diaria estimada",
        valor: formatearMoneda(
          estimado
        ),
      },
      {
        etiqueta: "Promedio habitual",
        valor: formatearMoneda(
          promedioDiario
        ),
      },
      {
        etiqueta:
          "Producto con mayor demanda",
        valor:
          tendencia.productoMasVendido ||
          "Sin datos suficientes",
      },
    ],
    sugerencias: [
      "¿Cuánto voy a vender mañana?",
      "¿Qué debería producir?",
      "¿Qué tengo que comprar?",
    ],
  });
}

/*
 * PRODUCTO CON MAYOR DEMANDA
 */
if (
  texto.includes("mayor demanda") ||
  texto.includes("mas demanda") ||
  texto.includes("más demanda") ||
  texto.includes("que producto se vendera mas") ||
  texto.includes("qué producto se venderá más") ||
  texto.includes("producto tendra mas ventas") ||
  texto.includes("producto tendrá más ventas")
) {
  if (!tendencia.productoMasVendido) {
    return crearRespuesta({
      tipo: "prediccion",
      titulo: "Demanda estimada",
      mensaje:
        "Todavía no hay suficiente historial para identificar una tendencia de demanda.",
    });
  }

  return crearRespuesta({
    tipo: "prediccion",
    titulo:
      "Producto con mayor demanda estimada",
    mensaje:
      `${tendencia.productoMasVendido} es el producto con mayor presencia en el historial de ventas.`,
    datos: [
      {
        etiqueta: "Producto",
        valor:
          tendencia.productoMasVendido,
      },
      {
        etiqueta:
          "Unidades registradas",
        valor: Number(
          tendencia.unidades || 0
        ),
      },
    ],
    sugerencias: [
      "¿Cuánto voy a vender mañana?",
      "¿Qué debería producir?",
      "¿Qué tengo que comprar?",
    ],
  });
}
/*
 * PRODUCCIÓN RECOMENDADA
 */
if (intencion === "produccion") {
  return responderProduccion({
    ventas,
    predicciones,
    crearRespuesta,
  });
}
  /*
   * RESPUESTA GENERAL
   */
  return crearRespuesta({
    tipo: "general",
    titulo: "No pude interpretar completamente la pregunta",
    mensaje:
      "Probá preguntando por ventas, productos, rentabilidad, clientes, stock, delivery, alertas o salud del negocio.",
    sugerencias: [
      "¿Cuánto vendí hoy?",
      "¿Cuál fue el producto más vendido?",
      "¿Qué tengo que comprar?",
      "¿Quién es mi mejor cliente?",
      "¿Cómo está la salud del negocio?",
    ],
  });
}

function crearMasaIARouter({
  ventas,
  productos,
  stock,
  clientes,
  recetas,
  compras,
  repartidores,
}) {
  const router = express.Router();

  function generarDashboard(
    fechaReferencia = new Date()
  ) {
    return generarDashboardMasaIA({
      ventas,
      productos,
      stock,
      clientes,
      recetas,
      compras,
      repartidores,
      fechaReferencia,
    });
  }
  function generarPredicciones() {
  return generarPrediccionesMasaIA({
    ventas,
    productos,
  });
}
function generarInformeGerenteVirtual() {
  const dashboard = generarDashboard();

  const recomendaciones =
    generarRecomendacionesMasaIA(
      dashboard
    );

  const predicciones =
    generarPredicciones();

  return generarGerenteVirtual({
    dashboard,
    recomendaciones,
    predicciones,
  });
}

  router.get("/dashboard", (req, res) => {
    try {
      const fechaReferencia =
        req.query.fecha
          ? new Date(req.query.fecha)
          : new Date();

      if (
        Number.isNaN(
          fechaReferencia.getTime()
        )
      ) {
        return res.status(400).json({
          error:
            "La fecha enviada no es válida.",
        });
      }

      res.json(
        generarDashboard(
          fechaReferencia
        )
      );
    } catch (error) {
      console.error(
        "Error generando dashboard de MasaIA:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo generar el análisis de MasaIA.",
      });
    }
  });

  router.get("/salud", (req, res) => {
    try {
      const dashboard =
        generarDashboard();

      res.json({
        generadoEn:
          dashboard.generadoEn,
        saludNegocio:
          dashboard.saludNegocio,
        alertasActivas:
          dashboard.resumen
            .alertasActivas,
      });
    } catch (error) {
      console.error(
        "Error generando salud del negocio:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo calcular la salud del negocio.",
      });
    }
  });

  router.get("/alertas", (req, res) => {
    try {
      const dashboard =
        generarDashboard();

      res.json({
        generadoEn:
          dashboard.generadoEn,
        cantidad:
          dashboard.alertas.length,
        alertas: dashboard.alertas,
      });
    } catch (error) {
      console.error(
        "Error generando alertas de MasaIA:",
        error
      );

      res.status(500).json({
        error:
          "No se pudieron generar las alertas.",
      });
    }
  });
/*
 * RECOMENDACIONES INTELIGENTES
 *
 * GET /api/masaia/recomendaciones
 */
router.get("/recomendaciones", (req, res) => {
  try {
    const dashboard = generarDashboard();

    const recomendaciones =
      generarRecomendacionesMasaIA(
        dashboard
      );

    res.json(recomendaciones);
  } catch (error) {
    console.error(
      "Error generando recomendaciones de MasaIA:",
      error
    );

    res.status(500).json({
      error:
        "No se pudieron generar las recomendaciones de MasaIA.",
    });
  }
});
/*
 * PREDICCIONES DE MASAIA
 *
 * GET /api/masaia/predicciones
 */
router.get("/predicciones", (req, res) => {
  try {
    const predicciones =
      generarPredicciones();

    res.json(predicciones);
  } catch (error) {
    console.error(
      "Error generando predicciones de MasaIA:",
      error
    );

    res.status(500).json({
      error:
        "No se pudieron generar las predicciones de MasaIA.",
    });
  }
});
/*
 * GERENTE VIRTUAL DE MASAIA
 *
 * GET /api/masaia/gerente-virtual
 */
router.get("/gerente-virtual", (req, res) => {
  try {
    const informe =
      generarInformeGerenteVirtual();

    res.json(informe);
  } catch (error) {
    console.error(
      "Error generando informe del Gerente Virtual:",
      error
    );

    res.status(500).json({
      error:
        "No se pudo generar el informe del Gerente Virtual.",
    });
  }
});
  /*
   * CHAT DE MASAIA
   *
   * POST /api/masaia/preguntar
   *
   * Body:
   * {
   *   "pregunta": "¿Cuánto vendí hoy?"
   * }
   */
  router.post("/preguntar", (req, res) => {
    try {
      const pregunta = String(
        req.body.pregunta || ""
      ).trim();

      if (!pregunta) {
        return res.status(400).json({
          error:
            "Debés escribir una pregunta.",
        });
      }

      if (pregunta.length > 500) {
        return res.status(400).json({
          error:
            "La pregunta es demasiado larga.",
        });
      }

      const dashboard =
  generarDashboard();

const predicciones =
  generarPredicciones();

const respuesta =
  responderPregunta(
    pregunta,
    dashboard,
    predicciones
  );
      res.json({
        pregunta,
        respuesta,
      });
    } catch (error) {
      console.error(
        "Error respondiendo pregunta de MasaIA:",
        error
      );

      res.status(500).json({
        error:
          "MasaIA no pudo responder la pregunta.",
      });
    }
  });

  return router;
}

module.exports = crearMasaIARouter;
    
