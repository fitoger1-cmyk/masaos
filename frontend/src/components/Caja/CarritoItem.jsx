    import { formatearDinero } from "./formatos";

function CarritoItem({
  producto,
  aumentarCantidad,
  disminuirCantidad,
  quitarDelCarrito,
  actualizarObservacion,
}) {
  return (
    <div className="ticket-item caja-ticket-item">
      <div className="caja-ticket-item-info">
        <strong>{producto.nombre}</strong>

        <p>
          $ {formatearDinero(producto.precio)} × {producto.cantidad}
        </p>

        <div className="caja-cantidad-controles">
          <button
            type="button"
            onClick={() => disminuirCantidad(producto.carritoId)}
          >
            ➖
          </button>

          <span>{producto.cantidad}</span>

          <button
            type="button"
            onClick={() => aumentarCantidad(producto.carritoId)}
          >
            ➕
          </button>
        </div>

        <input
          value={producto.observacion}
          onChange={(evento) =>
            actualizarObservacion(
              producto.carritoId,
              evento.target.value
            )
          }
          placeholder="Observación del producto"
        />
      </div>

      <div className="caja-ticket-item-total">
        <strong>
          $ {formatearDinero(
            producto.precio * producto.cantidad
          )}
        </strong>

        <button
          type="button"
          onClick={() => quitarDelCarrito(producto.carritoId)}
        >
          ❌
        </button>
      </div>
    </div>
  );
}

export default CarritoItem;

    
