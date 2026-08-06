import { useEffect, useState } from "react";
import { apiFetch } from "../../../services/api";

import PromocionCard from "./PromocionCard";
import PromocionForm from "./PromocionForm";
import PromocionPreview from "./PromocionPreview";
import MarketingResumen from "./MarketingResumen";
import MarketingToolbar from "./MarketingToolbar";

import "./promociones.css";

const promocionInicial = {
  nombre: "",
  descripcion: "",
  imagen: "",
  etiqueta: "oferta",
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
  const [busqueda, setBusqueda] = useState("");

const [filtro, setFiltro] = useState("todas");

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
      etiqueta: promocion.etiqueta || "oferta",
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
function calcularDescuento(
  precioAnterior,
  precioPromocional
) {
  const anterior =
    Number(precioAnterior);

  const promocional =
    Number(precioPromocional);

  if (
    anterior <= 0 ||
    promocional <= 0 ||
    promocional >= anterior
  ) {
    return 0;
  }

  return Math.round(
    ((anterior - promocional) /
      anterior) *
      100
  );
}
const promocionesFiltradas =
  promociones.filter((promocion) => {

    const nombre = (promocion.nombre || "")
      .toLowerCase();

    const descripcion =
      (promocion.descripcion || "")
        .toLowerCase();

    const texto =
      busqueda.toLowerCase();

    const coincide =
      nombre.includes(texto) ||
      descripcion.includes(texto);

    if (!coincide) {
      return false;
    }

    switch (filtro) {

      case "activas":
        return promocion.activa;

      case "inactivas":
        return !promocion.activa;

      case "inicio":
        return promocion.mostrarInicio;

      case "carrusel":
        return promocion.mostrarCarrusel;

      case "popup":
        return promocion.mostrarPopup;

      default:
        return true;
    }
  });
  return (
    <article className="sitio-web__tarjeta promociones-manager">
      <div className="promociones-manager__encabezado">
        <div>
         <h2>🎉 Promociones PRO</h2>

<p>
  Creá y administrá promociones...
</p>

<MarketingResumen
  promociones={promociones}
/>

<MarketingToolbar
  busqueda={busqueda}
  setBusqueda={setBusqueda}
  filtro={filtro}
  setFiltro={setFiltro}
/>
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

     <div className="promociones-editor">
  <div className="promociones-editor__formulario">
    <PromocionForm
      formulario={formulario}
      editandoId={editandoId}
      guardando={guardando}
      archivoImagen={archivoImagen}
      subiendoImagen={subiendoImagen}
      actualizarCampo={actualizarCampo}
      setArchivoImagen={setArchivoImagen}
      subirImagenPromocion={
        subirImagenPromocion
      }
      guardarPromocion={
        guardarPromocion
      }
      limpiarFormulario={
        limpiarFormulario
      }
    />
  </div>

  <aside className="promociones-editor__preview">
    <PromocionPreview
      formulario={formulario}
    />
    
  </aside>
</div>

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
            {promocionesFiltradas.map((promocion) => (
              
  <PromocionCard
    key={promocion.id}
    promocion={promocion}
    onEditar={editarPromocion}
    onEliminar={eliminarPromocion}
    onCambiarEstado={cambiarEstado}
  />
))}
          </div>
        )}
      </section>
    </article>
  );
}

export default PromocionesManager;