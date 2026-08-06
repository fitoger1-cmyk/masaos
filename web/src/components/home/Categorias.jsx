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

function Categorias({ categorias, onSeleccionar }) {
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
          {categorias.map((categoria) => {
            const nombre =
              typeof categoria === "string"
                ? categoria
                : categoria.nombre;
            const imagen =
              typeof categoria === "string"
                ? ""
                : categoria.imagen;
            const icono =
              typeof categoria === "string"
                ? obtenerIcono(nombre)
                : categoria.icono;

            return (
            <a
              href="#menu"
              className="categoria-card"
              key={nombre}
              style={
                imagen
                  ? {
                      backgroundImage: `linear-gradient(145deg, rgba(32, 22, 17, 0.42), rgba(32, 22, 17, 0.9)), url("${imagen}")`,
                    }
                  : undefined
              }
              onClick={() => onSeleccionar?.(nombre)}
            >
              {icono && <span>{icono}</span>}

              <strong>{nombre}</strong>

              <small>
                {categoria.descripcion || "Productos artesanales"}
              </small>
            </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Categorias;
