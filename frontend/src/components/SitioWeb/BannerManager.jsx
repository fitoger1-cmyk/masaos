import { useState } from "react";
import { apiFetch } from "../../services/api";

function BannerManager({
  configuracion,
  bannerConfig,
  actualizarBanner,
  guardarConfiguracion,
})
 {
  const [archivoBanner, setArchivoBanner] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  async function subirBanner() {
    if (!archivoBanner) {
      alert("Seleccioná una imagen.");
      return;
    }

  try {
    setSubiendo(true);

    const formData = new FormData();
    formData.append("imagen", archivoBanner);

    const respuesta = await apiFetch("/multimedia/banner", {
      method: "POST",
      body: formData,
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo subir el banner.");
    }

    const datos = await respuesta.json();

    const separador = datos.url.includes("?") ? "&" : "?";

const urlBannerActualizada =
  `${datos.url}${separador}v=${Date.now()}`;

const nuevaConfiguracion = {
  ...configuracion,

   banner: urlBannerActualizada,

  bannerConfig: {
    ...configuracion.bannerConfig,
    imagen: urlBannerActualizada,
  },
};

actualizarBanner({
  imagen: urlBannerActualizada,
});


  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    setSubiendo(false);
  }
}
  return (
    <article className="sitio-web__tarjeta">
      <h2>🖼 Banner principal</h2>

      {bannerConfig.imagen ? (
        <div
          className="sitio-web__banner"
          style={{
            backgroundImage: `linear-gradient(
              rgba(0, 0, 0, ${bannerConfig.opacidad}),
              rgba(0, 0, 0, ${bannerConfig.opacidad})
            ), url("${bannerConfig.imagen}")`,
          }}
        >
          <h3>{bannerConfig.titulo}</h3>
          <p>{bannerConfig.subtitulo}</p>

          <span>
            {bannerConfig.textoBoton}
          </span>
        </div>
      ) : (
        <p>No hay una imagen de banner configurada.</p>
      )}
      <div
  style={{
    display: "flex",
    gap: 15,
    marginTop: 20,
    marginBottom: 20,
  }}
>
  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setArchivoBanner(e.target.files[0])
    }
  />

  <button
    onClick={subirBanner}
    disabled={subiendo}
  >
    {subiendo
      ? "Subiendo..."
      : "☁ Subir banner"}
  </button>
</div>
      <div className="sitio-web__grilla">
        <label>
          URL de la imagen

          <input
            type="text"
            value={bannerConfig.imagen}
            onChange={(e) =>
              actualizarBanner({
                imagen: e.target.value,
              })
            }
          />
        </label>

        <label>
          Título

          <input
            type="text"
            value={bannerConfig.titulo}
            onChange={(e) =>
              actualizarBanner({
                titulo: e.target.value,
              })
            }
          />
        </label>

        <label>
          Subtítulo

          <input
            type="text"
            value={bannerConfig.subtitulo}
            onChange={(e) =>
              actualizarBanner({
                subtitulo: e.target.value,
              })
            }
          />
        </label>

        <label>
          Texto del botón

          <input
            type="text"
            value={bannerConfig.textoBoton}
            onChange={(e) =>
              actualizarBanner({
                textoBoton: e.target.value,
              })
            }
          />
        </label>

        <label>
          Destino del botón

          <select
            value={bannerConfig.destino}
            onChange={(e) =>
              actualizarBanner({
                destino: e.target.value,
              })
            }
          >
            <option value="menu">Menú</option>
            <option value="whatsapp">
              WhatsApp
            </option>
            <option value="promociones">
              Promociones
            </option>
            <option value="url">
              URL personalizada
            </option>
          </select>
        </label>

        {bannerConfig.destino === "url" && (
          <label>
            URL personalizada

            <input
              type="text"
              value={
                bannerConfig.urlPersonalizada
              }
              onChange={(e) =>
                actualizarBanner({
                  urlPersonalizada:
                    e.target.value,
                })
              }
            />
          </label>
        )}

       
        <label className="sitio-web__opacidad">
  <span>
    Opacidad:{" "}
    <strong>
      {Math.round(Number(bannerConfig.opacidad) * 100)}%
    </strong>
  </span>

  <input
    type="range"
    min="0"
    max="0.9"
    step="0.05"
    value={bannerConfig.opacidad}
    onChange={(e) =>
      actualizarBanner({
        opacidad: Number(e.target.value),
      })
    }
  />
</label>
      </div>
    </article>
  );
}

export default BannerManager;