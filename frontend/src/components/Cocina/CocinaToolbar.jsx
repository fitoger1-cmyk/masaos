    function CocinaToolbar({
  cantidadPedidos,
  cargando,
  sonidoActivo,
  setSonidoActivo,
  pantallaCompleta,
  actualizar,
  alternarPantallaCompleta,
}) {
  return (
    <header className="cocina-pro-toolbar">
      <div>
        <p className="cocina-pro-etiqueta">
          KITCHEN DISPLAY SYSTEM
        </p>

        <h1>👨‍🍳 Cocina PRO</h1>

        <p>
          Pedidos activos:{" "}
          <strong>{cantidadPedidos}</strong>
        </p>
      </div>

      <div className="cocina-pro-toolbar-acciones">
        <button
          type="button"
          className={
            sonidoActivo ? "activo" : ""
          }
          onClick={() =>
            setSonidoActivo((actual) => !actual)
          }
        >
          {sonidoActivo
            ? "🔔 Sonido"
            : "🔕 Silencio"}
        </button>

        <button
          type="button"
          onClick={actualizar}
          disabled={cargando}
        >
          {cargando
            ? "Actualizando..."
            : "🔄 Actualizar"}
        </button>

        <button
          type="button"
          onClick={alternarPantallaCompleta}
        >
          {pantallaCompleta
            ? "⛶ Salir"
            : "⛶ Pantalla completa"}
        </button>
      </div>
    </header>
  );
}

export default CocinaToolbar;

    
