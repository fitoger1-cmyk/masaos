function Rentabilidad({ costos }) {
  return (
    <section className="section">
      <h2>💰 Rentabilidad</h2>

      {costos.length === 0 ? (
        <p>No hay cálculos disponibles.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Costo</th>
              <th>Precio de venta</th>
              <th>Ganancia</th>
              <th>Margen</th>
            </tr>
          </thead>

          <tbody>
            {costos.map((item) => (
              <tr key={item.producto}>
                <td>{item.producto}</td>
                <td>$ {Number(item.costo).toLocaleString("es-AR")}</td>
                <td>$ {Number(item.venta).toLocaleString("es-AR")}</td>
                <td>$ {Number(item.ganancia).toLocaleString("es-AR")}</td>
                <td>{item.margen}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default Rentabilidad;