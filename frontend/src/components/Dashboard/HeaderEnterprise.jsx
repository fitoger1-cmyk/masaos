import Badge from "../ui/Badge";

function HeaderEnterprise({
  usuario,
  socketConectado,
}) {
  const ahora = new Date();

  const saludo = (() => {
    const hora = ahora.getHours();

    if (hora < 12) return "Buenos días";
    if (hora < 20) return "Buenas tardes";
    return "Buenas noches";
  })();

  const fecha = ahora.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hora = ahora.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="header-enterprise">
      <div className="header-enterprise-info">
        <span className="header-kicker">
          EMPRESA MASAOS
        </span>

        <h1>
          {saludo},{" "}
          {usuario?.nombre || "Administrador"}
        </h1>

        <p>
          {fecha} · {hora}
        </p>
      </div>

      <div className="header-enterprise-status">
        <Badge
          variante={
            socketConectado
              ? "success"
              : "danger"
          }
        >
          {socketConectado
            ? "Sistema conectado"
            : "Sin conexión"}
        </Badge>

        <div className="header-usuario">
          <strong>
            {usuario?.nombre}
          </strong>

          <small>
            {usuario?.rol}
          </small>
        </div>
      </div>
    </header>
  );
}

export default HeaderEnterprise;