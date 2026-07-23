    import PedidoProductos from "./PedidoProductos";

import {
  formatearCronometro,
  formatearHoraPedido,
  obtenerPrioridad,
  obtenerSegundosTranscurridos,
} from "./helpers";

function PedidoCard({
  pedido,
  horaActual,
  cambiandoPedidoId,
  cambiarEstado,
}) {
  const estado = pedido.estado || "Nuevo";
  const prioridad = obtenerPrioridad(
    pedido,
    horaActual
  );

  const cronometro = formatearCronometro(
    obtenerSegundosTranscurridos(
      pedido,
      horaActual
    )
  );

  const procesando =
    cambiandoPedidoId === pedido.id;

  function confirmarCancelacion() {
    const confirmar = window.confirm(
      `¿Cancelar el pedido #${pedido.id}?`
    );

    if (confirmar) {
      cambiarEstado(pedido, "Cancelado");
    }
  }

  return (
    <article
      className={`cocina-pro-pedido ${prioridad.demora}`}
    >
      <header className="cocina-pro-pedido-cabecera">
        <div>
          <span className="cocina-pro-pedido-hora">
            {formatearHoraPedido(pedido)}
          </span>

          <h3>Pedido #{pedido.id}</h3>
        </div>

        <div
          className={`cocina-pro-prioridad ${prioridad.clase}`}
        >
          <span>{prioridad.icono}</span>
          <strong>{prioridad.texto}</strong>
        </div>
      </header>

      <div className="cocina-pro-cronometro">
        <span>⏱</span>
        <strong>{cronometro}</strong>
      </div>

      <div className="cocina-pro-datos">
        <p>
          <strong>👤 Cliente:</strong>{" "}
          {pedido.cliente || "Mostrador"}
        </p>

        <p>
          <strong>📦 Tipo:</strong>{" "}
          {pedido.tipoPedido || "Retiro"}
        </p>

        {pedido.numeroMesa && (
          <p>
            <strong>🍽 Mesa:</strong>{" "}
            {pedido.numeroMesa}
          </p>
        )}

        {pedido.telefono && (
          <p>
            <strong>📞 Teléfono:</strong>{" "}
            {pedido.telefono}
          </p>
        )}

        {pedido.direccion && (
          <p>
            <strong>📍 Dirección:</strong>{" "}
            {pedido.direccion}
          </p>
        )}
      </div>

      <PedidoProductos pedido={pedido} />

      {pedido.observaciones && (
        <div className="cocina-pro-observacion-general">
          <strong>⚠ Observación general</strong>
          <p>{pedido.observaciones}</p>
        </div>
      )}

      <div className="cocina-pro-pedido-acciones">
        {estado === "Nuevo" && (
          <button
            type="button"
            className="cocina-pro-boton comenzar"
            disabled={procesando}
            onClick={() =>
              cambiarEstado(pedido, "Preparando")
            }
          >
            {procesando
              ? "ACTUALIZANDO..."
              : "▶ COMENZAR"}
          </button>
        )}

        {estado === "Preparando" && (
          <button
            type="button"
            className="cocina-pro-boton listo"
            disabled={procesando}
            onClick={() =>
              cambiarEstado(pedido, "Listo")
            }
          >
            {procesando
              ? "ACTUALIZANDO..."
              : "✅ MARCAR LISTO"}
          </button>
        )}

        {estado === "Listo" && (
          <button
            type="button"
            className="cocina-pro-boton entregar"
            disabled={procesando}
            onClick={() =>
              cambiarEstado(pedido, "Entregado")
            }
          >
            {procesando
              ? "ACTUALIZANDO..."
              : "📦 ENTREGAR"}
          </button>
        )}

        <button
          type="button"
          className="cocina-pro-boton cancelar"
          disabled={procesando}
          onClick={confirmarCancelacion}
        >
          CANCELAR
        </button>
      </div>
    </article>
  );
}

export default PedidoCard;

    
