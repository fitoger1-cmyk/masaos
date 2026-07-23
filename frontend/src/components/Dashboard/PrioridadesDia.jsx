function PrioridadesDia({ recomendaciones = [] }) {
  const prioridades = Array.isArray(recomendaciones)
    ? recomendaciones.slice(0, 5)
    : [];

  function obtenerIcono(prioridad) {
    const valor = String(prioridad || "").toLowerCase();

    if (valor === "critica") return "🔴";
    if (valor === "alta") return "🟠";
    if (valor === "positiva") return "🟢";

    return "🟡";
  }

  if (prioridades.length === 0) {
    return (
      <section className="dashboard-card prioridades-dia-card">
        <div className="dashboard-card-header">
          <div>
            <p>CENTRO DE DECISIONES</p>
            <h3>🎯 Prioridades del día</h3>
          </div>
        </div>

        <p className="prioridades-dia-vacio">
          No se detectaron prioridades importantes.
        </p>
      </section>
    );
  }

  return (
    <section className="dashboard-card prioridades-dia-card">
      <div className="dashboard-card-header">
        <div>
          <p>CENTRO DE DECISIONES</p>
          <h3>🎯 Prioridades del día</h3>
        </div>

        <span className="prioridades-dia-total">
          {prioridades.length}
        </span>
      </div>

      <div className="prioridades-dia-lista">
        {prioridades.map((item, index) => (
          <article
            key={`${item.tipo || "prioridad"}-${index}`}
            className={`prioridad-dia-item prioridad-dia-${String(
              item.prioridad || "media"
            ).toLowerCase()}`}
          >
            <div className="prioridad-dia-posicion">
              {index + 1}
            </div>

            <div className="prioridad-dia-contenido">
              <div className="prioridad-dia-titulo">
                <span>
                  {obtenerIcono(item.prioridad)}
                </span>

                <strong>
                  {item.titulo || "Recomendación"}
                </strong>
              </div>

              <p>
                {item.accion ||
                  item.mensaje ||
                  "Sin detalle disponible."}
              </p>
            </div>

            <span className="prioridad-dia-badge">
              {String(
                item.prioridad || "media"
              ).toUpperCase()}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PrioridadesDia;