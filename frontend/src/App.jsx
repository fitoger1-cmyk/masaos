import { useEffect, useState } from "react";

function App() {
  const [productos, setProductos] = useState([]);
const [ventas, setVentas] = useState([]);
const [usuarios, setUsuarios] = useState([]);

const [nuevoNombre, setNuevoNombre] = useState("");
const [nuevaCategoria, setNuevaCategoria] = useState("");
const [nuevoPrecio, setNuevoPrecio] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data));

    fetch("http://localhost:3000/api/ventas")
      .then((res) => res.json())
      .then((data) => setVentas(data));

    fetch("http://localhost:3000/api/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(data));
  }, []);
 const agregarProducto = () => {
  fetch("http://localhost:3000/api/productos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nombre: nuevoNombre,
      categoria: nuevaCategoria,
      precio: nuevoPrecio
    })
  })
    .then((res) => res.json())
.then((productoGuardado) => {
  setProductos([...productos, productoGuardado]);

  setNuevoNombre("");
  setNuevaCategoria("");
  setNuevoPrecio("");
});
};

return (
  <div style={{ padding: "30px", fontFamily: "Arial" }}>
    <h1>🍕 MasaOS</h1>
    <h2>Panel</h2>
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ border: "1px solid #ccc", padding: "20px" }}>
          <h3>Productos</h3>
          <p>{productos.length} productos cargados</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "20px" }}>
          <h3>Ventas</h3>
          <p>{ventas.length} ventas registradas</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "20px" }}>
          <h3>Usuarios</h3>
          <p>{usuarios.length} usuarios activos</p>
        </div>
      </div>

      <h2>Productos</h2>
      <div style={{ marginBottom: "20px" }}>
  <input
  placeholder="Nombre del producto"
  value={nuevoNombre}
  onChange={(e) => setNuevoNombre(e.target.value)}
/>

<input
  placeholder="Categoría"
  value={nuevaCategoria}
  onChange={(e) => setNuevaCategoria(e.target.value)}
/>

<input
  placeholder="Precio"
  value={nuevoPrecio}
  onChange={(e) => setNuevoPrecio(e.target.value)}
/>
 <button onClick={agregarProducto}>
  Agregar producto
</button>
</div>
      
<table border="1" cellPadding="10">
  <thead>
    <tr>
      <th>IDENTIFICACIÓN</th>
      <th>Nombre</th>
      <th>Categoría</th>
      <th>Precio</th>
    </tr>
  </thead>

  <tbody>
    {productos.map((producto) => (
      <tr key={producto.id}>
        <td>{producto.id}</td>
        <td>{producto.nombre}</td>
        <td>{producto.categoria}</td>
        <td>$ {producto.precio}</td>
      </tr>
    ))}
  </tbody>
</table>
<h2>Ventas</h2>

<table border="1" cellPadding="10">
  <thead>
    <tr>
      <th>ID</th>
      <th>Cliente</th>
      <th>Total</th>
      <th>Fecha</th>
    </tr>
  </thead>

  <tbody>
    {ventas.map((venta) => (
      <tr key={venta.id}>
        <td>{venta.id}</td>
        <td>{venta.cliente}</td>
        <td>$ {venta.total}</td>
        <td>{venta.fecha}</td>
      </tr>
    ))}
  </tbody>
</table>
<h2>Usuarios</h2>

<table border="1" cellPadding="10">
  <thead>
    <tr>
      <th>ID</th>
      <th>Nombre</th>
      <th>Rol</th>
      <th>Activo</th>
    </tr>
  </thead>

  <tbody>
    {usuarios.map((usuario) => (
      <tr key={usuario.id}>
        <td>{usuario.id}</td>
        <td>{usuario.nombre}</td>
        <td>{usuario.rol}</td>
        <td>{usuario.activo ? "Sí" : "No"}</td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
  );
}

export default App;