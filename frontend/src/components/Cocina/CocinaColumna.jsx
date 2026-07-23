    import PedidoCard from "./PedidoCard";

import {
  obtenerClaseColumna,
  obtenerEtiquetaEstado,
  obtenerIconoEstado,
} from "./helpers";

function CocinaColumna({
  estado,
  pedidos,
  horaActual,
  cambiandoPedidoId,
  cambiarEstado,
}) {
  return (
    <section
      className={`cocina-pro-columna ${obtenerClaseColumna(
        estado
      )}`}
    >
      <header className="cocina-pro-columna-cabecera">
        <div>
          <span>{obtenerIconoEstado(estado)}</span>
          <h2>{obtenerEtiquetaEstado(estado)}</h2>
        </div>

        <strong>{pedidos.length}</strong>
      </header>

      <div className="cocina-pro-columna-contenido">
        {pedidos.length === 0 ? (
          <div className="cocina-pro-columna-vacia">
            <span>✓</span>
            <p>No hay pedidos</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              horaActual={horaActual}
              cambiandoPedidoId={
                cambiandoPedidoId
              }
              cambiarEstado={cambiarEstado}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default CocinaColumna;

    
