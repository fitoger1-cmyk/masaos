function Stock({ stock }) {
  {stock.some((i) => i.cantidad <= 5) && (
  <div
    style={{
      background: "#ff4d4d",
      color: "white",
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
      fontWeight: "bold",
      textAlign: "center"
    }}
  >
    ⚠ Hay ingredientes con stock crítico.
  </div>
)}
  return (
    <section className="section">
      <h2>📦 Stock</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ingrediente</th>
            <th>Cantidad</th>
            <th>Unidad</th>
          </tr>
        </thead>

        <tbody>
          {stock.map((item) => (
            <tr
  key={item.id}
  style={{
    background:
      item.cantidad <= 5
        ? "#ffe5e5"
        : item.cantidad <= 10
        ? "#fff4d6"
        : "white"
  }}
>
              <td>{item.id}</td>
              <td>{item.ingrediente}</td>
              <td
  style={{
    color:
      item.cantidad <= 5
        ? "red"
        : item.cantidad <= 10
        ? "orange"
        : "green",
    fontWeight: "bold"
  }}
>
  {Number(item.cantidad).toFixed(2)}
</td>
              <td>{item.unidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default Stock;