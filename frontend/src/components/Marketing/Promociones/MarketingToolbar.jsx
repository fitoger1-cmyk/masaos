function MarketingToolbar({
  busqueda,
  setBusqueda,
  filtro,
  setFiltro,
}) {
  return (
    <section className="marketing-toolbar">

      <input
        type="text"
        placeholder="🔎 Buscar promoción..."
        value={busqueda}
        onChange={(e) =>
          setBusqueda(e.target.value)
        }
      />

      <select
        value={filtro}
        onChange={(e) =>
          setFiltro(e.target.value)
        }
      >
        <option value="todas">
          Todas
        </option>

        <option value="activas">
          Activas
        </option>

        <option value="inactivas">
          Inactivas
        </option>

        <option value="inicio">
          Inicio
        </option>

        <option value="carrusel">
          Carrusel
        </option>

        <option value="popup">
          Popup
        </option>
      </select>

    </section>
  );
}

export default MarketingToolbar;