import { useCarrito } from "../../hooks/useCarrito";

function BotonCarrito() {
  const {
    cantidadTotal,
    alternarCarrito,
  } = useCarrito();

  return (
    <button
      type="button"
      className="boton-carrito"
      onClick={alternarCarrito}
      aria-label={`Abrir carrito. ${cantidadTotal} productos`}
    >
      <span
        className="boton-carrito__icono"
        aria-hidden="true"
      >
        🛒
      </span>

      <span className="boton-carrito__texto">
        Mi pedido
      </span>

      {cantidadTotal > 0 && (
        <span className="boton-carrito__contador">
          {cantidadTotal > 99
            ? "99+"
            : cantidadTotal}
        </span>
      )}
    </button>
  );
}

export default BotonCarrito;