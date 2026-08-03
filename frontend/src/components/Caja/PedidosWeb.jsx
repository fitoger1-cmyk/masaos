import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { io } from "socket.io-client";

import {
  API_URL,
  SOCKET_URL,
} from "../../config/api";

import { formatearDinero } from "./formatos";

const ESTADOS_VISIBLES = [
  "Nuevo",
  "Preparando",
  "Listo",
];

function obtenerNombreCliente(pedido) {
  if (
    pedido?.cliente &&
    typeof pedido.cliente === "object"
  ) {
    return (
      pedido.cliente.nombre ||
      "Cliente web"
    );
  }

  return pedido?.cliente || "Cliente web";
}

function obtenerTelefonoCliente(pedido) {
  if (
    pedido?.cliente &&
    typeof pedido.cliente === "object"
  ) {
    return pedido.cliente.telefono || "";
  }

  return pedido?.telefono || "";
}

function obtenerTipoEntrega(pedido) {
  if (
    pedido?.entrega &&
    typeof pedido.entrega === "object"
  ) {
    return pedido.entrega.tipo || "Retiro";
  }

  return (
    pedido?.tipoEntrega ||
    pedido?.tipoPedido ||
    "Retiro"
  );
}

function obtenerCantidadProductos(pedido) {
  if (Array.isArray(pedido?.productos)) {
    return pedido.productos.reduce(
      (total, producto) =>
        total +
        Number(producto.cantidad || 0),
      0
    );
  }

  return Number(pedido?.cantidad || 1);
}

function obtenerTotalPedido(pedido) {
  return Number(
    pedido?.total ??
      pedido?.subtotal ??
      0
  );
}

function PedidosWeb({
  onImportar,
  pedidoSeleccionadoId,
}) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] =
    useState(true);
  const [error, setError] = useState("");

  const cargarPedidos = useCallback(
    async (mostrarCarga = false) => {
      try {
        if (mostrarCarga) {
          setCargando(true);
        }

        const respuesta = await fetch(
          `${API_URL}/pedidos`
        );

        const textoRespuesta =
          await respuesta.text();

        let datos = [];

        try {
          datos = textoRespuesta
            ? JSON.parse(textoRespuesta)
            : [];
        } catch {
          datos = [];
        }

        if (!respuesta.ok) {
          throw new Error(
            datos?.error ||
              textoRespuesta ||
              "No se pudieron cargar los pedidos web."
          );
        }

        if (!Array.isArray(datos)) {
          throw new Error(
            "La respuesta de pedidos no es válida."
          );
        }

        setPedidos(datos);
        setError("");
      } catch (errorCarga) {
        console.error(
          "Error cargando pedidos web:",
          errorCarga
        );

        setError(errorCarga.message);
      } finally {
        setCargando(false);
      }
    },
    []
  );

  useEffect(() => {
    cargarPedidos(true);

    const intervalo = setInterval(
      () => cargarPedidos(false),
      30000
    );

    return () => clearInterval(intervalo);
  }, [cargarPedidos]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: [
        "websocket",
        "polling",
      ],
    });

    socket.on("pedido:nuevo", () => {
      cargarPedidos(false);
    });

    socket.on(
      "pedido:estado-actualizado",
      () => {
        cargarPedidos(false);
      }
    );

    socket.on(
      "pedidos:actualizados",
      () => {
        cargarPedidos(false);
      }
    );

    socket.on(
      "connect_error",
      (errorSocket) => {
        console.warn(
          "Caja sin tiempo real. Se usará actualización automática:",
          errorSocket.message
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [cargarPedidos]);

  const pedidosVisibles = useMemo(() => {
    return pedidos
      .filter((pedido) =>
        ESTADOS_VISIBLES.includes(
          pedido.estado || "Nuevo"
        )
      )
      .sort((a, b) => {
        const fechaA = new Date(
          a.fechaHora ||
            a.fecha ||
            0
        ).getTime();

        const fechaB = new Date(
          b.fechaHora ||
            b.fecha ||
            0
        ).getTime();

        return fechaA - fechaB;
      });
  }, [pedidos]);

  return (
    <section className="caja-pedidos-web">
      <header className="caja-pedidos-web__header">
        <div>
          <h3>🌐 Pedidos Web</h3>

          <p>
            Pedidos recibidos desde la
            tienda online
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            cargarPedidos(true)
          }
          disabled={cargando}
        >
          {cargando
            ? "Actualizando..."
            : "↻ Actualizar"}
        </button>
      </header>

      {error && (
        <div className="caja-pedidos-web__error">
          <strong>
            No se pudieron cargar los
            pedidos
          </strong>

          <p>{error}</p>
        </div>
      )}

      {!cargando &&
      pedidosVisibles.length === 0 ? (
        <div className="caja-pedidos-web__vacio">
          <span>✅</span>

          <p>
            No hay pedidos web pendientes.
          </p>
        </div>
      ) : (
        <div className="caja-pedidos-web__lista">
          {pedidosVisibles.map(
            (pedido) => {
              const seleccionado =
                Number(
                  pedidoSeleccionadoId
                ) ===
                Number(pedido.id);

              return (
                <article
                  className={`caja-pedido-web ${
                    seleccionado
                      ? "seleccionado"
                      : ""
                  }`}
                  key={pedido.id}
                >
                  <div className="caja-pedido-web__principal">
                    <div>
                      <strong>
                        {pedido.numeroPedido ||
                          `Pedido #${pedido.id}`}
                      </strong>

                      <span
                        className={`estado ${String(
                          pedido.estado ||
                            "Nuevo"
                        )
                          .toLowerCase()
                          .replaceAll(
                            " ",
                            "-"
                          )}`}
                      >
                        {pedido.estado ||
                          "Nuevo"}
                      </span>
                    </div>

                    <strong>
                      ${" "}
                      {formatearDinero(
                        obtenerTotalPedido(
                          pedido
                        )
                      )}
                    </strong>
                  </div>

                  <div className="caja-pedido-web__datos">
                    <p>
                      👤{" "}
                      {obtenerNombreCliente(
                        pedido
                      )}
                    </p>

                    {obtenerTelefonoCliente(
                      pedido
                    ) && (
                      <p>
                        📞{" "}
                        {obtenerTelefonoCliente(
                          pedido
                        )}
                      </p>
                    )}

                    <p>
                      📦{" "}
                      {obtenerTipoEntrega(
                        pedido
                      )}
                    </p>

                    <p>
                      🍕{" "}
                      {obtenerCantidadProductos(
                        pedido
                      )}{" "}
                      artículo(s)
                    </p>
                  </div>

                  <button
                    type="button"
                    className="caja-pedido-web__importar"
                    onClick={() =>
                      onImportar(pedido)
                    }
                    disabled={seleccionado}
                  >
                    {seleccionado
                      ? "✓ Cargado en Caja"
                      : "Importar pedido"}
                  </button>
                </article>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}

export default PedidosWeb;