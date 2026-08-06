function Nosotros({
  imagen,
}) {
  const estiloVisual = imagen
    ? {
        backgroundImage: `
          linear-gradient(
            180deg,
            transparent,
            rgba(27, 18, 13, 0.9)
          ),
          url("${imagen}")
        `,
      }
    : undefined;

  return (
    <section
      id="nosotros"
      className="seccion"
    >
      <div className="contenedor nosotros">
        <div
          className="nosotros__visual"
          style={estiloVisual}
        >
          <span>
            Hecho con masa artesanal
          </span>
        </div>

        <div className="nosotros__contenido">
          <p className="etiqueta-seccion">
            Nuestra cocina
          </p>

          <h2>
            Una pizzería independiente
            con identidad propia
          </h2>

          <p>
            Elaboramos pizzas, focaccias
            y productos de pastelería
            con dedicación y buenos
            ingredientes.
          </p>

          <p>
            Trabajamos para que cada pedido
            llegue con la misma calidad con
            la que sale de nuestra cocina.
          </p>

          <a
            href="#menu"
            className="boton boton--principal"
          >
            Ver el menú
          </a>
        </div>
      </div>
    </section>
  );
}

export default Nosotros;
