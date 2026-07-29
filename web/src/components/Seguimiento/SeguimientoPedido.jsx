import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import "./seguimiento.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const ESTADOS = [
  {
    nombre: "Nuevo",
    titulo: "Pedido recibido",
    icono: "✅",
    descripcion:
      "Recibimos tu pedido correctamente.",
  },
  {
    nombre: "Preparando",
    titulo: "En preparación",
    icono: "🍕",
    descripcion:
      "Estamos preparando tu pedido.",
  },
  {
    nombre: "Listo",
    titulo: "Pedido listo",
    icono: "📦",
    descripcion:
      "Tu pedido ya está listo.",
  },
  {
    nombre: "En reparto",
    titulo: "En reparto",
    icono: "🛵",
    descripcion:
      "Tu pedido está en camino.",
  },
  {
    nombre: "Entregado",
    titulo: "Pedido entregado",
    icono: "🎉",
    descripcion:
      "Tu pedido fue entregado.",
  },
];

function normalizarEstado(estado = "") {
  const estadoLimpio = String(estado)
    .trim()
    .toLowerCase();

  const equivalencias = {
    nuevo: "Nuevo",
    recibido: "Nuevo",

    preparando: "Preparando",
    "en preparación": "Preparando",
    "en preparacion": "Preparando",

    listo: "Listo",

    reparto: "En reparto",
    "en reparto": "En reparto",

    entregado: "Entregado",

    cancelado: "Cancelado",
  };

  return (
    equivalencias[estadoLimpio] ||
    estado ||
    "Nuevo"
  );
}

function obtenerIdPedido(pedido) {
  return (
    pedido?.id ??
    pedido?._id ??
    null
  );
}

function obtenerNumeroPedido(pedido) {
  return (
    pedido?.numeroPedido ||
    pedido?.numero ||
    (pedido?.id
      ? `#${pedido.id}`
      : "Sin número")
  );
}

function SeguimientoPedido({
  pedidoInicial,
  onCerrar,
}) {
  const [pedido, setPedido] = useState(
    pedidoInicial || null
  );

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] =
    useState("");

  const idPedido = obtenerIdPedido(
    pedidoInicial || pedido
  );

  const cargarPedido = useCallback(
    async () => {
      if (!idPedido) {
        return;
      }

      try {
        setCargando(true);
        setError("");

        const respuesta = await fetch(
          `${API_URL}/pedidos`,
          {
            cache: "no-store",
          }
        );

        if (!respuesta.ok) {
          throw new Error(
            "No pudimos consultar el pedido."
          );
        }

        const datos =
          await respuesta.json();

        const pedidos = Array.isArray(datos)
          ? datos
          : Array.isArray(datos?.pedidos)
            ? datos.pedidos
            : [];

        const pedidoEncontrado =
          pedidos.find((item) => {
            const idItem =
              obtenerIdPedido(item);

            return (
              String(idItem) ===
              String(idPedido)
            );
          });

        if (!pedidoEncontrado) {
          setError(
            "No encontramos el pedido solicitado."
          );

          return;
        }

        setPedido(pedidoEncontrado);

        localStorage.setItem(
          "masaos_ultimo_pedido",
          JSON.stringify(
            pedidoEncontrado
          )
        );
      } catch (err) {
        console.error(
          "Error consultando pedido:",
          err
        );

        setError(
          "No pudimos actualizar el estado en este momento. Vamos a intentar nuevamente."
        );
      } finally {
        setCargando(false);
      }
    },
    [idPedido]
  );

  useEffect(() => {
    cargarPedido();

    const intervalo =
      window.setInterval(
        cargarPedido,
        8000
      );

    return () => {
      window.clearInterval(intervalo);
    };
  }, [cargarPedido]);

  const estadoActual =
    normalizarEstado(
      pedido?.estado || "Nuevo"
    );

  const indiceActual = useMemo(() => {
    return ESTADOS.findIndex(
      (estado) =>
        estado.nombre === estadoActual
    );
  }, [estadoActual]);

  const pedidoCancelado =
    estadoActual === "Cancelado";

  if (!pedido) {
    return (
      <section className="seguimiento">
        <div className="seguimiento__tarjeta">
          <h2>
            No encontramos el pedido
          </h2>

          <p>
            El seguimiento no está
            disponible en este momento.
          </p>

          <button
            type="button"
            className="seguimiento__boton"
            onClick={onCerrar}
          >
            Volver al inicio
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="seguimiento">
      <div className="seguimiento__tarjeta">
        <header className="seguimiento__header">
          <span className="seguimiento__etiqueta">
            Seguimiento en vivo
          </span>

          <h1>
            Pedido{" "}
            {obtenerNumeroPedido(pedido)}
          </h1>

          <p>
            Podés dejar esta pantalla
            abierta. El estado se
            actualizará automáticamente.
          </p>
        </header>

        {error && (
          <div
            className="seguimiento__error"
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}

        {pedidoCancelado ? (
          <div className="seguimiento__cancelado">
            <span>❌</span>

            <h2>
              Pedido cancelado
            </h2>

            <p>
              Este pedido fue cancelado.
            </p>
          </div>
        ) : (
          <div className="seguimiento__linea">
            {ESTADOS.map(
              (estado, indice) => {
                const completado =
                  indice <= indiceActual;

                const actual =
                  indice === indiceActual;

                return (
                  <article
                    key={estado.nombre}
                    className={[
                      "seguimiento__estado",

                      completado
                        ? "seguimiento__estado--completado"
                        : "",

                      actual
                        ? "seguimiento__estado--actual"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="seguimiento__icono">
                      {estado.icono}
                    </div>

                    <div className="seguimiento__contenido">
                      <h3>
                        {estado.titulo}
                      </h3>

                      <p>
                        {estado.descripcion}
                      </p>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}

        <div className="seguimiento__detalle">
          <div>
            <span>Cliente</span>

            <strong>
              {pedido.cliente?.nombre ||
                "Cliente"}
            </strong>
          </div>

          <div>
            <span>Entrega</span>

            <strong>
              {String(
                pedido.entrega?.tipo || ""
              ).toLowerCase() ===
              "delivery"
                ? "Delivery"
                : "Retiro en el local"}
            </strong>

            {String(
              pedido.entrega?.tipo || ""
            ).toLowerCase() ===
              "delivery" &&
              pedido.entrega?.direccion && (
                <small>
                  {
                    pedido.entrega
                      .direccion
                  }
                </small>
              )}
          </div>

          <div>
            <span>Estado actual</span>

            <strong>
              {estadoActual}
            </strong>
          </div>
        </div>

        <div className="seguimiento__acciones">
          <button
            type="button"
            className="seguimiento__actualizar"
            onClick={cargarPedido}
            disabled={cargando}
          >
            {cargando
              ? "Actualizando..."
              : "Actualizar estado"}
          </button>

          <button
            type="button"
            className="seguimiento__boton"
            onClick={onCerrar}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </section>
  );
}

export default SeguimientoPedido;