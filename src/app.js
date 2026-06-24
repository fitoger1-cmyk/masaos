function App() {
  return (
    <div style={{
      padding: "30px",
      fontFamily: "Arial"
    }}>
      <h1>🍕 MasaOS</h1>

      <h2>Dashboard</h2>

      <div style={{
        display: "flex",
        gap: "20px"
      }}>
        <div style={{
          border: "1px solid #ccc",
          padding: "20px"
        }}>
          <h3>Productos</h3>
          <p>3 productos cargados</p>
        </div>

        <div style={{
          border: "1px solid #ccc",
          padding: "20px"
        }}>
          <h3>Ventas</h3>
          <p>2 ventas registradas</p>
        </div>

        <div style={{
          border: "1px solid #ccc",
          padding: "20px"
        }}>
          <h3>Usuarios</h3>
          <p>2 usuarios activos</p>
        </div>
      </div>
    </div>
  );
}

export default App;