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
  const [detalleAbierto, setDetalleAbierto] = useState(false);

  useEffect(() => {
    if (!detalleAbierto) return undefined;
    const cerrarConEscape = (evento) => {
      if (evento.key === "Escape") setDetalleAbierto(false);
    };
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [detalleAbierto]);

  return (
    <>
    <article className="producto-card">
      <button
        type="button"
        className="producto-card__imagen producto-card__imagen--boton"
        onClick={() => setDetalleAbierto(true)}
        aria-label={`Ver descripción de ${producto.nombre}`}
      >
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
      </button>

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

    {detalleAbierto && (
      <div
        className="producto-modal__fondo"
        role="presentation"
        onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) setDetalleAbierto(false);
        }}
      >
        <section className="producto-modal" role="dialog" aria-modal="true" aria-labelledby={`producto-${producto.id || producto.nombre}`}>
          <button type="button" className="producto-modal__cerrar" onClick={() => setDetalleAbierto(false)} aria-label="Cerrar descripción">×</button>
          <div className="producto-modal__imagen">
            {producto.imagen ? <img src={producto.imagen} alt={producto.nombre} /> : <div className="producto-card__sin-imagen">🍕</div>}
          </div>
          <div className="producto-modal__contenido">
            <p className="producto-card__categoria">{producto.categoria || "Producto"}</p>
            <h2 id={`producto-${producto.id || producto.nombre}`}>{producto.nombre}</h2>
            <p className="producto-modal__descripcion">{producto.descripcion || "Producto artesanal elaborado en nuestra cocina."}</p>
            <div className="producto-modal__pie">
              <strong>{formatearPrecio(producto.precio)}</strong>
              <button type="button" className="boton boton--principal" onClick={() => { onAgregar?.(producto); setDetalleAbierto(false); }}>Agregar al pedido</button>
            </div>
          </div>
        </section>
      </div>
    )}
    </>
  );
}

export default ProductoCard;
import { useEffect, useState } from "react";
