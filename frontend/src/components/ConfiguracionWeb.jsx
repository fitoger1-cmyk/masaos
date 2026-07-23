import { useEffect, useState } from "react";

import {
  API_URL,
  SOCKET_URL,
} from "../config/api";

const configuracionInicial = {
  nombre: "",
  telefono: "",
  whatsapp: true,
  instagram: "",
  facebook: "",
  tiktok: "",
  direccion: "",
  envio: "",
  costoEnvio: 0,
  radioEntregaKm: 0,
  textoPrincipal: "",
  textoSecundario: "",
  horarios: {
    mediodia: "",
    noche: "",
  },
  diasAbiertos: {
    lunes: true,
    martes: true,
    miercoles: true,
    jueves: true,
    viernes: true,
    sabado: true,
    domingo: true,
  },
  mercadoPago: true,
  pedidosYa: true,
  logo: "",
  banner: "",
  colorPrincipal: "#b71c1c",
  colorSecundario: "#f5f5f5",
  activo: true,
};

const diasSemana = [
  { clave: "lunes", nombre: "Lunes" },
  { clave: "martes", nombre: "Martes" },
  { clave: "miercoles", nombre: "Miércoles" },
  { clave: "jueves", nombre: "Jueves" },
  { clave: "viernes", nombre: "Viernes" },
  { clave: "sabado", nombre: "Sábado" },
  { clave: "domingo", nombre: "Domingo" },
];

function ConfiguracionWeb() {
  const [configuracion, setConfiguracion] = useState(
    configuracionInicial
  );

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [subiendoBanner, setSubiendoBanner] = useState(false);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  function normalizarConfiguracion(datos = {}) {
    return {
      ...configuracionInicial,
      ...datos,
      horarios: {
        ...configuracionInicial.horarios,
        ...(datos.horarios || {}),
      },
      diasAbiertos: {
        ...configuracionInicial.diasAbiertos,
        ...(datos.diasAbiertos || {}),
      },
    };
  }

  function obtenerUrlImagen(imagen) {
    if (!imagen) {
      return "";
    }

    if (
      imagen.startsWith("http://") ||
      imagen.startsWith("https://") ||
      imagen.startsWith("blob:")
    ) {
      return imagen;
    }

    return `${SOCKET_URL}${
      imagen.startsWith("/") ? imagen : `/${imagen}`
    }`;
  }

  async function cargarConfiguracion() {
    try {
      setCargando(true);
      setError("");
      setMensaje("");

      const respuesta = await fetch(
        `${API_URL}/configuracion`
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudo cargar la configuración."
        );
      }

      const datos = await respuesta.json();
      setConfiguracion(normalizarConfiguracion(datos));
    } catch (errorCarga) {
      console.error(
        "Error cargando configuración:",
        errorCarga
      );

      setError(
        errorCarga.message ||
          "Ocurrió un error al cargar la configuración."
      );
    } finally {
      setCargando(false);
    }
  }

  function actualizarCampo(evento) {
    const { name, value, type, checked } =
      evento.target;

    setConfiguracion((anterior) => ({
      ...anterior,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function actualizarNumero(evento) {
    const { name, value } = evento.target;

    setConfiguracion((anterior) => ({
      ...anterior,
      [name]:
        value === ""
          ? ""
          : Number(value),
    }));
  }

  function actualizarHorario(evento) {
    const { name, value } = evento.target;

    setConfiguracion((anterior) => ({
      ...anterior,
      horarios: {
        ...anterior.horarios,
        [name]: value,
      },
    }));
  }

  function actualizarDia(claveDia) {
    setConfiguracion((anterior) => ({
      ...anterior,
      diasAbiertos: {
        ...anterior.diasAbiertos,
        [claveDia]:
          !anterior.diasAbiertos[claveDia],
      },
    }));
  }

  async function subirImagen(archivo, tipo) {
    if (!archivo) {
      return;
    }

    try {
      if (tipo === "logo") {
        setSubiendoLogo(true);
      } else {
        setSubiendoBanner(true);
      }

      setMensaje("");
      setError("");

      const formData = new FormData();
      formData.append("imagen", archivo);

      const respuesta = await fetch(
        `${API_URL}/multimedia/${tipo}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            "No se pudo subir la imagen."
        );
      }

      if (!datos.url) {
        throw new Error(
          "El servidor no devolvió la URL de la imagen."
        );
      }

      setConfiguracion((anterior) => ({
        ...anterior,
        [tipo]: datos.url,
      }));

      setMensaje(
        `${
          tipo === "logo"
            ? "Logo"
            : "Banner"
        } subido correctamente. Ahora guardá la configuración.`
      );
    } catch (errorSubida) {
      console.error(
        "Error subiendo imagen:",
        errorSubida
      );

      setError(
        errorSubida.message ||
          "Ocurrió un error al subir la imagen."
      );
    } finally {
      if (tipo === "logo") {
        setSubiendoLogo(false);
      } else {
        setSubiendoBanner(false);
      }
    }
  }

  async function guardarConfiguracion(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const datosAEnviar = {
        ...configuracion,
        costoEnvio:
          Number(configuracion.costoEnvio) || 0,
        radioEntregaKm:
          Number(configuracion.radioEntregaKm) || 0,
      };

      const respuesta = await fetch(
        `${API_URL}/configuracion`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosAEnviar),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            "No se pudo guardar la configuración."
        );
      }

      setConfiguracion(
        normalizarConfiguracion(
          datos.configuracion || datos
        )
      );

      setMensaje(
        "Configuración guardada correctamente."
      );
    } catch (errorGuardado) {
      console.error(
        "Error guardando configuración:",
        errorGuardado
      );

      setError(
        errorGuardado.message ||
          "Ocurrió un error al guardar."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <section className="section">
        <h2>🌐 Configuración Web</h2>
        <p>Cargando configuración...</p>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="configuracion-web-encabezado">
        <div>
          <h2>🌐 Configuración Web</h2>

          <p className="texto-secundario">
            Administrá la información que se
            mostrará en la página pública.
          </p>
        </div>

        <div
          className={
            configuracion.activo
              ? "estado-web estado-web-activa"
              : "estado-web estado-web-inactiva"
          }
        >
          {configuracion.activo
            ? "Web activa"
            : "Web pausada"}
        </div>
      </div>

      {mensaje && (
        <div className="mensaje-exito">
          ✅ {mensaje}
        </div>
      )}

      {error && (
        <div className="mensaje-error">
          ⚠️ {error}
        </div>
      )}

      <form
        onSubmit={guardarConfiguracion}
        className="configuracion-web-formulario"
      >
        <div className="configuracion-bloque">
          <h3>🏪 Datos del negocio</h3>

          <div className="configuracion-grid">
            <label>
              Nombre del negocio
              <input
                type="text"
                name="nombre"
                value={configuracion.nombre}
                onChange={actualizarCampo}
                placeholder="El Club de la Masa G"
                required
              />
            </label>

            <label>
              Teléfono
              <input
                type="text"
                name="telefono"
                value={configuracion.telefono}
                onChange={actualizarCampo}
                placeholder="541140480762"
                required
              />
            </label>

            <label className="campo-completo">
              Dirección
              <input
                type="text"
                name="direccion"
                value={configuracion.direccion}
                onChange={actualizarCampo}
                placeholder="Pilar, Buenos Aires"
              />
            </label>

            <label>
              Tipo de envío
              <input
                type="text"
                name="envio"
                value={configuracion.envio}
                onChange={actualizarCampo}
                placeholder="Sin cargo"
              />
            </label>

            <label>
              Costo de envío
              <input
                type="number"
                name="costoEnvio"
                value={configuracion.costoEnvio}
                onChange={actualizarNumero}
                min="0"
                step="1"
              />
            </label>

            <label>
              Radio de entrega
              <div className="input-con-unidad">
                <input
                  type="number"
                  name="radioEntregaKm"
                  value={
                    configuracion.radioEntregaKm
                  }
                  onChange={actualizarNumero}
                  min="0"
                  step="1"
                />

                <span>km</span>
              </div>
            </label>
          </div>
        </div>

        <div className="configuracion-bloque">
          <h3>📣 Textos principales</h3>

          <div className="configuracion-grid">
            <label className="campo-completo">
              Título principal
              <input
                type="text"
                name="textoPrincipal"
                value={
                  configuracion.textoPrincipal
                }
                onChange={actualizarCampo}
                placeholder="Las mejores pizzas de Pilar"
              />
            </label>

            <label className="campo-completo">
              Descripción principal
              <textarea
                name="textoSecundario"
                value={
                  configuracion.textoSecundario
                }
                onChange={actualizarCampo}
                rows="4"
                placeholder="Pizzas artesanales, focaccias y postres..."
              />
            </label>
          </div>
        </div>

        <div className="configuracion-bloque">
          <h3>🕐 Horarios</h3>

          <div className="configuracion-grid">
            <label>
              Horario del mediodía
              <input
                type="text"
                name="mediodia"
                value={
                  configuracion.horarios.mediodia
                }
                onChange={actualizarHorario}
                placeholder="11:00 - 16:00"
              />
            </label>

            <label>
              Horario de la noche
              <input
                type="text"
                name="noche"
                value={
                  configuracion.horarios.noche
                }
                onChange={actualizarHorario}
                placeholder="19:00 - 23:00"
              />
            </label>
          </div>

          <div className="dias-semana">
            {diasSemana.map((dia) => (
              <button
                key={dia.clave}
                type="button"
                className={
                  configuracion.diasAbiertos[
                    dia.clave
                  ]
                    ? "dia-abierto"
                    : "dia-cerrado"
                }
                onClick={() =>
                  actualizarDia(dia.clave)
                }
              >
                <span>{dia.nombre}</span>

                <strong>
                  {configuracion.diasAbiertos[
                    dia.clave
                  ]
                    ? "Abierto"
                    : "Cerrado"}
                </strong>
              </button>
            ))}
          </div>
        </div>

        <div className="configuracion-bloque">
          <h3>📱 Redes y canales de venta</h3>

          <div className="configuracion-grid">
            <label>
              Instagram
              <input
                type="text"
                name="instagram"
                value={configuracion.instagram}
                onChange={actualizarCampo}
                placeholder="clubdelamasag"
              />
            </label>

            <label>
              Facebook
              <input
                type="text"
                name="facebook"
                value={configuracion.facebook}
                onChange={actualizarCampo}
                placeholder="Página de Facebook"
              />
            </label>

            <label>
              TikTok
              <input
                type="text"
                name="tiktok"
                value={configuracion.tiktok}
                onChange={actualizarCampo}
                placeholder="Usuario de TikTok"
              />
            </label>
          </div>

          <div className="configuracion-opciones">
            <label className="opcion-switch">
              <input
                type="checkbox"
                name="whatsapp"
                checked={configuracion.whatsapp}
                onChange={actualizarCampo}
              />

              <span>WhatsApp habilitado</span>
            </label>

            <label className="opcion-switch">
              <input
                type="checkbox"
                name="mercadoPago"
                checked={
                  configuracion.mercadoPago
                }
                onChange={actualizarCampo}
              />

              <span>
                Mercado Pago habilitado
              </span>
            </label>

            <label className="opcion-switch">
              <input
                type="checkbox"
                name="pedidosYa"
                checked={configuracion.pedidosYa}
                onChange={actualizarCampo}
              />

              <span>PedidosYa habilitado</span>
            </label>
          </div>
        </div>

        <div className="configuracion-bloque">
          <h3>🎨 Apariencia de la web</h3>

          <div className="configuracion-grid">
            <label className="campo-completo">
              <strong>Logo</strong>

              {configuracion.logo && (
                <img
                  src={obtenerUrlImagen(
                    configuracion.logo
                  )}
                  alt="Logo"
                  style={{
                    width: 180,
                    display: "block",
                    marginTop: 10,
                    marginBottom: 10,
                    borderRadius: 8,
                  }}
                />
              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={subiendoLogo}
                onChange={(evento) =>
                  subirImagen(
                    evento.target.files?.[0],
                    "logo"
                  )
                }
              />

              {subiendoLogo && (
                <p>Subiendo logo...</p>
              )}
            </label>

            <label className="campo-completo">
              <strong>Banner principal</strong>

              {configuracion.banner && (
                <img
                  src={obtenerUrlImagen(
                    configuracion.banner
                  )}
                  alt="Banner"
                  style={{
                    width: "100%",
                    maxWidth: 500,
                    display: "block",
                    marginTop: 10,
                    marginBottom: 10,
                    borderRadius: 8,
                  }}
                />
              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={subiendoBanner}
                onChange={(evento) =>
                  subirImagen(
                    evento.target.files?.[0],
                    "banner"
                  )
                }
              />

              {subiendoBanner && (
                <p>Subiendo banner...</p>
              )}
            </label>

            <label>
              Color principal
              <div className="selector-color">
                <input
                  type="color"
                  name="colorPrincipal"
                  value={
                    configuracion.colorPrincipal ||
                    "#b71c1c"
                  }
                  onChange={actualizarCampo}
                />

                <input
                  type="text"
                  name="colorPrincipal"
                  value={
                    configuracion.colorPrincipal
                  }
                  onChange={actualizarCampo}
                />
              </div>
            </label>

            <label>
              Color secundario
              <div className="selector-color">
                <input
                  type="color"
                  name="colorSecundario"
                  value={
                    configuracion.colorSecundario ||
                    "#f5f5f5"
                  }
                  onChange={actualizarCampo}
                />

                <input
                  type="text"
                  name="colorSecundario"
                  value={
                    configuracion.colorSecundario
                  }
                  onChange={actualizarCampo}
                />
              </div>
            </label>
          </div>
        </div>

        <div className="configuracion-bloque">
          <h3>⚙️ Estado de la página</h3>

          <label className="opcion-switch opcion-principal">
            <input
              type="checkbox"
              name="activo"
              checked={configuracion.activo}
              onChange={actualizarCampo}
            />

            <span>
              Permitir que la página web reciba
              pedidos
            </span>
          </label>

          {!configuracion.activo && (
            <p className="advertencia-web">
              ⚠️ La página quedará visible, pero
              podremos mostrarla como cerrada y
              bloquear nuevos pedidos.
            </p>
          )}
        </div>

        <div className="configuracion-acciones">
          <button
            type="button"
            className="btn-secundario"
            onClick={cargarConfiguracion}
            disabled={guardando}
          >
            Restaurar datos
          </button>

          <button
            type="submit"
            className="btn-primario"
            disabled={
              guardando ||
              subiendoLogo ||
              subiendoBanner
            }
          >
            {guardando
              ? "Guardando..."
              : "Guardar configuración"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ConfiguracionWeb;