import { useEffect, useState } from "react";
import PrioridadesDia from "./Dashboard/PrioridadesDia";
import EstadoSistema from "./Dashboard/EstadoSistema";
import KPIGrid from "./Dashboard/KPIGrid";
import ProduccionResumen from "./Dashboard/ProduccionResumen";
import ResumenInteligente from "./Dashboard/ResumenInteligente";
import TopProductos from "./Dashboard/TopProductos";
import VentasChart from "./Dashboard/VentasChart";
import { calcularDashboard } from "./Dashboard/helpers";
import GerenteVirtualCard from "./GerenteVirtualCard";

function Dashboard({
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
  const metricas = calcularDashboard({
    ventas,
    productos,
    usuarios,
    stock,
    produccion,
    clientes,
  });

  const fechaActual = new Date().toLocaleDateString(
    "es-AR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
  useEffect(() => {
  async function cargarRecomendaciones() {
    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/masaia/recomendaciones"
      );

      if (!respuesta.ok) {
        return;
      }

      const datos = await respuesta.json();

      setRecomendacionesIA(
        Array.isArray(datos.recomendaciones)
          ? datos.recomendaciones
          : []
      );
    } catch (error) {
      console.error(
        "Error cargando recomendaciones:",
        error
      );
    }
  }

  cargarRecomendaciones();
}, []);

  return (
    <section className="dashboard-enterprise">
      <div className="dashboard-enterprise-bienvenida">
        <div>
          <p>DASHBOARD ENTERPRISE</p>

          <h2>
            👋 Hola,{" "}
            {usuarioLogueado?.nombre || "Usuario"}
          </h2>

          <span>
            Resumen del negocio para el{" "}
            {fechaActual}.
          </span>
        </div>

        <div
          className={`dashboard-enterprise-conexion ${
            socketConectado
              ? "conectado"
              : "desconectado"
          }`}
        >
          <span />

          {socketConectado
            ? "Tiempo real conectado"
            : "Modo de respaldo"}
        </div>
      </div>

      <GerenteVirtualCard
  usuarioLogueado={usuarioLogueado}
/>

      <KPIGrid metricas={metricas} />

      <div className="dashboard-enterprise-grid-principal">
        <VentasChart
          datos={
            metricas.ventasUltimosSieteDias
          }
        />

        <TopProductos
          productos={
            metricas.productosMasVendidos
          }
        />
      </div>

      <div className="dashboard-enterprise-grid-secundaria">
        <PrioridadesDia
  recomendaciones={recomendacionesIA}
/>
        <EstadoSistema
          socketConectado={socketConectado}
          metricas={metricas}
        />

        <ResumenInteligente
          metricas={metricas}
        />

        <ProduccionResumen
          produccion={
            metricas.produccionMasBaja
          }
        />
      </div>
    </section>
  );
}

export default Dashboard;