function Hero({
  titulo,
  subtitulo,
  textoBoton,
  enlaceWhatsApp,
  horarios,
  envio,
  estiloHero,
}) {
  return (
    <section
      id="inicio"
      className="hero"
      style={estiloHero}
    >
      <div className="hero__overlay" />

      <div className="hero__contenido">
        <p className="hero__etiqueta">
          Pizzas artesanales · Pilar
        </p>

        <h1>{titulo}</h1>

        <p className="hero__descripcion">
          {subtitulo}
        </p>

        <div className="hero__acciones">
          <a
            href="#menu"
            className="boton boton--principal"
          >
            {textoBoton}
          </a>

          <a
            href={enlaceWhatsApp}
            target="_blank"
            rel="noreferrer"
            className="boton boton--secundario"
          >
            Pedir por WhatsApp
          </a>
        </div>

        <div className="hero__datos">
          <div>
            <strong>
              {horarios?.mediodia ||
                "11:00 - 16:00"}
            </strong>

            <span>Mediodía</span>
          </div>

          <div>
            <strong>
              {horarios?.noche ||
                "19:00 - 23:00"}
            </strong>

            <span>Noche</span>
          </div>

          <div>
            <strong>{envio}</strong>
            <span>Envíos en Pilar</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;