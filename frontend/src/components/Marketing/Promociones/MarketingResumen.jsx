function MarketingResumen({
  promociones = [],
}) {
  const hoy = new Date();

  hoy.setHours(0, 0, 0, 0);

  const activas = promociones.filter(
    (promocion) =>
      promocion.activa !== false
  ).length;

  const programadas = promociones.filter(
    (promocion) => {
      if (!promocion.inicio) {
        return false;
      }

      const inicio = new Date(
        `${promocion.inicio}T00:00:00`
      );

      return inicio > hoy;
    }
  ).length;

  const finalizanHoy =
    promociones.filter((promocion) => {
      if (!promocion.fin) {
        return false;
      }

      const fin = new Date(
        `${promocion.fin}T00:00:00`
      );

      return (
        fin.getFullYear() ===
          hoy.getFullYear() &&
        fin.getMonth() ===
          hoy.getMonth() &&
        fin.getDate() ===
          hoy.getDate()
      );
    }).length;

  const vencidas = promociones.filter(
    (promocion) => {
      if (!promocion.fin) {
        return false;
      }

      const fin = new Date(
        `${promocion.fin}T23:59:59`
      );

      return fin < hoy;
    }
  ).length;

  const indicadores = [
    {
      id: "total",
      icono: "📢",
      etiqueta: "Promociones totales",
      valor: promociones.length,
    },
    {
      id: "activas",
      icono: "🟢",
      etiqueta: "Promociones activas",
      valor: activas,
    },
    {
      id: "programadas",
      icono: "🗓️",
      etiqueta: "Programadas",
      valor: programadas,
    },
    {
      id: "hoy",
      icono: "⏳",
      etiqueta: "Finalizan hoy",
      valor: finalizanHoy,
    },
    {
      id: "vencidas",
      icono: "🔴",
      etiqueta: "Vencidas",
      valor: vencidas,
    },
  ];

  return (
    <section className="marketing-resumen">
      {indicadores.map((indicador) => (
        <article
          key={indicador.id}
          className="marketing-resumen__tarjeta"
        >
          <span className="marketing-resumen__icono">
            {indicador.icono}
          </span>

          <div>
            <strong>
              {indicador.valor}
            </strong>

            <p>
              {indicador.etiqueta}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}

export default MarketingResumen;