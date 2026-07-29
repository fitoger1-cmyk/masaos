import {
  useEffect,
  useState,
} from "react";

import { useCarrito } from "../../hooks/useCarrito";

import ItemCarrito from "./ItemCarrito";

import "./carrito.css";

import CheckoutModal from
  "../checkout/CheckoutModal";

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(precio) || 0);
}

function DrawerCarrito() {
  const {
    items,
    subtotal,
    cantidadTotal,
    carritoVacio,
    carritoAbierto,

    cerrarCarrito,
    vaciarCarrito,
  } = useCarrito();
  const [
  checkoutAbierto,
  setCheckoutAbierto,
] = useState(false);

  useEffect(() => {
    function cerrarConEscape(evento) {
      if (
        evento.key === "Escape" &&
        carritoAbierto
      ) {
        cerrarCarrito();
      }
    }

    window.addEventListener(
      "keydown",
      cerrarConEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        cerrarConEscape
      );
    };
  }, [
    carritoAbierto,
    cerrarCarrito,
  ]);

  useEffect(() => {
    if (carritoAbierto) {
      document.body.classList.add(
        "carrito-activo"
      );
    } else {
      document.body.classList.remove(
        "carrito-activo"
      );
    }

    return () => {
      document.body.classList.remove(
        "carrito-activo"
      );
    };
  }, [carritoAbierto]);

  function finalizarPedido() {
  cerrarCarrito();
  setCheckoutAbierto(true);
}

  return (
    <>
      <div
        className={`carrito-overlay ${
          carritoAbierto
            ? "carrito-overlay--visible"
            : ""
        }`}
        onClick={cerrarCarrito}
        aria-hidden="true"
      />

      <aside
        className={`drawer-carrito ${
          carritoAbierto
            ? "drawer-carrito--abierto"
            : ""
        }`}
        aria-hidden={!carritoAbierto}
        aria-label="Carrito de compras"
      >
        <header className="drawer-carrito__header">
          <div>
            <span className="drawer-carrito__etiqueta">
              Tu compra
            </span>

            <h2>Mi pedido</h2>

            <p>
              {cantidadTotal === 1
                ? "1 producto"
                : `${cantidadTotal} productos`}
            </p>
          </div>

          <button
            type="button"
            className="drawer-carrito__cerrar"
            onClick={cerrarCarrito}
            aria-label="Cerrar carrito"
          >
            ×
          </button>
        </header>

        <div className="drawer-carrito__contenido">
          {carritoVacio ? (
            <div className="carrito-vacio">
              <span
                className="carrito-vacio__icono"
                aria-hidden="true"
              >
                🛒
              </span>

              <h3>
                Tu carrito está vacío
              </h3>

              <p>
                Agregá tus pizzas,
                focaccias o postres
                favoritos.
              </p>

              <button
                type="button"
                onClick={cerrarCarrito}
              >
                Ver productos
              </button>
            </div>
          ) : (
            <div className="drawer-carrito__items">
              {items.map((item) => (
                <ItemCarrito
                  key={item.carritoId}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>

        {!carritoVacio && (
          <footer className="drawer-carrito__footer">
            <button
              type="button"
              className="drawer-carrito__vaciar"
              onClick={vaciarCarrito}
            >
              Vaciar carrito
            </button>

            <div className="drawer-carrito__subtotal">
              <span>Subtotal</span>

              <strong>
                {formatearPrecio(
                  subtotal
                )}
              </strong>
            </div>

            <p className="drawer-carrito__aclaracion">
              El costo final del envío se
              confirmará antes de terminar
              el pedido.
            </p>

            <button
              type="button"
              className="drawer-carrito__finalizar"
              onClick={finalizarPedido}
            >
              Finalizar pedido
            </button>
          </footer>
        )}
      </aside>
      <CheckoutModal
  abierto={checkoutAbierto}
  onCerrar={() =>
    setCheckoutAbierto(false)
  }
/>
    </>
  );
}

export default DrawerCarrito;