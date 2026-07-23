    import { useState } from "react";
import { formatearDinero } from "./formatos";

function ProductoCard({ producto, onAgregar }) {
  const [imagenFallida, setImagenFallida] = useState(false);

  const mostrarImagen =
    Boolean(producto.imagen) && !imagenFallida;

  return (
    <button
      type="button"
      className="caja-producto-card"
      onClick={() => onAgregar(producto)}
    >
      {mostrarImagen ? (
        <img
          src={producto.imagen}
          alt={producto.nombre}
          onError={() => setImagenFallida(true)}
        />
      ) : (
        <div className="caja-producto-sin-imagen">🍕</div>
      )}

      <span className="caja-producto-categoria">
        {producto.categoria || "Otros"}
      </span>

      <strong>{producto.nombre}</strong>
      <b>$ {formatearDinero(producto.precio)}</b>
    </button>
  );
}

export default ProductoCard;

    
