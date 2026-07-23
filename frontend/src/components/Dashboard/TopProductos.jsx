    function TopProductos({ productos }) {
  return (
    <article className="dashboard-enterprise-panel">
      <div className="dashboard-enterprise-panel-titulo">
        <div>
          <h3>🏆 Productos más vendidos</h3>
          <p>Ranking histórico por unidades.</p>
        </div>
      </div>

      {productos.length === 0 ? (
        <p className="dashboard-enterprise-vacio">
          Todavía no hay ventas suficientes.
        </p>
      ) : (
        <div className="dashboard-enterprise-ranking">
          {productos.map((producto, indice) => (
            <div
              className="dashboard-enterprise-ranking-item"
              key={producto.nombre}
            >
              <span>{indice + 1}</span>
              <div>
                <strong>{producto.nombre}</strong>
                <small>
                  {producto.cantidad} unidades
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default TopProductos;

    
