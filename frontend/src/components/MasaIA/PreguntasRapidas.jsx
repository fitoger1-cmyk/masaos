    const PREGUNTAS = [
  {
    icono: "💰",
    titulo: "Ventas",
    texto: "¿Cuánto vendí hoy?",
  },
  {
    icono: "🍕",
    titulo: "Productos",
    texto: "¿Cuál fue el producto más vendido?",
  },
  {
    icono: "📈",
    titulo: "Rentabilidad",
    texto: "¿Qué producto deja más ganancia?",
  },
  {
    icono: "📦",
    titulo: "Stock",
    texto: "¿Qué tengo que comprar?",
  },
  {
    icono: "👤",
    titulo: "Clientes",
    texto: "¿Quién es mi mejor cliente?",
  },
  {
    icono: "🛵",
    titulo: "Delivery",
    texto: "¿Cómo está el delivery?",
  },
];

function PreguntasRapidas({
  onPreguntar,
  disabled,
}) {
  return (
    <div className="chat-masaia-preguntas">
      {PREGUNTAS.map((pregunta) => (
        <button
          type="button"
          key={pregunta.texto}
          onClick={() =>
            onPreguntar(pregunta.texto)
          }
          disabled={disabled}
        >
          <span className="chat-masaia-pregunta-icono">
            {pregunta.icono}
          </span>

          <span className="chat-masaia-pregunta-contenido">
            <strong>
              {pregunta.titulo}
            </strong>

            <small>
              {pregunta.texto}
            </small>
          </span>
        </button>
      ))}
    </div>
  );
}

export default PreguntasRapidas;

    
