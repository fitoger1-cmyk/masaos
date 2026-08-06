import { useState } from "react";

function HeroPreview({
  bannerConfig,
  nombreNegocio,
  horarios,
  envio,
  colorPrincipal,
  colorSecundario,
}) {
  const [modoVista, setModoVista] =
    useState("desktop");

  const opacidad = Number(
    bannerConfig?.opacidad ?? 0.55
  );

  const imagen =
    bannerConfig?.imagen || "";

  const estiloFondo = imagen
    ? {
        backgroundImage: `
          linear-gradient(
            90deg,
            rgba(
              18,
              12,
              9,
              ${Math.min(
                opacidad + 0.2,
                0.98
              )}
            ) 0%,
            rgba(
              18,
              12,
              9,
              ${opacidad}
            ) 55%,
            rgba(
              18,
              12,
              9,
              ${Math.max(
                opacidad - 0.2,
                0
              )}
            ) 100%
          ),
          url("${imagen}")
        `,
      }
    : {};

  return (
    <aside
  className="hero-preview"
  style={{
    "--hero-color-principal":
      colorPrincipal || "#b71c1c",

    "--hero-color-secundario":
      colorSecundario || "#f5f5f5",
  }}
>
      <div className="hero-preview__encabezado">
        <div>
          <span className="hero-preview__estado">
            Vista previa en vivo
          </span>

          <strong>
            Así se verá en la web
          </strong>
        </div>

        <div className="hero-preview__controles">
          <div className="hero-preview__selector">
            <button
              type="button"
              className={
                modoVista === "desktop"
                  ? "activo"
                  : ""
              }
              onClick={() =>
                setModoVista("desktop")
              }
            >
              🖥 Desktop
            </button>

            <button
              type="button"
              className={
                modoVista === "mobile"
                  ? "activo"
                  : ""
              }
              onClick={() =>
                setModoVista("mobile")
              }
            >
              📱 Mobile
            </button>
          </div>

          <span
            className={
              bannerConfig?.activo !== false
                ? "hero-preview__activo"
                : "hero-preview__inactivo"
            }
          >
            {bannerConfig?.activo !== false
              ? "Publicado"
              : "Oculto"}
          </span>
        </div>
      </div>

      <div className="hero-preview__lienzo">
        <div
          className={`
            hero-preview__pantalla
            hero-preview__pantalla--${modoVista}
          `}
          style={estiloFondo}
        >
          {!imagen && (
            <div className="hero-preview__sin-imagen">
              Subí una imagen para visualizar
              el banner.
            </div>
          )}

          <div className="hero-preview__contenido">
            <p className="hero-preview__etiqueta">
              Pizzas artesanales · Pilar
            </p>

            <h2>
              {bannerConfig?.titulo ||
                nombreNegocio ||
                "Título principal"}
            </h2>

            <p className="hero-preview__descripcion">
              {bannerConfig?.subtitulo ||
                "Escribí aquí el subtítulo del banner."}
            </p>

            <div className="hero-preview__acciones">
              <button type="button">
                {bannerConfig?.textoBoton ||
                  "Ver menú"}
              </button>

              <button
                type="button"
                className="hero-preview__boton-secundario"
              >
                WhatsApp para consultas
              </button>
            </div>

            <div className="hero-preview__datos">
              <div>
                <strong>
                  {horarios?.mediodia ||
                    "11:00 - 16:00"}
                </strong>

                <span>Mediodía</span>
              </div>

              <div>
                <strong>
                  {horarios?.noche ||
                    "19:00 - 23:00"}
                </strong>

                <span>Noche</span>
              </div>

              <div>
                <strong>
                  {(envio || "Sin cargo") === "Sin cargo"
                    ? "Envíos sin cargo"
                    : envio}
                </strong>

                <span>En Pilar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default HeroPreview;
