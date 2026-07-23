import StatCard from "../ui/StatCard";

function formatearDinero(valor) {
  const numero = Number(valor) || 0;

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(numero);
}

function KPIGrid({ metricas }) {
  const stockCritico =
    Array.isArray(metricas?.stockCritico)
      ? metricas.stockCritico
      : [];

  const ventasHoy =
    Array.isArray(metricas?.ventasHoy)
      ? metricas.ventasHoy
      : [];

  const pedidosActivos =
    Array.isArray(metricas?.pedidosActivos)
      ? metricas.pedidosActivos
      : [];

  return (
    <div className="dashboard-enterprise-kpis">
      <StatCard
        icono="💰"
        titulo="Facturación de hoy"
        valor={formatearDinero(metricas?.facturacionHoy)}
        subtitulo={`${ventasHoy.length} ventas registradas`}
        color="success"
      />

      <StatCard
        icono="🎫"
        titulo="Ticket promedio"
        valor={formatearDinero(metricas?.ticketPromedio)}
        subtitulo="Promedio por venta de hoy"
        color="primary"
      />

      <StatCard
        icono="👨‍🍳"
        titulo="Pedidos en cocina"
        valor={metricas?.pedidosEnCocina || 0}
        subtitulo={`${pedidosActivos.length} pedidos activos`}
        color={
          Number(metricas?.pedidosEnCocina) > 5
            ? "warning"
            : "primary"
        }
      />

      <StatCard
        icono="✅"
        titulo="Entregados hoy"
        valor={metricas?.entregadosHoy || 0}
        subtitulo="Pedidos finalizados"
        color="success"
      />

      <StatCard
        icono="🚚"
        titulo="Delivery hoy"
        valor={metricas?.deliveriesHoy || 0}
        subtitulo="Pedidos con envío"
        color="primary"
      />

      <StatCard
        icono="⚠️"
        titulo="Stock crítico"
        valor={stockCritico.length}
        subtitulo={
          stockCritico.length > 0
            ? "Insumos que requieren atención"
            : "Stock operativo sin alertas"
        }
        color={
          stockCritico.length > 0
            ? "danger"
            : "success"
        }
      />
    </div>
  );
}

export default KPIGrid;