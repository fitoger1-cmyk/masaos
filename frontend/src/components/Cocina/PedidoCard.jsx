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

  const clienteEsObjeto =
    pedido.cliente &&
    typeof pedido.cliente === "object";

  const nombreCliente = clienteEsObjeto
    ? pedido.cliente.nombre || "Mostrador"
    : pedido.cliente || "Mostrador";

  const telefonoCliente = clienteEsObjeto
    ? pedido.cliente.telefono || ""
    : pedido.telefono || "";

  const entregaEsObjeto =
    pedido.entrega &&
    typeof pedido.entrega === "object";

  const tipoEntrega = entregaEsObjeto
    ? pedido.entrega.tipo || "Retiro"
    : pedido.tipoEntrega ||
      pedido.tipoPedido ||
      "Retiro";

  const direccionEntrega = entregaEsObjeto
    ? pedido.entrega.direccion || ""
    : pedido.direccion || "";

  const localidadEntrega = entregaEsObjeto
    ? pedido.entrega.localidad || ""
    : pedido.localidad || "";

  const referenciaEntrega = entregaEsObjeto
    ? pedido.entrega.referencia || ""
    : pedido.referencia || "";

  const numeroPedido =
    pedido.numeroPedido ||
    `#${pedido.id}`;

  function confirmarCancelacion() {
    const confirmar = window.confirm(
      `¿Cancelar el pedido ${numeroPedido}?`
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

          <h3>Pedido {numeroPedido}</h3>
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
          {nombreCliente}
        </p>

        <p>
          <strong>📦 Tipo:</strong>{" "}
          {tipoEntrega}
        </p>

        {pedido.numeroMesa && (
          <p>
            <strong>🍽 Mesa:</strong>{" "}
            {pedido.numeroMesa}
          </p>
        )}

        {telefonoCliente && (
          <p>
            <strong>📞 Teléfono:</strong>{" "}
            {telefonoCliente}
          </p>
        )}

        {direccionEntrega && (
          <p>
            <strong>📍 Dirección:</strong>{" "}
            {direccionEntrega}
          </p>
        )}

        {localidadEntrega && (
          <p>
            <strong>🏙 Localidad:</strong>{" "}
            {localidadEntrega}
          </p>
        )}

        {referenciaEntrega && (
          <p>
            <strong>🧭 Referencia:</strong>{" "}
            {referenciaEntrega}
          </p>
        )}
      </div>

      <PedidoProductos pedido={pedido} />

      {pedido.observaciones && (
        <div className="cocina-pro-observacion-general">
          <strong>
            ⚠ Observación general
          </strong>

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
              cambiarEstado(
                pedido,
                "Preparando"
              )
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
              cambiarEstado(
                pedido,
                "Listo"
              )
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
              cambiarEstado(
                pedido,
                "Entregado"
              )
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