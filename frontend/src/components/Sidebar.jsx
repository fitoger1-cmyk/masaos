function Sidebar({ pantalla, setPantalla }) {
  return (
    <aside className="sidebar">
      <h1>🍕 MasaOS</h1>

      <p onClick={() => setPantalla("dashboard")}>📊 Panel</p>
      <p onClick={() => setPantalla("productos")}>🍕 Productos</p>
      <p onClick={() => setPantalla("ventas")}>🧾 Ventas</p>
      <p onClick={() => setPantalla("usuarios")}>👥 Usuarios</p>
    </aside>
  );
}

export default Sidebar;