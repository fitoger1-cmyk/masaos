import { useEffect, useState } from "react";

import "./App.css";

import Ventas from "./components/Ventas";
import Productos from "./components/Productos";
import Caja from "./components/Caja";
import Stock from "./components/Stock";
import Compras from "./components/Compras";
import HistorialCompras from "./components/HistorialCompras";
import Clientes from "./components/Clientes";
import Recetas from "./components/Recetas";
import Rentabilidad from "./components/Rentabilidad";
import Produccion from "./components/Produccion";

function App() {
  const [pantalla, setPantalla] = useState("dashboard");

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [stock, setStock] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [costos, setCostos] = useState([]);
  const [produccion, setProduccion] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/productos")
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch((error) =>
        console.error("Error cargando productos:", error)
      );

    fetch("http://localhost:3000/api/ventas")
      .then((res) => res.json())
      .then((data) => setVentas(Array.isArray(data) ? data : []))
      .catch((error) =>
        console.error("Error cargando ventas:", error)
      );

    fetch("http://localhost:3000/api/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(Array.isArray(data) ? data : []))
      .catch((error) =>
        console.error("Error cargando usuarios:", error)
      );

    fetch("http://localhost:3000/api/stock")
      .then((res) => res.json())
      .then((data) => setStock(Array.isArray(data) ? data : []))
      .catch((error) =>
        console.error("Error cargando stock:", error)
      );

    fetch("http://localhost:3000/api/clientes")
      .then((res) => res.json())
      .then((data) => setClientes(Array.isArray(data) ? data : []))
      .catch((error) =>
        console.error("Error cargando clientes:", error)
      );

    fetch("http://localhost:3000/api/recetas")
      .then((res) => res.json())
      .then((data) => setRecetas(Array.isArray(data) ? data : []))
      .catch((error) =>
        console.error("Error cargando recetas:", error)
      );

    fetch("http://localhost:3000/api/costos-productos")
      .then((res) => res.json())
      .then((data) => setCostos(Array.isArray(data) ? data : []))
      .catch((error) =>
        console.error("Error cargando costos:", error)
      );
    fetch("http://localhost:3000/api/produccion-maxima")
  .then((res) => res.json())
  .then((data) =>
    setProduccion(Array.isArray(data) ? data : [])
  )
  .catch((error) =>
    console.error("Error cargando producción máxima:", error)
  );
  }, []);

  const hoy = new Date().toISOString().split("T")[0];

  const ventasHoy = ventas.filter((venta) => venta.fecha === hoy);

  const facturacionHoy = ventasHoy.reduce(
    (total, venta) => total + Number(venta.total || 0),
    0
  );

  const facturacionTotal = ventas.reduce(
    (total, venta) => total + Number(venta.total || 0),
    0
  );

  const productosActivos = productos.filter(
    (producto) => producto.activo !== false
  ).length;

  const stockCritico = stock.filter(
    (insumo) => Number(insumo.cantidad) <= 5
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>🍕 MasaOS</h1>

        <p onClick={() => setPantalla("dashboard")}>📊 Panel</p>
        <p onClick={() => setPantalla("clientes")}>👥 Clientes</p>
        <p onClick={() => setPantalla("caja")}>💵 Caja</p>
        <p onClick={() => setPantalla("productos")}>🍕 Productos</p>
        <p onClick={() => setPantalla("ventas")}>🧾 Ventas</p>
        <p onClick={() => setPantalla("usuarios")}>👥 Usuarios</p>
        <p onClick={() => setPantalla("stock")}>📦 Stock</p>
        <p onClick={() => setPantalla("compras")}>📦 Compras</p>
        <p onClick={() => setPantalla("historialCompras")}>
          📜 Historial compras
        </p>
        <p onClick={() => setPantalla("recetas")}>📖 Recetas</p>
        <p onClick={() => setPantalla("rentabilidad")}>
          💰 Rentabilidad
        </p>
        <p onClick={() => setPantalla("produccion")}>🏭 Producción</p>
      </aside>

      <main className="main">
        {pantalla === "dashboard" && (
          <section className="section">
            <h2>📊 Panel principal</h2>

            <div className="cards">
              <div className="card">
                <h3>Productos</h3>
                <p>{productos.length} cargados</p>
              </div>

              <div className="card">
                <h3>Ventas de hoy</h3>
                <p>$ {facturacionHoy.toLocaleString("es-AR")}</p>
                <small>{ventasHoy.length} ventas</small>
              </div>

              <div className="card">
                <h3>Usuarios</h3>
                <p>{usuarios.length} activos</p>
              </div>

              <div className="card">
                <h3>Productos activos</h3>
                <p>{productosActivos}</p>
              </div>

              <div className="card">
                <h3>Facturación total</h3>
                <p>$ {facturacionTotal.toLocaleString("es-AR")}</p>
              </div>

              <div className="card">
                <h3>⚠ Stock crítico</h3>
                <p>{stockCritico}</p>
              </div>

              <div className="card">
                <h3>🍕 Pizza más vendida</h3>
                <p>Muzzarella Grande</p>
                <small>Próximamente automático</small>
              </div>
            </div>
          </section>
        )}

        {pantalla === "clientes" && (
          <Clientes clientes={clientes} />
        )}

        {pantalla === "caja" && (
          <Caja
            productos={productos}
            setVentas={setVentas}
            setStock={setStock}
            setClientes={setClientes}
          />
        )}

        {pantalla === "productos" && (
          <Productos productos={productos} />
        )}

        {pantalla === "ventas" && (
          <Ventas ventas={ventas} />
        )}

        {pantalla === "stock" && (
          <Stock stock={stock} />
        )}

        {pantalla === "compras" && (
          <Compras
            stock={stock}
            setStock={setStock}
          />
        )}

        {pantalla === "historialCompras" && (
          <HistorialCompras />
        )}

        {pantalla === "recetas" && (
          <Recetas recetas={recetas} />
        )}

        {pantalla === "rentabilidad" && (
          <Rentabilidad costos={costos} />
        )}
        {pantalla === "produccion" && (
  <Produccion produccion={produccion} />
)}
        {pantalla === "usuarios" && (
          <section className="section">
            <h2>👥 Usuarios</h2>
        

            <table>
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
          </section>
        )}
      </main>
    </div>
  );
}

export default App;