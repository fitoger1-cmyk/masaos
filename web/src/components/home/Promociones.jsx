import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  obtenerPromociones,
} from "../../services/api";

function formatearPrecio(valor) {
  const numero = Number(valor || 0);

  return numero.toLocaleString(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }
  );
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

function obtenerTextoEtiqueta(
  etiqueta
) {
  switch (etiqueta) {
    case "nuevo":
      return "⭐ Nuevo";

    case "oferta":
      return "🔥 Oferta";

    case "mas-vendido":
      return "🥇 Más vendido";

    case "limitado":
      return "🎉 Limitado";

    case "2x1":
      return "💥 2x1";

    case "envio-gratis":
      return "🚚 Envío gratis";

    default:
      return "🔥 Promoción";
  }
}

function estaVigente(promocion) {
  const ahora = new Date();

  if (promocion.inicio) {
    const inicio = new Date(
      `${promocion.inicio}T00:00:00`
    );

    if (ahora < inicio) {
      return false;
    }
  }

  if (promocion.fin) {
    const fin = new Date(
      `${promocion.fin}T23:59:59`
    );

    if (ahora > fin) {
      return false;
    }
  }

  return true;
}

function Promociones() {
  const carruselRef = useRef(null);
  const [
    promociones,
    setPromociones,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    cargarPromociones();
  }, []);

  async function cargarPromociones() {
    try {
      setCargando(true);
      setError("");

      const datos =
        await obtenerPromociones();

      const promocionesVisibles =
        datos.filter(
          (promocion) =>
            promocion.activa !== false &&
            promocion.mostrarInicio !==
              false &&
            estaVigente(promocion)
        );

      setPromociones(
        promocionesVisibles
      );
    } catch (err) {
      console.error(
        "Error cargando promociones:",
        err
      );

      setError(
        err.message ||
          "No se pudieron cargar las promociones."
      );
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <section
        id="promociones"
        className="seccion seccion--clara"
      >
        <div className="contenedor">
          <p>
            Cargando promociones...
          </p>
        </div>
      </section>
    );
  }

  if (
    error ||
    promociones.length === 0
  ) {
    return null;
  }

  const tipoPresentacion =
    promociones.length === 1
      ? "una"
      : promociones.length === 2
        ? "dos"
        : "carrusel";

  function desplazarCarrusel(direccion) {
    carruselRef.current?.scrollBy({
      left:
        direccion *
        Math.max(
          carruselRef.current.clientWidth * 0.85,
          280
        ),
      behavior: "smooth",
    });
  }

  return (
    <section
      id="promociones"
      className="seccion seccion--clara"
    >
      <div className="contenedor">
        <div className="encabezado-seccion">
          <div>
            <p className="etiqueta-seccion">
              Ofertas destacadas
            </p>

            <h2>
              Promociones para aprovechar
            </h2>
          </div>

          {tipoPresentacion === "carrusel" && (
            <div className="promociones-web__controles">
              <button
                type="button"
                onClick={() => desplazarCarrusel(-1)}
                aria-label="Promoción anterior"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => desplazarCarrusel(1)}
                aria-label="Promoción siguiente"
              >
                →
              </button>
            </div>
          )}
        </div>

        <div
          ref={carruselRef}
          className={`promociones-web__grilla promociones-web__grilla--${tipoPresentacion}`}
        >
          {promociones.map(
            (promocion) => {
              const descuento =
                calcularDescuento(
                  promocion
                    .precioAnterior,
                  promocion
                    .precioPromocional
                );

              return (
                <article
                  key={promocion.id}
                  className="promociones-web__card"
                >
                  <div className="promociones-web__imagen-contenedor">
                    {promocion.imagen ? (
                      <img
                        src={
                          promocion.imagen
                        }
                        alt={
                          promocion.nombre
                        }
                        className="promociones-web__imagen"
                      />
                    ) : (
                      <div className="promociones-web__sin-imagen">
                        Sin imagen
                      </div>
                    )}

                    <div className="promociones-web__badges">
                      <span className="promociones-web__etiqueta">
                        {obtenerTextoEtiqueta(
                          promocion.etiqueta
                        )}
                      </span>

                      {descuento > 0 && (
                        <span className="promociones-web__descuento">
                          -{descuento}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="promociones-web__contenido">
                    <h3>
                      {promocion.nombre}
                    </h3>

                    {promocion.descripcion && (
                      <p>
                        {
                          promocion.descripcion
                        }
                      </p>
                    )}

                    <div className="promociones-web__precios">
                      {Number(
                        promocion
                          .precioAnterior
                      ) > 0 && (
                        <span className="promociones-web__precio-anterior">
                          {formatearPrecio(
                            promocion
                              .precioAnterior
                          )}
                        </span>
                      )}

                      <strong className="promociones-web__precio-actual">
                        {formatearPrecio(
                          promocion
                            .precioPromocional
                        )}
                      </strong>
                    </div>

                    <a
                      href="#menu"
                      className="boton promociones-web__boton"
                    >
                      Pedir ahora
                    </a>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}

export default Promociones;
