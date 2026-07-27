import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";

const promocionInicial = {
  nombre: "",
  descripcion: "",
  imagen: "",
  precioAnterior: "",
  precioPromocional: "",
  inicio: "",
  fin: "",
  mostrarInicio: true,
  mostrarCarrusel: false,
  mostrarDestacados: false,
  mostrarPopup: false,
  activa: true,
};

function PromocionesManager() {
  const [promociones, setPromociones] = useState([]);
  const [formulario, setFormulario] = useState(promocionInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  useEffect(() => {
    cargarPromociones();
  }, []);

  async function cargarPromociones() {
    try {
      setCargando(true);
      setError("");

      const respuesta = await apiFetch("/promociones");

      if (!respuesta.ok) {
        throw new Error(
          `No se pudieron cargar las promociones. Código: ${respuesta.status}`
        );
      }

      const datos = await respuesta.json();

      setPromociones(Array.isArray(datos) ? datos : []);
    } catch (err) {
      console.error("Error cargando promociones:", err);
      setError(
        err.message ||
          "No se pudieron cargar las promociones."
      );
    } finally {
      setCargando(false);
    }
  }

  function actualizarCampo(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function limpiarFormulario() {
  setFormulario(promocionInicial);
  setArchivoImagen(null);
  setEditandoId(null);
  setMensaje("");
  setError("");
}

  async function guardarPromocion(e) {
    e.preventDefault();

    if (!formulario.nombre.trim()) {
      setError("El nombre de la promoción es obligatorio.");
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");
      setError("");

      const ruta = editandoId
        ? `/promociones/${editandoId}`
        : "/promociones";

      const metodo = editandoId ? "PUT" : "POST";

      const respuesta = await apiFetch(ruta, {
        method: metodo,
        body: JSON.stringify({
          ...formulario,
          precioAnterior: Number(
            formulario.precioAnterior || 0
          ),
          precioPromocional: Number(
            formulario.precioPromocional || 0
          ),
        }),
      });

      const datos = await respuesta
        .json()
        .catch(() => ({}));

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            datos.mensaje ||
            "No se pudo guardar la promoción."
        );
      }

      setMensaje(
        editandoId
          ? "Promoción actualizada correctamente."
          : "Promoción creada correctamente."
      );

      limpiarFormulario();
      await cargarPromociones();
    } catch (err) {
      console.error("Error guardando promoción:", err);
      setError(
        err.message ||
          "No se pudo guardar la promoción."
      );
    } finally {
      setGuardando(false);
    }
  }

  function editarPromocion(promocion) {
    setEditandoId(promocion.id);

    setFormulario({
      nombre: promocion.nombre || "",
      descripcion: promocion.descripcion || "",
      imagen: promocion.imagen || "",
      precioAnterior:
        promocion.precioAnterior ?? "",
      precioPromocional:
        promocion.precioPromocional ?? "",
      inicio: promocion.inicio || "",
      fin: promocion.fin || "",
      mostrarInicio:
        promocion.mostrarInicio ?? true,
      mostrarCarrusel:
        promocion.mostrarCarrusel ?? false,
      mostrarDestacados:
        promocion.mostrarDestacados ?? false,
      mostrarPopup:
        promocion.mostrarPopup ?? false,
      activa: promocion.activa ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function eliminarPromocion(id) {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar esta promoción?"
    );

    if (!confirmar) return;

    try {
      setError("");
      setMensaje("");

      const respuesta = await apiFetch(
        `/promociones/${id}`,
        {
          method: "DELETE",
        }
      );

      const datos = await respuesta
        .json()
        .catch(() => ({}));

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            "No se pudo eliminar la promoción."
        );
      }

      setMensaje("Promoción eliminada correctamente.");

      if (editandoId === id) {
        limpiarFormulario();
      }

      await cargarPromociones();
    } catch (err) {
      console.error("Error eliminando promoción:", err);
      setError(
        err.message ||
          "No se pudo eliminar la promoción."
      );
    }
  }

  async function cambiarEstado(promocion) {
    try {
      setError("");
      setMensaje("");

      const respuesta = await apiFetch(
        `/promociones/${promocion.id}/estado`,
        {
          method: "PATCH",
          body: JSON.stringify({
            activa: !promocion.activa,
          }),
        }
      );

      const datos = await respuesta
        .json()
        .catch(() => ({}));

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            "No se pudo cambiar el estado."
        );
      }

      setMensaje(
        datos.activa
          ? "Promoción activada."
          : "Promoción desactivada."
      );

      await cargarPromociones();
    } catch (err) {
      console.error("Error cambiando estado:", err);
      setError(
        err.message ||
          "No se pudo cambiar el estado."
      );
    }
  }
async function subirImagenPromocion() {
  if (!archivoImagen) {
    setError("Seleccioná una imagen para la promoción.");
    return;
  }

  try {
    setSubiendoImagen(true);
    setMensaje("");
    setError("");

    const formData = new FormData();
    formData.append("imagen", archivoImagen);

    const respuesta = await apiFetch("/multimedia/producto", {
      method: "POST",
      body: formData,
    });

    const datos = await respuesta
      .json()
      .catch(() => ({}));

    if (!respuesta.ok) {
      throw new Error(
        datos.error ||
          datos.mensaje ||
          "No se pudo subir la imagen."
      );
    }

    if (!datos.url) {
      throw new Error(
        "Cloudinary no devolvió la URL de la imagen."
      );
    }

    actualizarCampo("imagen", datos.url);
    setArchivoImagen(null);

    setMensaje(
      "Imagen subida correctamente. Ahora podés crear la promoción."
    );
  } catch (err) {
    console.error(
      "Error subiendo imagen de promoción:",
      err
    );

    setError(
      err.message ||
        "No se pudo subir la imagen."
    );
  } finally {
    setSubiendoImagen(false);
  }
}
  return (
    <article className="sitio-web__tarjeta promociones-manager">
      <div className="promociones-manager__encabezado">
        <div>
          <h2>🎉 Promociones PRO</h2>
          <p>
            Creá y administrá promociones para mostrar
            en la web pública.
          </p>
        </div>

        {editandoId && (
          <button
            type="button"
            onClick={limpiarFormulario}
          >
            Cancelar edición
          </button>
        )}
      </div>

      {mensaje && (
        <div className="sitio-web__mensaje sitio-web__mensaje--exito">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="sitio-web__mensaje sitio-web__mensaje--error">
          {error}
        </div>
      )}

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

          <div className="promociones-manager__imagen">
  <label>
    Imagen de la promoción

    <input
      type="file"
      accept="image/*"
      onChange={(e) =>
        setArchivoImagen(
          e.target.files?.[0] || null
        )
      }
    />
  </label>

  <button
    type="button"
    onClick={subirImagenPromocion}
    disabled={
      subiendoImagen || !archivoImagen
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
              value={formulario.precioPromocional}
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
              checked={formulario.mostrarInicio}
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
              checked={formulario.mostrarCarrusel}
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
              checked={formulario.mostrarDestacados}
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
              checked={formulario.mostrarPopup}
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
      </form>

      <section className="promociones-manager__listado">
        <h3>Promociones creadas</h3>

        {cargando ? (
          <p>Cargando promociones...</p>
        ) : promociones.length === 0 ? (
          <p>
            Todavía no hay promociones creadas.
          </p>
        ) : (
          <div className="promociones-manager__tarjetas">
            {promociones.map((promocion) => (
              <article
                key={promocion.id}
                className="promociones-manager__promocion"
              >
                {promocion.imagen && (
                  <img
                    src={promocion.imagen}
                    alt={promocion.nombre}
                  />
                )}

                <div>
                  <span
                    className={
                      promocion.activa
                        ? "promociones-manager__estado promociones-manager__estado--activo"
                        : "promociones-manager__estado promociones-manager__estado--inactivo"
                    }
                  >
                    {promocion.activa
                      ? "Activa"
                      : "Inactiva"}
                  </span>

                  <h4>{promocion.nombre}</h4>

                  <p>{promocion.descripcion}</p>

                  <div className="promociones-manager__precios">
                    {Number(
                      promocion.precioAnterior
                    ) > 0 && (
                      <span>
                        $
                        {Number(
                          promocion.precioAnterior
                        ).toLocaleString("es-AR")}
                      </span>
                    )}

                    {Number(
                      promocion.precioPromocional
                    ) > 0 && (
                      <strong>
                        $
                        {Number(
                          promocion.precioPromocional
                        ).toLocaleString("es-AR")}
                      </strong>
                    )}
                  </div>
                  {Number(promocion.precioAnterior) >
  Number(promocion.precioPromocional) &&
  Number(promocion.precioPromocional) > 0 && (
    <p className="promociones-manager__ahorro">
      🔥 Ahorrás $
      {(
        Number(promocion.precioAnterior) -
        Number(promocion.precioPromocional)
      ).toLocaleString("es-AR")}
    </p>
  )}
  <div className="promociones-manager__badges">
  {promocion.mostrarInicio && (
    <span className="promociones-manager__badge">
      🏠 Inicio
    </span>
  )}

  {promocion.mostrarCarrusel && (
    <span className="promociones-manager__badge">
      🎠 Carrusel
    </span>
  )}

  {promocion.mostrarDestacados && (
    <span className="promociones-manager__badge">
      ⭐ Destacada
    </span>
  )}

  {promocion.mostrarPopup && (
    <span className="promociones-manager__badge">
      💬 Popup
    </span>
  )}
</div>

                  <div className="promociones-manager__acciones">
                    <button
                      type="button"
                      onClick={() =>
                        editarPromocion(promocion)
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        cambiarEstado(promocion)
                      }
                    >
                      {promocion.activa
                        ? "Desactivar"
                        : "Activar"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        eliminarPromocion(
                          promocion.id
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

export default PromocionesManager;