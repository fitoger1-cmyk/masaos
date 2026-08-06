import "./HeroStats.css";

function HeroStats({
  envio,
}) {
  const indicadores = [
    {
      icono: "🍕",
      valor: "+12.500",
      titulo: "Pedidos entregados",
    },
    {
      icono: "⭐",
      valor: "4.9",
      titulo: "Valoración",
    },
    {
      icono: "🚚",
      valor: envio || "Sin cargo",
      titulo: "Delivery",
    },
    {
      icono: "🕒",
      valor: "25-35 min",
      titulo: "Tiempo estimado",
    },
    {
      icono: "💳",
      valor: "Mercado Pago",
      titulo: "Pagá online",
    },
  ];

  return (
    <section className="hero-stats">
      <div className="container hero-stats__grid">

        {indicadores.map((item) => (
          <article
            key={item.titulo}
            className="hero-stats__card fade-in"
          >
            <span className="hero-stats__icono">
              {item.icono}
            </span>

            <strong>
              {item.valor}
            </strong>

            <small>
              {item.titulo}
            </small>
          </article>
        ))}

      </div>
    </section>
  );
}

export default HeroStats;