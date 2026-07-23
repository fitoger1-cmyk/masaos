    function EstadoSistema({
  socketConectado,
  metricas,
}) {
  const estados = [
    { nombre: "Backend", activo: true },
    {
      nombre: "Tiempo real",
      activo: socketConectado,
    },
    { nombre: "Caja", activo: true },
    { nombre: "Cocina", activo: true },
    {
      nombre: "Stock",
      activo: Array.isArray(
        metricas.stockCritico
      ),
    },
  ];

  return (
    <article className="dashboard-enterprise-panel">
      <div className="dashboard-enterprise-panel-titulo">
        <div>
          <h3>🟢 Centro de operaciones</h3>
          <p>Estado actual de MasaOS.</p>
        </div>
      </div>

      <div className="dashboard-enterprise-estados">
        {estados.map((estado) => (
          <div
            className="dashboard-enterprise-estado-item"
            key={estado.nombre}
          >
            <span
              className={
                estado.activo
                  ? "estado-online"
                  : "estado-offline"
              }
            />

            <strong>{estado.nombre}</strong>

            <small>
              {estado.activo
                ? "Operativo"
                : "Sin conexión"}
            </small>
          </div>
        ))}
      </div>
    </article>
  );
}

export default EstadoSistema;

    
