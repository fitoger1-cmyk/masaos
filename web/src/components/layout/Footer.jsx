function Footer({
  nombreNegocio,
  direccion,
}) {
  return (
    <footer className="footer">
      <div className="contenedor footer__contenido">
        <div>
          <strong>{nombreNegocio}</strong>
          <p>{direccion}</p>
        </div>

        <div className="footer__enlaces">
          <a href="#inicio">Inicio</a>
          <a href="#menu">Menú</a>

          <a href="#promociones">
            Promociones
          </a>
        </div>

        <p>
          © {new Date().getFullYear()}{" "}
          {nombreNegocio}
        </p>
      </div>
    </footer>
  );
}

export default Footer;