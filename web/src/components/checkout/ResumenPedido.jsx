function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(precio) || 0);
}

function ResumenPedido({
  items,
  subtotal,
  tipoEntrega,
}) {
  return (
    <aside className="resumen-pedido">
      <span className="resumen-pedido__etiqueta">
        Resumen
      </span>

      <h3>Tu pedido</h3>

      <div className="resumen-pedido__items">
        {items.map((item) => (
          <div
            key={item.carritoId}
            className="resumen-pedido__item"
          >
            <div>
              <strong>
                {item.cantidad} ×{" "}
                {item.nombre}
              </strong>

              {item.categoria && (
                <small>
                  {item.categoria}
                </small>
              )}
            </div>

            <span>
              {formatearPrecio(
                Number(item.precio) *
                  Number(item.cantidad)
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="resumen-pedido__totales">
        <div>
          <span>Subtotal</span>
          <strong>
            {formatearPrecio(subtotal)}
          </strong>
        </div>

        <div>
          <span>Entrega</span>

          <strong>
            {tipoEntrega === "retiro"
              ? "Retiro"
              : "A confirmar"}
          </strong>
        </div>
      </div>

      <div className="resumen-pedido__total">
        <span>Total parcial</span>

        <strong>
          {formatearPrecio(subtotal)}
        </strong>
      </div>

      <p className="resumen-pedido__aviso">
        El valor final del envío se
        confirmará junto con el pedido.
      </p>
    </aside>
  );
}

export default ResumenPedido;