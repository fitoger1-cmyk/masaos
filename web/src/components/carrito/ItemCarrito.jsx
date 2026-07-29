import { useCarrito } from "../../hooks/useCarrito";

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(precio) || 0);
}

function ItemCarrito({ item }) {
  const {
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
  } = useCarrito();

  const subtotalItem =
    Number(item.precio || 0) *
    Number(item.cantidad || 0);

  const imagen =
    item.imagen ||
    item.image ||
    item.foto ||
    "";

  return (
    <article className="item-carrito">
      <div className="item-carrito__imagen">
        {imagen ? (
          <img
            src={imagen}
            alt={item.nombre}
          />
        ) : (
          <span aria-hidden="true">
            🍕
          </span>
        )}
      </div>

      <div className="item-carrito__contenido">
        <div className="item-carrito__encabezado">
          <div>
            <h3>{item.nombre}</h3>

            {item.categoria && (
              <p>{item.categoria}</p>
            )}
          </div>

          <button
            type="button"
            className="item-carrito__eliminar"
            onClick={() =>
              eliminarProducto(
                item.carritoId
              )
            }
            aria-label={`Eliminar ${item.nombre}`}
            title="Eliminar producto"
          >
            ×
          </button>
        </div>

        <div className="item-carrito__inferior">
          <div className="item-carrito__cantidad">
            <button
              type="button"
              onClick={() =>
                disminuirCantidad(
                  item.carritoId
                )
              }
              aria-label={`Disminuir cantidad de ${item.nombre}`}
            >
              −
            </button>

            <strong>
              {item.cantidad}
            </strong>

            <button
              type="button"
              onClick={() =>
                aumentarCantidad(
                  item.carritoId
                )
              }
              aria-label={`Aumentar cantidad de ${item.nombre}`}
            >
              +
            </button>
          </div>

          <strong className="item-carrito__precio">
            {formatearPrecio(
              subtotalItem
            )}
          </strong>
        </div>
      </div>
    </article>
  );
}

export default ItemCarrito;