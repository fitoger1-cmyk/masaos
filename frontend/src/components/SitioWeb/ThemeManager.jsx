const PALETAS = [
  {
    id: "pizzeria",
    nombre: "🍕 Pizzería",
    principal: "#b71c1c",
    secundario: "#f5f0e8",
  },
  {
    id: "italiano",
    nombre: "🇮🇹 Italiano",
    principal: "#b71c1c",
    secundario: "#f7f3e8",
  },
  {
    id: "elegante",
    nombre: "⚫ Elegante",
    principal: "#1f1f1f",
    secundario: "#d4af37",
  },
  {
    id: "natural",
    nombre: "🌿 Natural",
    principal: "#4f6f52",
    secundario: "#efe6d2",
  },
  {
    id: "moderno",
    nombre: "🌊 Moderno",
    principal: "#1f4e8c",
    secundario: "#edf4fb",
  },
  {
    id: "premium",
    nombre: "🟣 Premium",
    principal: "#4b2142",
    secundario: "#ead7e6",
  },
];

function ThemeManager({
  configuracion,
  actualizarWeb,
}) {
  const web = configuracion.web || {};

  const colorPrincipal =
    web.colorPrincipal || "#b71c1c";

  const colorSecundario =
    web.colorSecundario || "#f5f5f5";

  function aplicarPaleta(paleta) {
    actualizarWeb({
      colorPrincipal: paleta.principal,
      colorSecundario: paleta.secundario,
    });
  }

  function sorprender() {
    const paleta =
      PALETAS[
        Math.floor(
          Math.random() * PALETAS.length
        )
      ];

    aplicarPaleta(paleta);
  }

  return (
    <article className="sitio-web__tarjeta">
      <header className="sitio-web__panel-header">
        <h2>🎨 Apariencia del sitio</h2>

        <p>
          Personalizá los colores principales
          de la web.
        </p>
      </header>

      <div className="sitio-web__theme-grid">
        <label>
          <span>Color principal</span>

          <div className="sitio-web__color-control">
            <input
              type="color"
              value={colorPrincipal}
              onChange={(e) =>
                actualizarWeb({
                  colorPrincipal:
                    e.target.value,
                })
              }
            />

            <input
              type="text"
              value={colorPrincipal}
              onChange={(e) =>
                actualizarWeb({
                  colorPrincipal:
                    e.target.value,
                })
              }
            />
          </div>
        </label>

        <label>
          <span>Color secundario</span>

          <div className="sitio-web__color-control">
            <input
              type="color"
              value={colorSecundario}
              onChange={(e) =>
                actualizarWeb({
                  colorSecundario:
                    e.target.value,
                })
              }
            />

            <input
              type="text"
              value={colorSecundario}
              onChange={(e) =>
                actualizarWeb({
                  colorSecundario:
                    e.target.value,
                })
              }
            />
          </div>
        </label>
      </div>

      <div className="sitio-web__paletas">
        <div className="sitio-web__paletas-header">
          <div>
            <strong>Paletas rápidas</strong>

            <p>
              Aplicá una combinación lista
              con un clic.
            </p>
          </div>

          <button
            type="button"
            onClick={sorprender}
          >
            🎲 Sorpréndeme
          </button>
        </div>

        <div className="sitio-web__paletas-grid">
          {PALETAS.map((paleta) => (
            <button
              key={paleta.id}
              type="button"
              className="sitio-web__paleta"
              onClick={() =>
                aplicarPaleta(paleta)
              }
            >
              <span className="sitio-web__paleta-colores">
                <i
                  style={{
                    background:
                      paleta.principal,
                  }}
                />

                <i
                  style={{
                    background:
                      paleta.secundario,
                  }}
                />
              </span>

              <strong>
                {paleta.nombre}
              </strong>
            </button>
          ))}
        </div>
      </div>

      <div
        className="sitio-web__theme-preview"
        style={{
          "--preview-principal":
            colorPrincipal,

          "--preview-secundario":
            colorSecundario,
        }}
      >
        <div className="sitio-web__theme-preview-header">
          Vista previa de colores
        </div>

        <button type="button">
          Botón principal
        </button>

        <span>
          Fondo secundario
        </span>
      </div>
    </article>
  );
}

export default ThemeManager;