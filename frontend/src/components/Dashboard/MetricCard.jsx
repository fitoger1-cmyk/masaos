function MetricCard({
  icono,
  titulo,
  valor,
  color = "#b71c1c",
}) {
  return (
    <article
      className="metric-card"
    >
      <div
        className="metric-card__icono"
        style={{ background: color }}
      >
        {icono}
      </div>

      <div className="metric-card__contenido">
        <span>{titulo}</span>

        <strong>{valor}</strong>
      </div>
    </article>
  );
}

export default MetricCard;