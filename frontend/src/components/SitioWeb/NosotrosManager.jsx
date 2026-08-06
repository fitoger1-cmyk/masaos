import { useState } from "react";
import { apiFetch } from "../../services/api";

function NosotrosManager({
  imagenNosotros,
  actualizarImagenNosotros,
}) {
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function subirImagen() {
    if (!archivo) {
      setError("Seleccioná una imagen.");
      return;
    }

    try {
      setSubiendo(true);
      setError("");

      const formData = new FormData();
      formData.append("imagen", archivo);

      const respuesta = await apiFetch(
        "/multimedia/nosotros",
        {
          method: "POST",
          body: formData,
        }
      );

      const datos = await respuesta
        .json()
        .catch(() => ({}));

      if (!respuesta.ok || !datos.url) {
        throw new Error(
          datos.error ||
            "No se pudo subir la imagen de Nosotros."
        );
      }

      actualizarImagenNosotros(datos.url);
      setArchivo(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <article className="sitio-web__tarjeta">
      <header className="sitio-web__panel-header">
        <h2>👨‍🍳 Imagen de Nosotros</h2>
        <p>
          Esta imagen es independiente del banner principal.
        </p>
      </header>

      {imagenNosotros ? (
        <img
          src={imagenNosotros}
          alt="Vista previa de la sección Nosotros"
          className="sitio-web__nosotros-preview"
        />
      ) : (
        <p>No hay una imagen configurada.</p>
      )}

      <div className="sitio-web__carga-imagen">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) =>
            setArchivo(event.target.files?.[0] || null)
          }
        />

        <button
          type="button"
          onClick={subirImagen}
          disabled={subiendo || !archivo}
        >
          {subiendo
            ? "Subiendo..."
            : "☁ Subir imagen Nosotros"}
        </button>
      </div>

      <label className="sitio-web__campo-completo">
        URL de la imagen
        <input
          type="text"
          value={imagenNosotros || ""}
          onChange={(event) =>
            actualizarImagenNosotros(event.target.value)
          }
          placeholder="https://res.cloudinary.com/..."
        />
      </label>

      {error && (
        <p className="sitio-web__error-campo">{error}</p>
      )}
    </article>
  );
}

export default NosotrosManager;
