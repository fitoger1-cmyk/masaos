function LogoManager({
  configuracion,
  actualizarConfiguracion,
  actualizarWeb,
}) {
  const logo =
    configuracion.web?.logo ||
    configuracion.logo ||
    "";

  return (
    <article className="sitio-web__tarjeta">
      <h2>🍕 Logotipo</h2>

      {logo ? (
        <img
          src={logo}
          alt="Logotipo del negocio"
          className="sitio-web__logo"
        />
      ) : (
        <p>No hay un logotipo configurado.</p>
      )}

      <label>
        URL del logotipo

        <input
          type="text"
          value={logo}
          onChange={(e) => {
            actualizarWeb({
              logo: e.target.value,
            });

            actualizarConfiguracion({
              logo: e.target.value,
            });
          }}
        />
      </label>
    </article>
  );
}

export default LogoManager;