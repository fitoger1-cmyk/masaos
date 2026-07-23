import Card from "./Card";

function StatCard({
  titulo,
  valor,
  subtitulo,
  icono,
  color = "primary",
}) {
  return (
    <Card className={`stat-card stat-${color}`}>
      <div className="stat-card-top">
        <div className="stat-icono">
          {icono}
        </div>

        <div className="stat-info">
          <span>{titulo}</span>

          <h2>{valor}</h2>

          {subtitulo && (
            <small>{subtitulo}</small>
          )}
        </div>
      </div>
    </Card>
  );
}

export default StatCard;