    import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatearDinero } from "./helpers";

function VentasChart({ datos }) {
  return (
    <article className="dashboard-enterprise-panel dashboard-enterprise-grafico">
      <div className="dashboard-enterprise-panel-titulo">
        <div>
          <h3>📈 Ventas de los últimos 7 días</h3>
          <p>Evolución diaria de la facturación.</p>
        </div>
      </div>

      <div className="dashboard-enterprise-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datos}>
            <defs>
              <linearGradient
                id="dashboardColorVentas"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#df593e"
                  stopOpacity={0.45}
                />
                <stop
                  offset="95%"
                  stopColor="#df593e"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis dataKey="fecha" />

            <YAxis
              tickFormatter={(valor) =>
                `$${formatearDinero(valor)}`
              }
            />

            <Tooltip
              formatter={(valor) => [
                `$ ${formatearDinero(valor)}`,
                "Facturación",
              ]}
            />

            <Area
              type="monotone"
              dataKey="total"
              stroke="#df593e"
              strokeWidth={3}
              fill="url(#dashboardColorVentas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default VentasChart;

    
