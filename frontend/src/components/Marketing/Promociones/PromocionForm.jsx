function PromocionForm({
  formulario,
  editandoId,
  guardando,
  archivoImagen,
  subiendoImagen,
  actualizarCampo,
  setArchivoImagen,
  subirImagenPromocion,
  guardarPromocion,
  limpiarFormulario,
}) {
  return (
    <form
      onSubmit={guardarPromocion}
      className="promociones-manager__formulario"
    >
      <div className="sitio-web__grilla">
        <label>
          Nombre de la promoción

          <input
            type="text"
            value={formulario.nombre}
            onChange={(e) =>
              actualizarCampo(
                "nombre",
                e.target.value
              )
            }
            placeholder="Ejemplo: Combo familiar"
          />
        </label>

        <label>
          Etiqueta

          <select
            value={formulario.etiqueta}
            onChange={(e) =>
              actualizarCampo(
                "etiqueta",
                e.target.value
              )
            }
          >
            <option value="oferta">
              🔥 Oferta
            </option>

            <option value="nuevo">
              ⭐ Nuevo
            </option>

            <option value="mas-vendido">
              🥇 Más vendido
            </option>

            <option value="limitado">
              🎉 Limitado
            </option>

            <option value="2x1">
              💥 2x1
            </option>

            <option value="envio-gratis">
              🚚 Envío gratis
            </option>
          </select>
        </label>

        <div className="promociones-manager__imagen">
          <label>
            Imagen de la promoción

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setArchivoImagen(
                  e.target.files?.[0] ||
                    null
                )
              }
            />
          </label>

          <button
            type="button"
            onClick={subirImagenPromocion}
            disabled={
              subiendoImagen ||
              !archivoImagen
            }
          >
            {subiendoImagen
              ? "Subiendo imagen..."
              : "☁ Subir imagen"}
          </button>

          <label>
            URL guardada

            <input
              type="text"
              value={formulario.imagen}
              onChange={(e) =>
                actualizarCampo(
                  "imagen",
                  e.target.value
                )
              }
              placeholder="Se completa automáticamente"
            />
          </label>

          {formulario.imagen && (
            <div className="promociones-manager__preview">
              <img
                src={formulario.imagen}
                alt={
                  formulario.nombre ||
                  "Vista previa de la promoción"
                }
              />
            </div>
          )}
        </div>

        <label className="promociones-manager__campo-ancho">
          Descripción

          <textarea
            rows="4"
            value={formulario.descripcion}
            onChange={(e) =>
              actualizarCampo(
                "descripcion",
                e.target.value
              )
            }
            placeholder="Descripción de la promoción"
          />
        </label>

        <label>
          Precio anterior

          <input
            type="number"
            min="0"
            value={formulario.precioAnterior}
            onChange={(e) =>
              actualizarCampo(
                "precioAnterior",
                e.target.value
              )
            }
          />
        </label>

        <label>
          Precio promocional

          <input
            type="number"
            min="0"
            value={
              formulario.precioPromocional
            }
            onChange={(e) =>
              actualizarCampo(
                "precioPromocional",
                e.target.value
              )
            }
          />
        </label>

        <label>
          Fecha de inicio

          <input
            type="date"
            value={formulario.inicio}
            onChange={(e) =>
              actualizarCampo(
                "inicio",
                e.target.value
              )
            }
          />
        </label>

        <label>
          Fecha de finalización

          <input
            type="date"
            value={formulario.fin}
            onChange={(e) =>
              actualizarCampo(
                "fin",
                e.target.value
              )
            }
          />
        </label>
      </div>

      <div className="promociones-manager__opciones">
        <label>
          <input
            type="checkbox"
            checked={
              formulario.mostrarInicio
            }
            onChange={(e) =>
              actualizarCampo(
                "mostrarInicio",
                e.target.checked
              )
            }
          />
          Mostrar en inicio
        </label>

        <label>
          <input
            type="checkbox"
            checked={
              formulario.mostrarCarrusel
            }
            onChange={(e) =>
              actualizarCampo(
                "mostrarCarrusel",
                e.target.checked
              )
            }
          />
          Mostrar en carrusel
        </label>

        <label>
          <input
            type="checkbox"
            checked={
              formulario.mostrarDestacados
            }
            onChange={(e) =>
              actualizarCampo(
                "mostrarDestacados",
                e.target.checked
              )
            }
          />
          Mostrar en destacados
        </label>

        <label>
          <input
            type="checkbox"
            checked={
              formulario.mostrarPopup
            }
            onChange={(e) =>
              actualizarCampo(
                "mostrarPopup",
                e.target.checked
              )
            }
          />
          Mostrar como popup
        </label>

        <label>
          <input
            type="checkbox"
            checked={formulario.activa}
            onChange={(e) =>
              actualizarCampo(
                "activa",
                e.target.checked
              )
            }
          />
          Promoción activa
        </label>
      </div>

      <div className="promociones-manager__form-actions">
        <button
          type="submit"
          disabled={guardando}
        >
          {guardando
            ? "Guardando..."
            : editandoId
              ? "Actualizar promoción"
              : "Crear promoción"}
        </button>

        {editandoId && (
          <button
            type="button"
            onClick={limpiarFormulario}
          >
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
}

export default PromocionForm;