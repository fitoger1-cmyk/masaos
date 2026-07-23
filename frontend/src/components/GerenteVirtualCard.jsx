import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL } from "../config/api";


function formatearMoneda(valor) {
  return Number(valor || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

function obtenerSaludo() {
  const hora = new Date().getHours();

  if (hora < 12) {
    return "Buenos días";
  }

  if (hora < 20) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}

function obtenerFechaActual() {
  return new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function obtenerEstadoVisual(puntaje) {
  const valor = Number(puntaje || 0);

  if (valor >= 80) {
    return {
      clase: "bueno",
      riesgo: "Bajo",
      mensaje: "La operación se encuentra estable.",
    };
  }

  if (valor >= 60) {
    return {
      clase: "atencion",
      riesgo: "Medio",
      mensaje: "Hay aspectos que requieren seguimiento.",
    };
  }

  return {
    clase: "critico",
    riesgo: "Alto",
    mensaje: "La operación necesita atención inmediata.",
  };
}

function GerenteVirtualCard({ usuarioLogueado }) {
  const [informe, setInforme] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargarInforme = useCallback(
    async ({ mostrarCargaCompleta = false } = {}) => {
      try {
        if (mostrarCargaCompleta) {
          setCargando(true);
        } else {
          setActualizando(true);
        }

        setError("");

        const respuesta = await fetch(
          `${API_URL}/masaia/gerente-virtual`
        );

        if (!respuesta.ok) {
          throw new Error(
            "No se pudo cargar el informe del Gerente Virtual."
          );
        }

        const datos = await respuesta.json();

        setInforme(datos);
      } catch (errorCarga) {
        console.error(
          "Error cargando Gerente Virtual:",
          errorCarga
        );

        setError(
          errorCarga.message ||
            "No se pudo cargar el informe."
        );
      } finally {
        setCargando(false);
        setActualizando(false);
      }
    },
    []
  );

  useEffect(() => {
    cargarInforme({
      mostrarCargaCompleta: true,
    });
  }, [cargarInforme]);

  const datosVisuales = useMemo(() => {
    const estadoGeneral =
      informe?.estadoGeneral || {};

    const ventas =
      informe?.ventas || {};

    const prioridad =
      informe?.prioridad || {};

    const puntaje =
      Number(estadoGeneral.puntaje || 0);

    const estadoVisual =
      obtenerEstadoVisual(puntaje);

    const ventaEstimada =
      Number(ventas.estimadasHoy || 0);

    const promedioDiario =
      Number(ventas.promedioDiario || 0);

    const objetivoDia =
      Math.round(
        Math.max(
          ventaEstimada,
          promedioDiario
        ) * 1.1
      );

    const diferencia =
      ventaEstimada - promedioDiario;

    const porcentajeDiferencia =
      promedioDiario > 0
        ? (diferencia / promedioDiario) * 100
        : 0;

    let resumenInteligente =
      "Todavía no hay suficiente información para comparar la proyección.";

    if (promedioDiario > 0) {
      if (porcentajeDiferencia > 3) {
        resumenInteligente =
          `La proyección está ${Math.abs(
            porcentajeDiferencia
          ).toFixed(
            1
          )}% por encima del promedio diario.`;
      } else if (porcentajeDiferencia < -3) {
        resumenInteligente =
          `La proyección está ${Math.abs(
            porcentajeDiferencia
          ).toFixed(
            1
          )}% por debajo del promedio diario.`;
      } else {
        resumenInteligente =
          "La proyección se mantiene cerca del promedio habitual.";
      }
    }

    return {
      estadoGeneral,
      ventas,
      prioridad,
      puntaje,
      estadoVisual,
      objetivoDia,
      resumenInteligente,
    };
  }, [informe]);

  if (cargando) {
    return (
      <section className="gerente-virtual-card gerente-cargando">
        <span className="gerente-etiqueta">
          MASAIA
        </span>

        <h2>🧠 Gerente Virtual</h2>

        <p>
          Analizando ventas, stock, rentabilidad y prioridades...
        </p>
      </section>
    );
  }

  if (error && !informe) {
    return (
      <section className="gerente-virtual-card gerente-virtual-error">
        <div className="gerente-virtual-header">
          <div>
            <span className="gerente-etiqueta">
              MASAIA
            </span>

            <h2>🧠 Gerente Virtual</h2>
          </div>

          <button
            type="button"
            className="gerente-boton-actualizar"
            onClick={() =>
              cargarInforme({
                mostrarCargaCompleta: true,
              })
            }
          >
            Reintentar
          </button>
        </div>

        <p>{error}</p>
      </section>
    );
  }

  const {
    estadoGeneral,
    ventas,
    prioridad,
    puntaje,
    estadoVisual,
    objetivoDia,
    resumenInteligente,
  } = datosVisuales;

  const nombreUsuario =
  usuarioLogueado?.nombre ||
  usuarioLogueado?.usuario ||
  usuarioLogueado?.username ||
  "Administrador";
  return (
    <section className="gerente-virtual-card">
      <div className="gerente-virtual-header">
        <div>
          <span className="gerente-etiqueta">
            MASAIA
          </span>

          <h2>
            🧠 {obtenerSaludo()}, {nombreUsuario}
          </h2>

          <p className="gerente-subtitulo">
            Hoy es {obtenerFechaActual()}. Este es el análisis ejecutivo de tu negocio.
          </p>
        </div>

        <button
          type="button"
          className="gerente-boton-actualizar"
          disabled={actualizando}
          onClick={() => cargarInforme()}
        >
          {actualizando
            ? "Actualizando..."
            : "Actualizar"}
        </button>
      </div>

      {error && (
        <div className="gerente-aviso-error">
          {error}
        </div>
      )}

      <div className="gerente-panorama">
        <article
          className={`gerente-estado gerente-estado-${estadoVisual.clase}`}
        >
          <span
            className={`gerente-semaforo gerente-semaforo-${estadoVisual.clase}`}
          />

          <div>
            <small>Estado general</small>

            <strong>
              {estadoGeneral.estado ||
                "Sin datos"}
            </strong>

            <p>{estadoVisual.mensaje}</p>
          </div>
        </article>

        <article className="gerente-riesgo">
          <small>Riesgo operativo</small>

          <strong>{estadoVisual.riesgo}</strong>

          <span>
            Puntaje de salud: {puntaje}/100
          </span>
        </article>

        <article className="gerente-objetivo">
          <small>Objetivo sugerido</small>

          <strong>
            {formatearMoneda(objetivoDia)}
          </strong>

          <span>
            10% sobre la referencia diaria
          </span>
        </article>
      </div>

      <div className="gerente-indicadores">
        <article className="gerente-indicador">
          <span className="gerente-icono">
            💰
          </span>

          <div>
            <small>Venta estimada</small>

            <strong>
              {formatearMoneda(
                ventas.estimadasHoy
              )}
            </strong>
          </div>
        </article>

        <article className="gerente-indicador">
          <span className="gerente-icono">
            📊
          </span>

          <div>
            <small>Promedio diario</small>

            <strong>
              {formatearMoneda(
                ventas.promedioDiario
              )}
            </strong>
          </div>
        </article>

        <article className="gerente-indicador">
          <span className="gerente-icono">
            🍕
          </span>

          <div>
            <small>
              Producto recomendado
            </small>

            <strong>
              {informe?.productoRecomendado ||
                "Sin datos"}
            </strong>
          </div>
        </article>
      </div>

      <div className="gerente-resumen-ia">
        <div className="gerente-resumen-icono">
          ✨
        </div>

        <div>
          <small>Análisis de MasaIA</small>
          <p>{resumenInteligente}</p>
        </div>
      </div>

      <div className="gerente-prioridad">
        <div className="gerente-prioridad-titulo">
          <span>⚠️</span>

          <div>
            <small>Acción recomendada</small>

            <strong>
              {prioridad.titulo ||
                "Sin prioridades críticas"}
            </strong>
          </div>
        </div>

        <p>
          {prioridad.accion ||
            "No se detectaron acciones urgentes."}
        </p>

        <span
          className={`gerente-prioridad-badge prioridad-${String(
            prioridad.prioridad || "media"
          ).toLowerCase()}`}
        >
          {String(
            prioridad.prioridad || "media"
          ).toUpperCase()}
        </span>
      </div>
    </section>
  );
}

export default GerenteVirtualCard;