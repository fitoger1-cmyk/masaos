import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

function SitioWeb() {
  const [seccionActiva, setSeccionActiva] =
    useState("inicio");

  const [configuracion, setConfiguracion] =
    useState({
      tituloPrincipal: "El Club de la Masa G",
      subtitulo:
        "Pizzas artesanales, focaccias y pastelería",
      whatsapp: "541140480762",
      direccion: "Pilar, Buenos Aires",
      horarioMediodia: "11:00 a 16:00",
      horarioNoche: "19:00 a 23:00",
      mensajeWhatsApp:
        "Hola, quiero hacer un pedido.",
      mostrarPromociones: true,
      mostrarDestacados: true,
      logo: "",
      banner: "",
    });
    const [bannerPreview, setBannerPreview] = useState("");
const [bannerFile, setBannerFile] = useState(null);

const [bannerConfig, setBannerConfig] = useState({
  imagen: "",
  titulo: "",
  subtitulo: "",
  textoBoton: "Ver menú",
  destino: "menu",
  urlPersonalizada: "",
  opacidad: 0.55,
  activo: true,
});

  const [guardando, setGuardando] =
    useState(false);

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  const [tipoMensaje, setTipoMensaje] =
    useState("");

    const [subiendoLogo, setSubiendoLogo] =
  useState(false);

  const [archivoLogo, setArchivoLogo] =
  useState(null);

  function cambiarCampo(evento) {
    const {
      name,
      value,
      type,
      checked,
    } = evento.target;

    setConfiguracion((anterior) => ({
      ...anterior,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setMensaje("");
    setTipoMensaje("");
  }

  async function guardarConfiguracion(evento) {
    evento.preventDefault();

    setGuardando(true);
    setMensaje("");
    setTipoMensaje("");

    try {
      const respuesta = await apiFetch(
        "/configuracion",
        {
          method: "PUT",
          body: JSON.stringify({
            nombre:
              configuracion.tituloPrincipal,

            telefono:
              configuracion.whatsapp,

            direccion:
              configuracion.direccion,

            textoPrincipal:
              configuracion.tituloPrincipal,

            textoSecundario:
              configuracion.subtitulo,

            mensajeWhatsApp:
              configuracion.mensajeWhatsApp,

            mostrarPromociones:
              configuracion.mostrarPromociones,

            mostrarDestacados:
              configuracion.mostrarDestacados,

            horarios: {
              mediodia:
                configuracion.horarioMediodia,

              noche:
                configuracion.horarioNoche,
            },

            envio: "Sin cargo",
            costoEnvio: 0,
            radioEntregaKm: 10,

            instagram: "clubdelamasag",
            facebook: "",
            tiktok: "",

            mercadoPago: true,
            pedidosYa: true,

            logo: configuracion.logo,
            banner: configuracion.banner,

            colorPrincipal: "#b71c1c",
            colorSecundario: "#f5f5f5",

            activo: true,

            whatsapp: true,

            diasAbiertos: {
              lunes: true,
              martes: true,
              miercoles: true,
              jueves: true,
              viernes: true,
              sabado: true,
              domingo: true,
            },
          }),
        }
      );
      setBannerConfig(
  datos.bannerConfig || {
    imagen: "",
    titulo: "",
    subtitulo: "",
    textoBoton: "Ver menú",
    destino: "menu",
    urlPersonalizada: "",
    opacidad: 0.55,
    activo: true,
  }
);

setBannerPreview(datos.bannerConfig?.imagen || "");

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            "No se pudo guardar la configuración."
        );
      }

      setMensaje(
        datos.mensaje ||
          "Configuración guardada correctamente."
      );

      setTipoMensaje("exito");
    } catch (error) {
      console.error(
        "Error guardando configuración:",
        error
      );

      setMensaje(
        error.message ||
          "No se pudo guardar la configuración."
      );

      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  }
async function subirLogo() {
  if (!archivoLogo) {
    setMensaje(
      "Seleccioná una imagen para el logo."
    );
    setTipoMensaje("error");
    return;
  }

  setSubiendoLogo(true);
  setMensaje("");
  setTipoMensaje("");

  try {
    const formulario = new FormData();

    formulario.append(
      "imagen",
      archivoLogo
    );

    const respuesta = await apiFetch(
      "/multimedia/logo",
      {
        method: "POST",
        body: formulario,
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.error ||
          "No se pudo subir el logo."
      );
    }

    setConfiguracion((anterior) => ({
      ...anterior,
      logo: datos.url,
    }));

    setArchivoLogo(null);

    setMensaje(
      "Logo subido correctamente. Presioná Guardar cambios para aplicarlo en la web."
    );

    setTipoMensaje("exito");
  } catch (error) {
    console.error(
      "Error subiendo logo:",
      error
    );

    setMensaje(
      error.message ||
        "No se pudo subir el logo."
    );

    setTipoMensaje("error");
  } finally {
    setSubiendoLogo(false);
  }
}

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const respuesta = await apiFetch(
          "/configuracion"
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.error ||
              "No se pudo cargar la configuración."
          );
        }

        setConfiguracion({
          tituloPrincipal:
            datos.textoPrincipal ||
            datos.nombre ||
            "",

          subtitulo:
            datos.textoSecundario || "",

          whatsapp:
            datos.telefono || "",

          direccion:
            datos.direccion || "",

          horarioMediodia:
            datos.horarios?.mediodia || "",

          horarioNoche:
            datos.horarios?.noche || "",

          mensajeWhatsApp:
            datos.mensajeWhatsApp || "",

          mostrarPromociones:
            datos.mostrarPromociones ?? true,

          mostrarDestacados:
            datos.mostrarDestacados ?? true,
            logo: datos.logo || "",
          banner: datos.banner || "",
        });
      } catch (error) {
        console.error(
          "Error cargando configuración:",
          error
        );

        setMensaje(
          error.message ||
            "No se pudo cargar la configuración."
        );

        setTipoMensaje("error");
      } finally {
        setCargando(false);
      }
    }

    cargarConfiguracion();
  }, []);

  const secciones = [
    {
      id: "inicio",
      icono: "🏠",
      texto: "Inicio",
    },
    {
      id: "banner",
      icono: "🖼️",
      texto: "Banner",
    },
    {
      id: "promociones",
      icono: "🎉",
      texto: "Promociones",
    },
    {
      id: "destacados",
      icono: "⭐",
      texto: "Destacados",
    },
    {
      id: "galeria",
      icono: "📸",
      texto: "Galería",
    },
    {
      id: "contacto",
      icono: "📱",
      texto: "Contacto",
    },
    {
      id: "diseno",
      icono: "🎨",
      texto: "Diseño",
    },
    {
      id: "seo",
      icono: "📈",
      texto: "SEO",
    },
  ];

  if (cargando) {
    return (
      <section className="web-manager">
        <h2>Cargando configuración...</h2>
      </section>
    );
  }

  return (
    <section className="web-manager">
      <header className="web-manager-header">
        <div>
          <span className="web-manager-etiqueta">
            WEB MANAGER PRO
          </span>

          <h2>🌐 Sitio Web</h2>

          <p>
            Administrá el contenido visible
            en la web pública.
          </p>
        </div>
        <h2>🖼 Banner Principal</h2>

<div className="card">

  {bannerPreview && (
    <img
      src={bannerPreview}
      alt="Banner"
      style={{
        width: "100%",
        borderRadius: 10,
        marginBottom: 15,
      }}
    />
  )}

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const archivo = e.target.files[0];

      if (!archivo) return;

      setBannerFile(archivo);

      setBannerPreview(
        URL.createObjectURL(archivo)
      );
    }}
  />

</div>

        <button
          type="button"
          className="web-preview-button"
          onClick={() =>
            window.open(
              "https://club-masa-web.vercel.app",
              "_blank",
              "noopener,noreferrer"
            )
          }
        >
          👁️ Ver sitio público
        </button>
      </header>

      <div className="web-manager-layout">
        <aside className="web-manager-menu">
          {secciones.map((seccion) => (
            <button
              key={seccion.id}
              type="button"
              className={
                seccionActiva === seccion.id
                  ? "web-menu-item activo"
                  : "web-menu-item"
              }
              onClick={() =>
                setSeccionActiva(seccion.id)
              }
            >
              <span>{seccion.icono}</span>

              {seccion.texto}
            </button>
          ))}
        </aside>

        <div className="web-manager-content">
          {seccionActiva === "inicio" && (
            <form
              className="web-form"
              onSubmit={
                guardarConfiguracion
              }
            >
              <div className="web-form-header">
                <div>
                  <h3>
                    Información principal
                  </h3>

                  <p>
                    Estos datos aparecerán
                    en la portada del sitio.
                  </p>
                </div>

                <span className="web-status">
                  ● Sitio activo
                </span>
              </div>

              <div className="web-form-grid">
                <label className="web-field">
                  <span>
                    Título principal
                  </span>

                  <input
                    type="text"
                    name="tituloPrincipal"
                    value={
                      configuracion.tituloPrincipal
                    }
                    onChange={cambiarCampo}
                    required
                  />
                </label>

                <label className="web-field">
                  <span>Subtítulo</span>

                  <input
                    type="text"
                    name="subtitulo"
                    value={
                      configuracion.subtitulo
                    }
                    onChange={cambiarCampo}
                  />
                </label>

                <label className="web-field">
                  <span>WhatsApp</span>

                  <input
                    type="text"
                    name="whatsapp"
                    value={
                      configuracion.whatsapp
                    }
                    onChange={cambiarCampo}
                    required
                  />
                </label>

                <label className="web-field">
                  <span>Dirección</span>

                  <input
                    type="text"
                    name="direccion"
                    value={
                      configuracion.direccion
                    }
                    onChange={cambiarCampo}
                  />
                </label>

                <label className="web-field">
                  <span>
                    Horario mediodía
                  </span>

                  <input
                    type="text"
                    name="horarioMediodia"
                    value={
                      configuracion.horarioMediodia
                    }
                    onChange={cambiarCampo}
                  />
                </label>

                <label className="web-field">
                  <span>
                    Horario noche
                  </span>

                  <input
                    type="text"
                    name="horarioNoche"
                    value={
                      configuracion.horarioNoche
                    }
                    onChange={cambiarCampo}
                  />
                </label>
              </div>

              <label className="web-field web-field-full">
                <span>
                  Mensaje automático de
                  WhatsApp
                </span>

                <textarea
                  name="mensajeWhatsApp"
                  value={
                    configuracion.mensajeWhatsApp
                  }
                  onChange={cambiarCampo}
                  rows="4"
                />
              </label>

              <div className="web-switches">
                <label className="web-switch-card">
                  <input
                    type="checkbox"
                    name="mostrarPromociones"
                    checked={
                      configuracion.mostrarPromociones
                    }
                    onChange={cambiarCampo}
                  />

                  <div>
                    <strong>
                      Mostrar promociones
                    </strong>

                    <small>
                      Activa la sección de
                      ofertas en la web.
                    </small>
                  </div>
                </label>

                <label className="web-switch-card">
                  <input
                    type="checkbox"
                    name="mostrarDestacados"
                    checked={
                      configuracion.mostrarDestacados
                    }
                    onChange={cambiarCampo}
                  />

                  <div>
                    <strong>
                      Mostrar destacados
                    </strong>

                    <small>
                      Muestra los productos
                      principales.
                    </small>
                  </div>
                </label>
              </div>

              {mensaje && (
                <div
                  className={
                    tipoMensaje === "error"
                      ? "web-message web-message-error"
                      : "web-message"
                  }
                >
                  {tipoMensaje === "error"
                    ? "❌"
                    : "✅"}{" "}
                  {mensaje}
                </div>
              )}

              <div className="web-form-actions">
                <button
                  type="submit"
                  className="web-save-button"
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando..."
                    : "💾 Guardar cambios"}
                </button>
              </div>
            </form>
          )}
{seccionActiva === "banner" && (
  <div className="web-form">
    <div className="web-form-header">
      <div>
        <h3>Logo del sitio</h3>

        <p>
          Subí el logo que aparecerá en
          la web pública.
        </p>
      </div>
    </div>

    {configuracion.logo && (
      <div className="web-image-preview">
        <img
          src={configuracion.logo}
          alt="Vista previa del logo"
        />
      </div>
    )}

    <label className="web-field web-field-full">
      <span>Seleccionar imagen</span>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(evento) =>
          setArchivoLogo(
            evento.target.files?.[0] ||
              null
          )
        }
      />
    </label>

    <div className="web-form-actions">
      <button
        type="button"
        className="web-save-button"
        onClick={subirLogo}
        disabled={
          subiendoLogo || !archivoLogo
        }
      >
        {subiendoLogo
          ? "Subiendo..."
          : "☁️ Subir logo"}
      </button>
    </div>

    {mensaje && (
      <div
        className={
          tipoMensaje === "error"
            ? "web-message web-message-error"
            : "web-message"
        }
      >
        {tipoMensaje === "error"
          ? "❌"
          : "✅"}{" "}
        {mensaje}
      </div>
    )}
  </div>
)}
          {seccionActiva !== "inicio" &&
            seccionActiva !== "banner" && (
            <div className="web-coming-soon">
              <div className="web-coming-icon">
                {
                  secciones.find(
                    (item) =>
                      item.id ===
                      seccionActiva
                  )?.icono
                }
              </div>

              <h3>
                {
                  secciones.find(
                    (item) =>
                      item.id ===
                      seccionActiva
                  )?.texto
                }
              </h3>

              <p>
                Esta sección será conectada
                en los próximos pasos del
                Web Manager PRO.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default SitioWeb;