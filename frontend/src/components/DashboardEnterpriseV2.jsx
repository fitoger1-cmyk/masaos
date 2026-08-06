import { useEffect, useState } from "react";

import EstadoSistema from "./Dashboard/EstadoSistema";
import KPIGrid from "./Dashboard/KPIGrid";
import ProduccionResumen from "./Dashboard/ProduccionResumen";
import ResumenInteligente from "./Dashboard/ResumenInteligente";
import TopProductos from "./Dashboard/TopProductos";
import VentasChart from "./Dashboard/VentasChart";
import { calcularDashboard } from "./Dashboard/helpers";
import GerenteVirtualCard from "./GerenteVirtualCard";
import CentroDecisiones from "./Dashboard/CentroDecisiones";
import HeaderEnterprise from "./Dashboard/HeaderEnterprise";
import LiveStatusBar from "./Dashboard/LiveStatusBar";
import CentroActividad from "./Dashboard/CentroActividad";
import { API_URL } from "../config/api";
import DashboardComercial from "./Dashboard/DashboardComercial";


function obtenerSaludo() {
  const hora = new Date().getHours();

  if (hora < 12) {
    return "Buenos días";
  }

  if (hora < 20) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}

function DashboardEnterpriseV2({
  usuarioLogueado,
  productos,
  ventas,
  usuarios,
  stock,
  produccion,
  clientes,
  socketConectado,
}) {
  const [recomendacionesIA, setRecomendacionesIA] =
    useState([]);

  const [cargandoRecomendaciones, setCargandoRecomendaciones] =
    useState(true);

  const [errorRecomendaciones, setErrorRecomendaciones] =
    useState("");

  const metricas = calcularDashboard({
    ventas,
    productos,
    usuarios,
    stock,
    produccion,
    clientes,
  });

  const fechaActual =
    new Date().toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const nombreUsuario =
    usuarioLogueado?.nombre ||
    usuarioLogueado?.usuario ||
    usuarioLogueado?.username ||
    "Administrador";

  async function cargarRecomendaciones() {
    try {
      setCargandoRecomendaciones(true);
      setErrorRecomendaciones("");

      const respuesta = await fetch(
        `${API_URL}/masaia/recomendaciones`
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron cargar las prioridades de MasaIA."
        );
      }

      const datos = await respuesta.json();

      setRecomendacionesIA(
        Array.isArray(datos.recomendaciones)
          ? datos.recomendaciones
          : []
      );
    } catch (error) {
      console.error(
        "Error cargando recomendaciones de MasaIA:",
        error
      );

      setErrorRecomendaciones(
        error.message ||
          "No se pudieron cargar las prioridades."
      );
    } finally {
      setCargandoRecomendaciones(false);
    }
  }

  useEffect(() => {
    cargarRecomendaciones();
  }, []);

  return (
    <section className="dashboard-v2">
 <HeaderEnterprise
  usuario={usuarioLogueado}
  socketConectado={socketConectado}
/>
 <LiveStatusBar socketConectado={socketConectado} />

      <GerenteVirtualCard
        usuarioLogueado={usuarioLogueado}
      />

      <section className="dashboard-v2-seccion">
        <div className="dashboard-v2-titulo-seccion">
          <div>
            <span>OPERACIÓN ACTUAL</span>
            <h2>Indicadores principales</h2>
          </div>

          <p>
            Información actualizada de ventas, cocina,
            entregas y existencias.
          </p>
        </div>

        <KPIGrid metricas={metricas} />
      </section>

      <section className="dashboard-v2-seccion">
        <div className="dashboard-v2-titulo-seccion">
          <div>
            <span>ANÁLISIS COMERCIAL</span>
            <h2>Ventas y productos</h2>
          </div>

          <p>
            Evolución de la facturación y productos con
            mayor demanda.
          </p>
        </div>

        <div className="dashboard-v2-grid-graficos">
          <VentasChart
            datos={metricas.ventasUltimosSieteDias}
          />

          <TopProductos
            productos={metricas.productosMasVendidos}
          />
        </div>
        <DashboardComercial />
      </section>

      <section className="dashboard-v2-seccion">
        <div className="dashboard-v2-titulo-seccion">
          <div>
            <span>CENTRO DE COMANDO</span>
            <h2>Decisiones y estado operativo</h2>
          </div>

          <button
            type="button"
            className="dashboard-v2-boton-secundario"
            onClick={cargarRecomendaciones}
            disabled={cargandoRecomendaciones}
          >
            {cargandoRecomendaciones
              ? "Actualizando..."
              : "Actualizar prioridades"}
          </button>
        </div>

        {errorRecomendaciones && (
          <div className="dashboard-v2-aviso-error">
            {errorRecomendaciones}
          </div>
        )}

        
            <div className="dashboard-v2-grid-decisiones">
  <CentroDecisiones
    recomendaciones={recomendacionesIA}
    metricas={metricas}
  />

  <div className="dashboard-v2-columna-lateral">
  <CentroActividad
    ventas={ventas}
    socketConectado={socketConectado}
  />

  <EstadoSistema
    socketConectado={socketConectado}
    metricas={metricas}
  />

  <ResumenInteligente
    metricas={metricas}
  />
</div>
        </div>
      </section>

      <section className="dashboard-v2-seccion">
        <div className="dashboard-v2-titulo-seccion">
          <div>
            <span>PRODUCCIÓN</span>
            <h2>Capacidad disponible</h2>
          </div>

          <p>
            Productos con menor disponibilidad según el
            stock actual.
          </p>
        </div>

        <div className="dashboard-v2-produccion">
          <ProduccionResumen
            produccion={metricas.produccionMasBaja}
          />
        </div>
      </section>
    </section>
  );
}

export default DashboardEnterpriseV2;