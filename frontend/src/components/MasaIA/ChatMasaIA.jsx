    import { useEffect, useRef, useState } from "react";

import PreguntasRapidas from "./PreguntasRapidas";
import RespuestaIA from "./RespuestaIA";
import {
  preguntarMasaIAApi,
} from "./masaIAApi";

import "./MasaIAChat.css";

function crearInicio() {
  return {
    id: "inicio",
    autor: "ia",
    fecha: new Date().toISOString(),
    respuesta: {
      tipo: "general",
      titulo: "Asistente MasaIA",
      mensaje:
        "Puedo ayudarte con ventas, productos, rentabilidad, clientes, stock y delivery.",
      datos: [],
    },
  };
}

function ChatMasaIA() {
  const [pregunta, setPregunta] =
    useState("");

  const [historial, setHistorial] =
    useState([crearInicio()]);

  const [consultando, setConsultando] =
    useState(false);

  const [etapaAnalisis, setEtapaAnalisis] =
    useState("");

  const [error, setError] =
    useState("");

  const finalRef = useRef(null);

  useEffect(() => {
    finalRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    historial,
    consultando,
    etapaAnalisis,
  ]);

  useEffect(() => {
    if (!consultando) {
      setEtapaAnalisis("");
      return undefined;
    }

    const etapas = [
      "Analizando ventas...",
      "Revisando stock y clientes...",
      "Preparando la respuesta...",
    ];

    let indice = 0;

    setEtapaAnalisis(etapas[indice]);

    const intervalo = setInterval(() => {
      indice =
        (indice + 1) % etapas.length;

      setEtapaAnalisis(
        etapas[indice]
      );
    }, 900);

    return () =>
      clearInterval(intervalo);
  }, [consultando]);

  async function preguntarMasaIA(
    textoPregunta = pregunta
  ) {
    const texto = String(
      textoPregunta || ""
    ).trim();

    if (!texto || consultando) {
      return;
    }

    setHistorial((actual) => [
      ...actual,
      {
        id: `usuario-${Date.now()}`,
        autor: "usuario",
        texto,
        fecha: new Date().toISOString(),
      },
    ]);

    setPregunta("");
    setConsultando(true);
    setError("");

    try {
      const respuesta =
        await preguntarMasaIAApi(
          texto
        );

      setHistorial((actual) => [
        ...actual,
        {
          id: `ia-${Date.now()}`,
          autor: "ia",
          fecha:
            new Date().toISOString(),
          respuesta,
        },
      ]);
    } catch (errorConsulta) {
      console.error(
        "Error consultando MasaIA:",
        errorConsulta
      );

      setError(
        errorConsulta.message ||
          "No se pudo consultar MasaIA."
      );

      setHistorial((actual) => [
        ...actual,
        {
          id: `ia-error-${Date.now()}`,
          autor: "ia",
          fecha:
            new Date().toISOString(),
          respuesta: {
            tipo: "error",
            titulo:
              "No pude responder",
            mensaje:
              "Verificá que el backend esté encendido e intentá nuevamente.",
            datos: [],
          },
        },
      ]);
    } finally {
      setConsultando(false);
    }
  }

  function enviar(evento) {
    evento.preventDefault();
    preguntarMasaIA();
  }

  function limpiarConversacion() {
    setHistorial([crearInicio()]);
    setPregunta("");
    setError("");
  }

  return (
    <section className="chat-masaia">
      <header className="chat-masaia-cabecera">
        <div>
          <h2>🤖 Chat MasaIA</h2>
          <p>
            Conversá con los datos reales
            del negocio.
          </p>
        </div>

        <button
          type="button"
          className="chat-masaia-limpiar"
          onClick={
            limpiarConversacion
          }
          disabled={consultando}
        >
          Limpiar conversación
        </button>
      </header>

      <PreguntasRapidas
        onPreguntar={
          preguntarMasaIA
        }
        disabled={consultando}
      />

      <div className="chat-masaia-conversacion">
        {historial.map((mensaje) =>
          mensaje.autor ===
          "usuario" ? (
            <div
              key={mensaje.id}
              className="chat-masaia-fila chat-masaia-fila-usuario"
            >
              <div className="chat-masaia-avatar chat-masaia-avatar-usuario">
                👤
              </div>

              <div className="chat-masaia-burbuja chat-masaia-burbuja-usuario">
                <small>
                  {new Date(
                    mensaje.fecha
                  ).toLocaleTimeString(
                    "es-AR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </small>

                <p>{mensaje.texto}</p>
              </div>
            </div>
          ) : (
            <div
              key={mensaje.id}
              className="chat-masaia-fila"
            >
              <div className="chat-masaia-avatar chat-masaia-avatar-ia">
                🤖
              </div>

              <RespuestaIA
                respuesta={
                  mensaje.respuesta
                }
                fecha={mensaje.fecha}
              />
            </div>
          )
        )}

        {consultando && (
          <div className="chat-masaia-fila">
            <div className="chat-masaia-avatar chat-masaia-avatar-ia">
              🤖
            </div>

            <div className="chat-masaia-pensando">
              <div className="chat-masaia-puntos">
                <span />
                <span />
                <span />
              </div>

              <strong>
                {etapaAnalisis}
              </strong>
            </div>
          </div>
        )}

        <div ref={finalRef} />
      </div>

      {error && (
        <div className="chat-masaia-error">
          ⚠️ {error}
        </div>
      )}

      <form
        className="chat-masaia-formulario"
        onSubmit={enviar}
      >
        <textarea
          value={pregunta}
          onChange={(evento) =>
            setPregunta(
              evento.target.value
            )
          }
          onKeyDown={(evento) => {
            if (
              evento.key === "Enter" &&
              !evento.shiftKey
            ) {
              evento.preventDefault();
              preguntarMasaIA();
            }
          }}
          placeholder="Preguntale a MasaIA..."
          maxLength={500}
          disabled={consultando}
        />

        <button
          type="submit"
          disabled={
            consultando ||
            !pregunta.trim()
          }
        >
          {consultando
            ? "Analizando..."
            : "Preguntar"}
        </button>
      </form>

      <div className="chat-masaia-ayuda">
        Enter para enviar · Shift + Enter
        para una nueva línea
      </div>
    </section>
  );
}

export default ChatMasaIA;

    
