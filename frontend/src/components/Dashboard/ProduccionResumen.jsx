    function ProduccionResumen({ produccion }) {
  return (
    <article className="dashboard-enterprise-panel">
      <div className="dashboard-enterprise-panel-titulo">
        <div>
          <h3>🏭 Capacidad de producción</h3>
          <p>Productos con menor disponibilidad.</p>
        </div>
      </div>

      {produccion.length === 0 ? (
        <p className="dashboard-enterprise-vacio">
          No hay información de producción.
        </p>
      ) : (
        <div className="dashboard-enterprise-produccion">
          {produccion.map((item) => (
            <div
              className="dashboard-enterprise-produccion-item"
              key={item.productoId}
            >
              <div>
                <strong>{item.producto}</strong>
                <small>
                  Limita:{" "}
                  {item.ingredienteLimitante || "-"}
                </small>
              </div>

              <span>
                {Number(
                  item.produccionMaxima || 0
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default ProduccionResumen;

    
