    import ProductoCard from "./ProductoCard";

function CatalogoProductos({
  buscadorRef,
  busqueda,
  setBusqueda,
  categorias,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  productosFiltrados,
  seleccionarProducto,
}) {
  return (
    <>
      <div className="caja-filtros">
        <input
          ref={buscadorRef}
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="🔎 Buscar producto..."
        />

        <div className="caja-categorias">
          {categorias.map((categoria) => (
            <button
              type="button"
              key={categoria}
              className={
                categoriaSeleccionada === categoria ? "activo" : ""
              }
              onClick={() => setCategoriaSeleccionada(categoria)}
            >
              {categoria}
            </button>
          ))}
        </div>
      </div>

      {productosFiltrados.length === 0 ? (
        <p>No se encontraron productos.</p>
      ) : (
        <div className="caja-productos-grid">
          {productosFiltrados.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onAgregar={seleccionarProducto}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default CatalogoProductos;

    
