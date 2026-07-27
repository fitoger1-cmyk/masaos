function GeneralManager({
  configuracion,
  actualizarConfiguracion,
  actualizarNegocio,
}) {
  return (
    <article className="sitio-web__tarjeta">
      <h2>🏠 Información general</h2>

      <div className="sitio-web__grilla">
        <label>
          Nombre del negocio

          <input
            type="text"
            value={
              configuracion.negocio?.nombre ||
              configuracion.nombre ||
              ""
            }
            onChange={(e) => {
              actualizarNegocio({
                nombre: e.target.value,
              });

              actualizarConfiguracion({
                nombre: e.target.value,
              });
            }}
          />
        </label>

        <label>
          Teléfono

          <input
            type="text"
            value={
              configuracion.negocio?.telefono ||
              configuracion.telefono ||
              ""
            }
            onChange={(e) => {
              actualizarNegocio({
                telefono: e.target.value,
              });

              actualizarConfiguracion({
                telefono: e.target.value,
              });
            }}
          />
        </label>

        <label>
          Dirección

          <input
            type="text"
            value={
              configuracion.negocio?.direccion ||
              configuracion.direccion ||
              ""
            }
            onChange={(e) => {
              actualizarNegocio({
                direccion: e.target.value,
              });

              actualizarConfiguracion({
                direccion: e.target.value,
              });
            }}
          />
        </label>

        <label>
          Mensaje de WhatsApp

          <textarea
            rows="4"
            value={
              configuracion.mensajeWhatsApp || ""
            }
            onChange={(e) =>
              actualizarConfiguracion({
                mensajeWhatsApp: e.target.value,
              })
            }
          />
        </label>
      </div>
    </article>
  );
}

export default GeneralManager;