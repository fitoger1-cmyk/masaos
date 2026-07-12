function Clientes({ clientes }) {
  return (
    <section className="section">
      <h2>👥 Clientes</h2>

      {clientes.length === 0 ? (
        <p>No hay clientes registrados todavía.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Pedidos</th>
              <th>Total gastado</th>
              <th>Última compra</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nombre}</td>
                <td>{cliente.telefono || "-"}</td>
                <td>{cliente.direccion || "-"}</td>
                <td>{cliente.cantidadPedidos || 0}</td>
                <td>
                  $ {Number(cliente.totalGastado || 0).toLocaleString("es-AR")}
                </td>
                <td>{cliente.ultimaCompra || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default Clientes;