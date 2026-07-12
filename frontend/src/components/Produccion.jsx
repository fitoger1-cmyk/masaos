function Produccion({ produccion }) {
  return (
    <section className="section">
      <h2>🏭 Producción máxima</h2>

      {produccion.length === 0 ? (
        <p>No hay información disponible.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Unidades posibles</th>
              <th>Ingrediente limitante</th>
            </tr>
          </thead>

          <tbody>
            {produccion.map((item) => (
              <tr key={item.productoId}>
                <td>{item.producto}</td>
                <td>{item.produccionMaxima}</td>
                <td>{item.ingredienteLimitante}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default Produccion;