function Promociones() {
  return (
    <section
      id="promociones"
      className="seccion seccion--clara"
    >
      <div className="contenedor">
        <div className="encabezado-seccion">
          <div>
            <p className="etiqueta-seccion">
              Beneficio destacado
            </p>

            <h2>
              Hoy es un buen día para comer pizza
            </h2>
          </div>
        </div>

        <article className="promocion-principal">
          <div>
            <span className="promocion-principal__badge">
              Promo destacada
            </span>

            <h3>
              Pedí tus favoritos desde nuestra web
            </h3>

            <p>
              Elegí pizzas, focaccias y postres.
              Armá tu pedido de manera rápida,
              simple y desde cualquier dispositivo.
            </p>
          </div>

          <a
            href="#menu"
            className="boton boton--claro"
          >
            Explorar menú
          </a>
        </article>
      </div>
    </section>
  );
}

export default Promociones;