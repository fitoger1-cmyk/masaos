function Ventas({ ventas }) {
  return (
    <section className="section">
      <h2>🧾 Ventas</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Fecha</th>
          </tr>
        </thead>

        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id}>
              <td>{venta.id}</td>
              <td>{venta.cliente}</td>
              <td>{venta.producto}</td>
              <td>{venta.cantidad}</td>
              <td>$ {venta.total}</td>
              <td>{venta.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default Ventas;