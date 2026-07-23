    import { normalizarProductos } from "./helpers";

function PedidoProductos({ pedido }) {
  const productos = normalizarProductos(pedido);

  if (productos.length === 0) {
    return (
      <p className="cocina-pro-sin-productos">
        Sin productos registrados.
      </p>
    );
  }

  return (
    <div className="cocina-pro-productos">
      {productos.map((producto) => (
        <div
          className="cocina-pro-producto"
          key={producto.id}
        >
          <div className="cocina-pro-producto-principal">
            <span className="cocina-pro-producto-icono">
              🍕
            </span>

            <strong>
              {producto.cantidad} × {producto.nombre}
            </strong>
          </div>

          {producto.observacion && (
            <div className="cocina-pro-producto-observacion">
              📝 {producto.observacion}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PedidoProductos;

    
