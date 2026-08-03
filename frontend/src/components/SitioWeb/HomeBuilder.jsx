function HomeBuilder({
  secciones,
  actualizarSecciones,
}) {
  const BLOQUES = [
    {
      id: "hero",
      titulo: "Hero principal",
      descripcion:
        "Banner principal de la página.",
    },
    {
      id: "promociones",
      titulo: "Promociones",
      descripcion:
        "Ofertas destacadas.",
    },
    {
      id: "productos",
      titulo: "Productos destacados",
      descripcion:
        "Productos recomendados.",
    },
    {
      id: "nosotros",
      titulo: "Nosotros",
      descripcion:
        "Historia del negocio.",
    },
    {
      id: "opiniones",
      titulo: "Opiniones",
      descripcion:
        "Reseñas de clientes.",
    },
    {
      id: "footer",
      titulo: "Footer",
      descripcion:
        "Información de contacto.",
    },
  ];

  return (
    <article className="sitio-web__tarjeta">

      <header className="sitio-web__panel-header">
        <h2>🏠 Home Builder</h2>

        <p>
          Elegí qué secciones querés
          mostrar en la página principal.
        </p>
      </header>

      <div className="home-builder">

        {BLOQUES.map((bloque) => (
          <label
            key={bloque.id}
            className="home-builder__item"
          >
            <div>
              <strong>
                {bloque.titulo}
              </strong>

              <p>
                {bloque.descripcion}
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                secciones?.[bloque.id] ??
                true
              }
              onChange={(e) => {
  

  actualizarSecciones({
    [bloque.id]: e.target.checked,
  });
}}
            />
          </label>
        ))}

      </div>

    </article>
  );
}

export default HomeBuilder;