import ProductoCard from "../ui/ProductoCard";

function ProductosDestacados({
  productos,
  onAgregarProducto,
  categoriaSeleccionada,
  limpiarCategoria,
}) {
  return (
    <section
      id="menu"
      className="seccion"
    >
      <div className="contenedor">
        <div className="encabezado-seccion">
          <div>
            <p className="etiqueta-seccion">
              Nuestros favoritos
            </p>

            <h2>
              {categoriaSeleccionada || "Productos destacados"}
            </h2>

            <p>
              Productos cargados directamente
              desde MasaOS.
            </p>
          </div>

          <button
            type="button"
            className="boton boton--outline"
            onClick={categoriaSeleccionada ? limpiarCategoria : undefined}
          >
            {categoriaSeleccionada
              ? "Ver todos"
              : "Ver menú completo"}
          </button>
        </div>

        {productos.length === 0 ? (
          <div className="estado-vacio">
            No hay productos activos disponibles.
          </div>
        ) : (
          <div className="productos-grid">
            {productos.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                onAgregar={onAgregarProducto}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductosDestacados;
