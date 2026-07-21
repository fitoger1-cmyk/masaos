function normalizarTexto(valor = "") {
  return String(valor)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function contieneAlgunaFrase(texto, frases = []) {
  return frases.some((frase) =>
    texto.includes(normalizarTexto(frase))
  );
}

const reglasIntenciones = [
  {
    intencion: "produccion",
    frases: [
      "que deberia producir",
      "que producir mañana",
      "que preparo mañana",
      "produccion de mañana",
      "cuanto producir",
      "cuantos bollos preparo",
      "que conviene cocinar",
      "que conviene preparar",
      "plan de produccion",
      "produccion recomendada",
    ],
  },

  {
    intencion: "prediccion_ventas",
    frases: [
      "cuanto voy a vender mañana",
      "cuanto vendere mañana",
      "prediccion de mañana",
      "ventas de mañana",
      "venta estimada mañana",
    ],
  },

  {
    intencion: "prediccion_fin_semana",
    frases: [
      "fin de semana",
      "finde",
      "sabado y domingo",
      "ventas del fin de semana",
    ],
  },

  {
    intencion: "demanda",
    frases: [
      "mayor demanda",
      "mas demanda",
      "que producto se vendera mas",
      "producto tendra mas ventas",
      "producto con mayor demanda",
    ],
  },

  {
    intencion: "ventas_hoy",
    frases: [
      "cuanto vendi",
      "ventas de hoy",
      "vendi hoy",
      "facture hoy",
      "facturacion de hoy",
      "como vienen las ventas",
    ],
  },

  {
    intencion: "producto_mas_vendido",
    frases: [
      "producto mas vendido",
      "pizza mas vendida",
      "que vendo mas",
      "ranking de productos",
      "ranking",
    ],
  },

  {
    intencion: "rentabilidad",
    frases: [
      "mas rentable",
      "deja mas ganancia",
      "mejor margen",
      "rentabilidad",
      "producto que mas ganancia deja",
    ],
  },

  {
    intencion: "cliente_destacado",
    frases: [
      "mejor cliente",
      "cliente destacado",
      "cliente que mas compra",
      "quien compra mas",
    ],
  },

  {
    intencion: "stock",
    frases: [
      "que tengo que comprar",
      "que debo comprar",
      "stock bajo",
      "stock critico",
      "insumos bajos",
      "reponer",
      "que me falta comprar",
    ],
  },

  {
    intencion: "delivery",
    frases: [
      "delivery",
      "repartidor",
      "repartidores",
      "entregas",
      "estado de los repartidores",
    ],
  },

  {
    intencion: "salud_negocio",
    frases: [
      "salud del negocio",
      "como esta el negocio",
      "estado general",
      "resumen general",
      "como viene el negocio",
    ],
  },

  {
    intencion: "recomendaciones",
    frases: [
      "que me recomendas",
      "que recomendas",
      "que deberia hacer",
      "que hago hoy",
      "que atender primero",
      "prioridades",
      "decisiones",
    ],
  },

  {
    intencion: "alertas",
    frases: [
      "alerta",
      "alertas",
      "problema",
      "problemas",
      "atencion",
      "recomendacion",
    ],
  },

  {
    intencion: "ayuda",
    frases: [
      "que podes hacer",
      "ayuda",
      "preguntas",
      "como usar masaia",
    ],
  },
];

function detectarIntencion(pregunta = "") {
  const texto = normalizarTexto(pregunta);

  if (!texto) {
    return {
      intencion: "vacio",
      confianza: 0,
      texto,
    };
  }

  for (const regla of reglasIntenciones) {
    if (contieneAlgunaFrase(texto, regla.frases)) {
      return {
        intencion: regla.intencion,
        confianza: 1,
        texto,
      };
    }
  }

  return {
    intencion: "general",
    confianza: 0,
    texto,
  };
}

module.exports = {
  detectarIntencion,
  normalizarTexto,
};