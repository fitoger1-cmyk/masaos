function Dashboard({ productos, ventas, usuarios }) {
  return (
    <>
      <h2>Panel principal</h2>

      <div className="cards">
        <div className="card">
          <h3>Productos</h3>
          <p>{productos.length} cargados</p>
        </div>

        <div className="card">
          <h3>Ventas</h3>
          <p>{ventas.length} registradas</p>
        </div>

        <div className="card">
          <h3>Usuarios</h3>
          <p>{usuarios.length} activos</p>
        </div>
      </div>
    </>
  );
}

export default Dashboard;