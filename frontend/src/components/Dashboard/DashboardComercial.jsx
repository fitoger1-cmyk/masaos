import { useEffect, useState } from "react";
import { obtenerDashboard } from "../../services/api";
import MetricCard from "./MetricCard";

import "./dashboard.css";

function DashboardComercial() {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    async function cargar() {
      const respuesta =
        await obtenerDashboard();

      setDatos(respuesta);
    }

    cargar();
  }, []);

  if (!datos) {
    return <p>Cargando Dashboard...</p>;
  }

return (
  <section className="dashboard-comercial">

    <h2>
      Dashboard Comercial
    </h2>

    <div className="dashboard-grid">

      <MetricCard
        icono="💰"
        titulo="Ventas Hoy"
        valor={`$${datos.ventasHoy.toLocaleString("es-AR")}`}
      />

      <MetricCard
        icono="🛒"
        titulo="Pedidos"
        valor={datos.pedidosHoy}
      />

      <MetricCard
        icono="📊"
        titulo="Ticket Promedio"
        valor={`$${datos.ticketPromedio.toLocaleString("es-AR")}`}
      />

      <MetricCard
        icono="🍕"
        titulo="Producto Top"
        valor={datos.productoMasVendido}
      />

      <MetricCard
        icono="📦"
        titulo="Stock Crítico"
        valor={datos.stockCritico}
      />

      <MetricCard
        icono="👥"
        titulo="Clientes Nuevos"
        valor={datos.clientesNuevos}
      />

    </div>

  </section>
);
}

export default DashboardComercial;