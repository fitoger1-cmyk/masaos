    import { formatearDinero } from "./helpers";

function KPICard({
  icono,
  titulo,
  valor,
  detalle,
  dinero = false,
  alerta = false,
}) {
  return (
    <article
      className={`dashboard-enterprise-kpi ${
        alerta ? "dashboard-kpi-alerta" : ""
      }`}
    >
      <div className="dashboard-enterprise-kpi-icono">
        {icono}
      </div>

      <div>
        <span>{titulo}</span>

        <strong>
          {dinero
            ? `$ ${formatearDinero(valor)}`
            : valor}
        </strong>

        <small>{detalle}</small>
      </div>
    </article>
  );
}

export default KPICard;

    
