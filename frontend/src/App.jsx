import { useEffect, useState } from "react";
import { io } from "socket.io-client";

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
import Cocina from "./components/Cocina";
import Usuarios from "./components/Usuarios";
import Login from "./components/Login";
import DashboardEnterpriseV2 from "./components/DashboardEnterpriseV2";
import Delivery from "./components/Delivery";
import Repartidores from "./components/Repartidores";
import MasaIA from "./components/MasaIA";
import CommandBar from "./components/CommandBar/CommandBar";
import ConfiguracionWeb from "./components/ConfiguracionWeb";

import { API_URL, SOCKET_URL } from "./config/api";


const permisosPorRol = {
  administrador: [
  "dashboard",
  "masaia",
  "clientes",
  "caja",
  "cocina",
  "delivery",
  "productos",
  "ventas",
  "usuarios",
  "stock",
  "compras",
  "historialCompras",
  "recetas",
  "rentabilidad",
  "produccion",
  "configuracionWeb",
],

  cajero: [
    "caja",
    "clientes",
    "ventas",
  ],

  cocina: [
    "cocina",
  ],

  delivery: [
    "delivery",
  ],

  entrega: [
    "delivery",
  ],
};

const menuCompleto = [
  {
    pantalla: "dashboard",
    texto: "📊 Panel",
  },
  {
  pantalla: "masaia",
  texto: "🤖 MasaIA",
  },
  {
    pantalla: "clientes",
    texto: "👥 Clientes",
  },
  {
    pantalla: "caja",
    texto: "💵 Caja",
  },
  {
    pantalla: "cocina",
    texto: "👨‍🍳 Cocina",
  },
  {
    pantalla: "delivery",
    texto: "🛵 Entrega PRO",
  },
  {
    pantalla: "repartidores",
    texto: "🚚 Repartidores PRO",
  },
  {
    pantalla: "productos",
    texto: "🍕 Productos",
  },
  {
    pantalla: "ventas",
    texto: "🧾 Ventas",
  },
  {
    pantalla: "usuarios",
    texto: "👥 Usuarios",
  },
  {
    pantalla: "stock",
    texto: "📦 Stock",
  },
  {
    pantalla: "compras",
    texto: "🛒 Compras",
  },
  {
    pantalla: "historialCompras",
    texto: "📜 Historial compras",
  },
  {
    pantalla: "recetas",
    texto: "📖 Recetas",
  },
  {
    pantalla: "rentabilidad",
    texto: "💰 Rentabilidad",
  },
  {
    pantalla: "produccion",
    texto: "🏭 Producción",
  },
  {
    pantalla: "configuracionWeb",
    texto: "🌐 Configuración Web",
  },
];

function normalizarRol(rol = "") {
  return String(rol)
    .trim()
    .toLowerCase();
}

function obtenerPantallaInicial(rol) {
  const rolNormalizado = normalizarRol(rol);

  switch (rolNormalizado) {
    case "cajero":
      return "caja";

    case "cocina":
      return "cocina";

    case "delivery":
    case "entrega":
      return "delivery";

    default:
      return "dashboard";
  }
}

async function obtenerLista(endpoint) {
  const respuesta = await fetch(
    `${API_URL}/${endpoint}`
  );

  if (!respuesta.ok) {
    throw new Error(
      `No se pudo cargar ${endpoint}.`
    );
  }

  const datos = await respuesta.json();

  return Array.isArray(datos)
    ? datos
    : [];
}
function obtenerUsuarioGuardado() {
  try {
    const contenido =
      localStorage.getItem(
        "masaos_usuario"
      );

    return contenido
      ? JSON.parse(contenido)
      : null;
  } catch {
    localStorage.removeItem(
      "masaos_usuario"
    );

    localStorage.removeItem(
      "masaos_token"
    );

    return null;
  }
}

function App() {
  const [pantalla, setPantalla] =
    useState("dashboard");

  const [
  usuarioLogueado,
  setUsuarioLogueado,
] = useState(obtenerUsuarioGuardado);

const [
  verificandoSesion,
  setVerificandoSesion,
] = useState(true);

  const [clientes, setClientes] =
    useState([]);

  const [productos, setProductos] =
    useState([]);

  const [ventas, setVentas] =
    useState([]);

  const [usuarios, setUsuarios] =
    useState([]);

  const [stock, setStock] =
    useState([]);

  const [recetas, setRecetas] =
    useState([]);

  const [costos, setCostos] =
    useState([]);

  const [produccion, setProduccion] =
    useState([]);

  const [
    socketConectado,
    setSocketConectado,
  ] = useState(false);

  const [errorCarga, setErrorCarga] =
    useState("");

  const rolUsuario = normalizarRol(
    usuarioLogueado?.rol
  );

  const permisosUsuario =
    permisosPorRol[rolUsuario] || [];

  const menuPermitido =
    menuCompleto.filter((item) =>
      permisosUsuario.includes(
        item.pantalla
      )
    );


  async function cargarDatosPrincipales() {
  try {
    const [
      productosNuevos,
      ventasNuevas,
      usuariosNuevos,
      stockNuevo,
      clientesNuevos,
      recetasNuevas,
      costosNuevos,
      produccionNueva,
    ] = await Promise.all([
      obtenerLista("productos"),
      obtenerLista("ventas"),
      obtenerLista("usuarios"),
      obtenerLista("stock"),
      obtenerLista("clientes"),
      obtenerLista("recetas"),
      obtenerLista("costos-productos"),
      obtenerLista("produccion-maxima"),
    ]);

    setProductos(productosNuevos);
    setVentas(ventasNuevas);
    setUsuarios(usuariosNuevos);
    setStock(stockNuevo);
    setClientes(clientesNuevos);
    setRecetas(recetasNuevas);
    setCostos(costosNuevos);
    setProduccion(produccionNueva);

    setErrorCarga("");
  } catch (error) {
    console.error(
      "Error cargando datos principales:",
      error
    );

    setErrorCarga(
      error.message ||
        "No se pudieron cargar los datos."
    );
  }
}

useEffect(() => {
  const token =
    localStorage.getItem(
      "masaos_token"
    );

  if (!token) {
    setVerificandoSesion(false);
    return;
  }

  async function verificarSesion() {
    try {
      const respuesta = await fetch(
        `${API_URL}/auth/me`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          "Sesión no válida."
        );
      }

      const datos =
        await respuesta.json();

      localStorage.setItem(
        "masaos_usuario",
        JSON.stringify(datos.usuario)
      );

      setUsuarioLogueado(
        datos.usuario
      );

      setPantalla(
        obtenerPantallaInicial(
          datos.usuario.rol
        )
      );
    } catch {
      localStorage.removeItem(
        "masaos_token"
      );

      localStorage.removeItem(
        "masaos_usuario"
      );

      setUsuarioLogueado(null);
    } finally {
      setVerificandoSesion(false);
    }
  }

  verificarSesion();
}, []);

useEffect(() => {
  if (usuarioLogueado) {
    cargarDatosPrincipales();
  }
}, [usuarioLogueado]);

if (verificandoSesion) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          🍕
        </div>

        <h1>MasaOS</h1>
        <p>Verificando sesión...</p>
      </div>
    </div>
  );
}
  if (!usuarioLogueado) {
    return (
      <Login
  onLogin={(usuario, token) => {
    localStorage.setItem(
      "masaos_token",
      token || ""
    );

    localStorage.setItem(
      "masaos_usuario",
      JSON.stringify(usuario)
    );

    setUsuarioLogueado(usuario);

    setPantalla(
      obtenerPantallaInicial(
        usuario.rol
      )
    );
  }}
/>
    
    );
  }
   
  return (
    <div className="app">
      <aside className="sidebar">
        <h1>🍕 MasaOS</h1>

        <div className="usuario-logueado">
          <strong>
            {usuarioLogueado.nombre}
          </strong>

          <small>
            {usuarioLogueado.rol}
          </small>

          <button
            type="button"
            className="logout-button"
            onClick={() => {
  localStorage.removeItem(
    "masaos_token"
  );

  localStorage.removeItem(
    "masaos_usuario"
  );

  setUsuarioLogueado(null);
  setPantalla("dashboard");
}}
          >
            Cerrar sesión
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuPermitido.map((item) => (
            <p
              key={item.pantalla}
              className={
                pantalla === item.pantalla
                  ? "menu-activo"
                  : ""
              }
              onClick={() =>
                setPantalla(item.pantalla)
              }
            >
              {item.texto}
            </p>
          ))}
        </nav>
      </aside>

      <main className="main">
        {errorCarga && (
          <div className="mensaje-error">
            ⚠️ {errorCarga}
          </div>
        )}

        {pantalla === "dashboard" && (
          <DashboardEnterpriseV2
            usuarioLogueado={
              usuarioLogueado
            }
            productos={productos}
            ventas={ventas}
            usuarios={usuarios}
            stock={stock}
            produccion={produccion}
            clientes={clientes}
            socketConectado={
              socketConectado
            }
          />
        )}
        {pantalla === "masaia" && (
  <MasaIA
    usuarioLogueado={usuarioLogueado}
  />
)}

        {pantalla === "clientes" && (
          <Clientes
            clientes={clientes}
          />
        )}

        {pantalla === "caja" && (
          <Caja
            productos={productos}
            setVentas={setVentas}
            setStock={setStock}
            setClientes={setClientes}
          />
        )}

        {pantalla === "cocina" && (
          <Cocina />
        )}

        {pantalla === "delivery" && (
          <Delivery />
        )}

        {pantalla ===
          "repartidores" && (
          <Repartidores />
        )}

        {pantalla === "productos" && (
          <Productos
  productos={productos}
  recargarProductos={cargarDatosPrincipales}
/>
        )}

        {pantalla === "ventas" && (
          <Ventas
            ventas={ventas}
          />
        )}

        {pantalla === "stock" && (
          <Stock
            stock={stock}
          />
        )}

        {pantalla === "compras" && (
          <Compras
            stock={stock}
            setStock={setStock}
          />
        )}

        {pantalla ===
          "historialCompras" && (
          <HistorialCompras />
        )}

        {pantalla === "recetas" && (
          <Recetas
            recetas={recetas}
          />
        )}

        {pantalla ===
          "rentabilidad" && (
          <Rentabilidad
            costos={costos}
          />
        )}

        {pantalla ===
          "produccion" && (
          <Produccion
            produccion={produccion}
          />
        )}

        {pantalla === "usuarios" && (
          <Usuarios
            usuarios={usuarios}
            setUsuarios={setUsuarios}
          />
        )}
        {pantalla === "configuracionWeb" && (
  <ConfiguracionWeb />
)}
              </main>
              <CommandBar
  onNavigate={(pantalla) => {
    setPantalla(pantalla);
  }}
/>
    </div>
  );
}

export default App;