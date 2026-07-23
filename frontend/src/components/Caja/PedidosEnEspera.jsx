    function PedidosEnEspera({
  pedidos,
  recuperarPedido,
  eliminarPedido,
}) {
  if (pedidos.length === 0) {
    return null;
  }

  return (
    <div className="pedidos-espera">
      <h3>⏸ Pedidos en espera</h3>

      {pedidos.map((pedido) => (
        <div className="pedido-espera-item" key={pedido.id}>
          <div>
            <strong>{pedido.nombre}</strong>
            <p>
              {pedido.creado} · {pedido.carrito.length} productos
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => recuperarPedido(pedido)}
            >
              Recuperar
            </button>

            <button
              type="button"
              onClick={() => eliminarPedido(pedido.id)}
            >
              ❌
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PedidosEnEspera;

    
