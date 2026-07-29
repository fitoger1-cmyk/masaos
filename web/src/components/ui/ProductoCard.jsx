function formatearPrecio(precio) {
  const numero = Number(precio);

  if (!Number.isFinite(numero)) {
    return "$0";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(numero);
}

function ProductoCard({
  producto,
  onAgregar,
}) {
  return (
    <article className="producto-card">
      <div className="producto-card__imagen">
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            loading="lazy"
          />
        ) : (
          <div className="producto-card__sin-imagen">
            🍕
          </div>
        )}

        <span>
          {producto.categoria || "Producto"}
        </span>
      </div>

      <div className="producto-card__contenido">
        <div>
          <p className="producto-card__categoria">
            {producto.categoria || "Producto"}
          </p>

          <h3>{producto.nombre}</h3>

          <p>
            {producto.descripcion ||
              "Producto artesanal elaborado en nuestra cocina."}
          </p>
        </div>

        <div className="producto-card__pie">
          <strong>
            {formatearPrecio(producto.precio)}
          </strong>

          <button
            type="button"
            className="producto-card__agregar"
            onClick={() => onAgregar?.(producto)}
            aria-label={`Agregar ${producto.nombre}`}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductoCard;