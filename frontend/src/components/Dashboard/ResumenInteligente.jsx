    function ResumenInteligente({ metricas }) {
  const mensajes = [];

  if (metricas.productoEstrella) {
    mensajes.push({
      icono: "🏆",
      titulo: "Producto estrella",
      texto:
        `${metricas.productoEstrella.nombre} ` +
        `lidera con ${metricas.productoEstrella.cantidad} unidades.`,
      clase: "positivo",
    });
  }

  if (metricas.stockCritico.length > 0) {
    mensajes.push({
      icono: "⚠️",
      titulo: "Stock bajo",
      texto:
        "Revisá: " +
        metricas.stockCritico
          .slice(0, 3)
          .map((item) => item.ingrediente)
          .join(", ") +
        ".",
      clase: "peligro",
    });
  }

  if (metricas.pedidosEnCocina > 0) {
    mensajes.push({
      icono: "👨‍🍳",
      titulo: "Cocina activa",
      texto:
        `Hay ${metricas.pedidosEnCocina} ` +
        `pedidos en preparación o pendientes.`,
      clase: "",
    });
  }

  if (mensajes.length === 0) {
    mensajes.push({
      icono: "✅",
      titulo: "Todo bajo control",
      texto:
        "No hay alertas importantes en este momento.",
      clase: "positivo",
    });
  }

  return (
    <article className="dashboard-enterprise-panel">
      <div className="dashboard-enterprise-panel-titulo">
        <div>
          <h3>🤖 Resumen inteligente</h3>
          <p>Información útil para decidir.</p>
        </div>
      </div>

      <div className="dashboard-enterprise-alertas">
        {mensajes.map((mensaje) => (
          <div
            className={`dashboard-enterprise-alerta ${mensaje.clase}`}
            key={mensaje.titulo}
          >
            <span>{mensaje.icono}</span>

            <div>
              <strong>{mensaje.titulo}</strong>
              <p>{mensaje.texto}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default ResumenInteligente;

    
