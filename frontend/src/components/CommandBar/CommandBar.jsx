import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import commandRegistry from "../../data/commandRegistry";
import commandActions from "../../data/commandActions";
import { resolverComando } from "../../utils/commandResolver";
import { preguntarMasaIA } from "../../services/masaIACommandService";

import "./command.css";

function CommandBar({ onNavigate, onAction }) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0);

  const [consultandoIA, setConsultandoIA] = useState(false);
  const [respuestaIA, setRespuestaIA] = useState("");
  const [errorIA, setErrorIA] = useState("");

  const itemsRef = useRef([]);

  const comandos = useMemo(
    () => [...commandRegistry, ...commandActions],
    []
  );

  function normalizarTexto(texto = "") {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  const busquedaNormalizada = normalizarTexto(busqueda);

  const resultados = useMemo(() => {
    if (!busquedaNormalizada) {
      return comandos;
    }

    return comandos.filter((comando) => {
      const textoComando = normalizarTexto(
        comando.texto || comando.nombre || ""
      );

      const coincideTexto = textoComando.includes(
        busquedaNormalizada
      );

      const coincideKeyword = (comando.keywords || []).some(
        (keyword) =>
          normalizarTexto(keyword).includes(busquedaNormalizada)
      );

      return coincideTexto || coincideKeyword;
    });
  }, [busquedaNormalizada, comandos]);

  const resultadoResolver = resolverComando(busqueda);

  const cerrarCommandBar = useCallback(() => {
    setAbierto(false);
    setBusqueda("");
    setIndiceSeleccionado(0);
    setConsultandoIA(false);
    setRespuestaIA("");
    setErrorIA("");
    itemsRef.current = [];
  }, []);

  const navegar = useCallback(
    (pantalla) => {
      if (pantalla && typeof onNavigate === "function") {
        onNavigate(pantalla);
      }
    },
    [onNavigate]
  );

  const ejecutarAccion = useCallback(
    (accion) => {
      if (!accion) {
        return;
      }

      if (typeof onAction === "function") {
        onAction(accion);
        return;
      }

      const pantallasPorAccion = {
        nuevoCliente: "clientes",
        nuevaCompra: "compras",
        nuevoProducto: "productos",
        abrirCaja: "caja",
      };

      const pantallaDestino = pantallasPorAccion[accion];

      if (pantallaDestino) {
        navegar(pantallaDestino);
      }
    },
    [navegar, onAction]
  );

  const ejecutarComando = useCallback(
    (comando) => {
      if (!comando) {
        return;
      }

      if (comando.tipo === "accion" || comando.accion) {
        ejecutarAccion(comando.accion);
        cerrarCommandBar();
        return;
      }

      if (comando.pantalla) {
        navegar(comando.pantalla);
        cerrarCommandBar();
      }
    },
    [cerrarCommandBar, ejecutarAccion, navegar]
  );

  const consultarMasaIA = useCallback(async (pregunta) => {
    const preguntaLimpia = String(pregunta || "").trim();

    if (!preguntaLimpia || consultandoIA) {
      return;
    }

    try {
      setConsultandoIA(true);
      setRespuestaIA("");
      setErrorIA("");

      const datos = await preguntarMasaIA(preguntaLimpia);

      const respuesta =
        datos?.respuesta ||
        datos?.mensaje ||
        datos?.resultado ||
        datos?.answer ||
        datos?.data?.respuesta ||
        "MasaIA procesó la consulta, pero no devolvió una respuesta visible.";

      setRespuestaIA(
        typeof respuesta === "string"
          ? respuesta
          : JSON.stringify(respuesta, null, 2)
      );
    } catch (error) {
      console.error("Error consultando MasaIA:", error);

      setErrorIA(
        error?.message ||
          "No fue posible conectarse con MasaIA."
      );
    } finally {
      setConsultandoIA(false);
    }
  }, [consultandoIA]);

  const ejecutarBusqueda = useCallback(() => {
    if (consultandoIA) {
      return;
    }

    if (resultadoResolver.tipo === "vacio") {
      return;
    }

    if (resultadoResolver.tipo === "ia") {
      consultarMasaIA(resultadoResolver.pregunta);
      return;
    }

    const comandoSeleccionado =
      resultados[indiceSeleccionado];

    ejecutarComando(comandoSeleccionado);
  }, [
    consultarMasaIA,
    consultandoIA,
    ejecutarComando,
    indiceSeleccionado,
    resultadoResolver,
    resultados,
  ]);

  useEffect(() => {
    function manejarTeclado(evento) {
      const presionoCommandBar =
        (evento.ctrlKey || evento.metaKey) &&
        evento.key.toLowerCase() === "k";

      if (presionoCommandBar) {
        evento.preventDefault();

        setAbierto((estadoAnterior) => {
          const nuevoEstado = !estadoAnterior;

          if (!nuevoEstado) {
            setBusqueda("");
            setIndiceSeleccionado(0);
            setConsultandoIA(false);
            setRespuestaIA("");
            setErrorIA("");
          }

          return nuevoEstado;
        });

        return;
      }

      if (!abierto) {
        return;
      }

      if (evento.key === "Escape") {
        evento.preventDefault();
        cerrarCommandBar();
        return;
      }

      if (evento.key === "ArrowDown") {
        evento.preventDefault();

        setIndiceSeleccionado((indiceAnterior) => {
          if (resultados.length === 0) {
            return 0;
          }

          return (indiceAnterior + 1) % resultados.length;
        });

        return;
      }

      if (evento.key === "ArrowUp") {
        evento.preventDefault();

        setIndiceSeleccionado((indiceAnterior) => {
          if (resultados.length === 0) {
            return 0;
          }

          return (
            (indiceAnterior - 1 + resultados.length) %
            resultados.length
          );
        });

        return;
      }

      if (evento.key === "Enter") {
        evento.preventDefault();
        ejecutarBusqueda();
      }
    }

    window.addEventListener("keydown", manejarTeclado);

    return () => {
      window.removeEventListener("keydown", manejarTeclado);
    };
  }, [
    abierto,
    cerrarCommandBar,
    ejecutarBusqueda,
    resultados.length,
  ]);

  useEffect(() => {
    setIndiceSeleccionado(0);
    setRespuestaIA("");
    setErrorIA("");
  }, [busqueda]);

  useEffect(() => {
    if (resultados.length === 0) {
      setIndiceSeleccionado(0);
      return;
    }

    if (indiceSeleccionado >= resultados.length) {
      setIndiceSeleccionado(0);
    }
  }, [indiceSeleccionado, resultados.length]);

  useEffect(() => {
    const elementoSeleccionado =
      itemsRef.current[indiceSeleccionado];

    if (elementoSeleccionado) {
      elementoSeleccionado.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [indiceSeleccionado]);

  if (!abierto) {
    return null;
  }

  const esConsultaIA = resultadoResolver.tipo === "ia";

  return (
    <div
      className="command-overlay"
      onClick={cerrarCommandBar}
    >
      <div
        className="command-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Barra de comandos de MasaOS"
        onClick={(evento) => evento.stopPropagation()}
      >
        <input
          autoFocus
          type="text"
          value={busqueda}
          onChange={(evento) =>
            setBusqueda(evento.target.value)
          }
          placeholder="🔍 Buscar módulos, acciones o preguntarle a MasaIA..."
          aria-label="Buscar comando"
          disabled={consultandoIA}
        />

        <p className="command-help">
          ↑ ↓ para moverte · Enter para abrir · ESC para cerrar
        </p>

        <div className="command-list">
          {resultados.map((comando, indice) => {
            const seleccionado =
              indice === indiceSeleccionado;

            return (
              <button
                key={`${comando.tipo}-${comando.texto}`}
                ref={(elemento) => {
                  itemsRef.current[indice] = elemento;
                }}
                type="button"
                className={
                  seleccionado
                    ? "command-item seleccionado"
                    : "command-item"
                }
                onMouseEnter={() =>
                  setIndiceSeleccionado(indice)
                }
                onClick={() => ejecutarComando(comando)}
              >
                <span className="command-item-icon">
                  {comando.icono}
                </span>

                <span>{comando.texto}</span>

                <span className="command-item-shortcut">
                  {seleccionado ? "↵ ENTER" : "›"}
                </span>
              </button>
            );
          })}

          {resultados.length === 0 &&
            !respuestaIA &&
            !errorIA && (
              <button
                type="button"
                className={
                  esConsultaIA
                    ? "sin-resultados consulta-ia"
                    : "sin-resultados"
                }
                onClick={ejecutarBusqueda}
                disabled={consultandoIA}
              >
                <span className="sin-resultados-icono">
                  {consultandoIA ? "⏳" : "🤖"}
                </span>

                <span>
                  <strong>
                    {consultandoIA
                      ? "MasaIA está analizando..."
                      : esConsultaIA
                        ? "Preguntar a MasaIA"
                        : "No encontré un comando"}
                  </strong>

                  <p>
                    {consultandoIA
                      ? "Consultando ventas, stock y producción."
                      : esConsultaIA
                        ? `Presioná Enter para consultar: “${busqueda}”`
                        : `No hay coincidencias para “${busqueda}”.`}
                  </p>
                </span>
              </button>
            )}

          {respuestaIA && (
            <div className="masaia-respuesta">
              <div className="masaia-respuesta-header">
                <span className="masaia-respuesta-icono">
                  🤖
                </span>

                <div>
                  <strong>MasaIA</strong>
                  <small>Asistente inteligente de MasaOS</small>
                </div>
              </div>

              <div className="masaia-respuesta-contenido">
                {respuestaIA}
              </div>

              <div className="masaia-respuesta-footer">
                Presioná ESC para cerrar
              </div>
            </div>
          )}

          {errorIA && (
            <div className="masaia-error">
              <strong>⚠️ No se pudo consultar MasaIA</strong>
              <p>{errorIA}</p>

              <button
                type="button"
                onClick={() =>
                  consultarMasaIA(resultadoResolver.pregunta)
                }
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandBar;