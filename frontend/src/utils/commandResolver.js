export function resolverComando(texto) {
  const consulta = texto.trim().toLowerCase();

  if (!consulta) {
    return {
      tipo: "vacio",
    };
  }

  if (consulta.includes("?")) {
    return {
      tipo: "ia",
      pregunta: texto,
    };
  }

  const palabrasIA = [
    "cuanto",
    "qué",
    "que",
    "como",
    "cómo",
    "por que",
    "por qué",
    "deberia",
    "debería",
    "conviene",
    "recomendas",
    "recomendás",
    "mejor",
  ];

  const esPreguntaIA = palabrasIA.some((palabra) =>
    consulta.includes(palabra)
  );

  if (esPreguntaIA) {
    return {
      tipo: "ia",
      pregunta: texto,
    };
  }

  return {
    tipo: "comando",
    texto,
  };
}