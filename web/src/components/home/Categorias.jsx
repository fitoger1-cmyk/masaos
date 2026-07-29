function normalizarCategoria(categoria = "") {
  return String(categoria)
    .trim()
    .toLowerCase();
}

function obtenerIcono(categoria) {
  const categoriaNormalizada =
    normalizarCategoria(categoria);

  if (
    categoriaNormalizada.includes("focaccia")
  ) {
    return "🥪";
  }

  if (
    categoriaNormalizada.includes("postre")
  ) {
    return "🍰";
  }

  if (
    categoriaNormalizada.includes("bebida")
  ) {
    return "🥤";
  }

  return "🍕";
}

function Categorias({ categorias }) {
  return (
    <section className="seccion seccion--categorias">
      <div className="contenedor">
        <div className="encabezado-seccion">
          <div>
            <p className="etiqueta-seccion">
              Elegí tu antojo
            </p>

            <h2>Todo lo que hacemos</h2>
          </div>
        </div>

        <div className="categorias-grid">
          {categorias.map((categoria) => (
            <a
              href="#menu"
              className="categoria-card"
              key={categoria}
            >
              <span>
                {obtenerIcono(categoria)}
              </span>

              <strong>{categoria}</strong>

              <small>
                Productos artesanales
              </small>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categorias;