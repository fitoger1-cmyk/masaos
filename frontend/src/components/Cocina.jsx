    import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";
import {
  API_URL,
  SOCKET_URL,
} from "../config/api";

import CocinaColumna from "./Cocina/CocinaColumna";
import CocinaToolbar from "./Cocina/CocinaToolbar";

const ESTADOS_COCINA = [
  "Nuevo",
  "Preparando",
  "Listo",
];

function obtenerFechaPedido(pedido) {
  const fecha =
    pedido.fechaHora ||
    pedido.fechaActualizacion ||
    pedido.fecha;

  if (!fecha) {
    return null;
  }

  const fechaConvertida = new Date(fecha);

  return Number.isNaN(fechaConvertida.getTime())
    ? null
    : fechaConvertida;
}

function ordenarPedidos(pedidos, horaActual) {
  return [...pedidos].sort((a, b) => {
    const fechaA =
      obtenerFechaPedido(a)?.getTime() || horaActual;

    const fechaB =
      obtenerFechaPedido(b)?.getTime() || horaActual;

    return fechaA - fechaB;
  });
}


function Cocina() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [horaActual, setHoraActual] = useState(
    Date.now()
  );
  const [sonidoActivo, setSonidoActivo] =
    useState(true);
  const [pantallaCompleta, setPantallaCompleta] =
    useState(Boolean(document.fullscreenElement));
  const [cambiandoPedidoId, setCambiandoPedidoId] =
    useState(null);

  const idsPedidosAnteriores = useRef(new Set());
  const primeraCarga = useRef(true);

  const reproducirSonido = useCallback(() => {
    if (!sonidoActivo) {
      return;
    }

    try {
      const contexto = new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

      const oscilador =
        contexto.createOscillator();
      const ganancia = contexto.createGain();

      oscilador.type = "sine";
      oscilador.frequency.setValueAtTime(
        880,
        contexto.currentTime
      );

      ganancia.gain.setValueAtTime(
        0.001,
        contexto.currentTime
      );
      ganancia.gain.exponentialRampToValueAtTime(
        0.18,
        contexto.currentTime + 0.02
      );
      ganancia.gain.exponentialRampToValueAtTime(
        0.001,
        contexto.currentTime + 0.35
      );

      oscilador.connect(ganancia);
      ganancia.connect(contexto.destination);

      oscilador.start();
      oscilador.stop(
        contexto.currentTime + 0.36
      );

      oscilador.addEventListener("ended", () => {
        contexto.close();
      });
    } catch (errorAudio) {
      console.warn(
        "No se pudo reproducir el sonido:",
        errorAudio
      );
    }
  }, [sonidoActivo]);

  const cargarPedidos = useCallback(
    async (mostrarCarga = false) => {
      try {
        if (mostrarCarga) {
          setCargando(true);
        }

        const respuesta = await fetch(
  `${API_URL}/pedidos`
);

        if (!respuesta.ok) {
          throw new Error(
            "No se pudieron cargar los pedidos."
          );
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
          throw new Error(
            "La respuesta de ventas no es válida."
          );
        }

        const pedidosActivos = datos
          .filter((pedido) => {
            if (
              !pedido.producto &&
              !Array.isArray(pedido.productos)
            ) {
              return false;
            }

            return ESTADOS_COCINA.includes(
              pedido.estado || "Nuevo"
            );
          })
          .sort((a, b) => {
            const fechaA =
              obtenerFechaPedido(a)?.getTime() || 0;
            const fechaB =
              obtenerFechaPedido(b)?.getTime() || 0;

            if (fechaA !== fechaB) {
              return fechaA - fechaB;
            }

            return Number(a.id) - Number(b.id);
          });

        const idsActuales = new Set(
          pedidosActivos.map((pedido) =>
            String(pedido.id)
          )
        );

        if (!primeraCarga.current) {
          const hayPedidoNuevo =
            pedidosActivos.some(
              (pedido) =>
                !idsPedidosAnteriores.current.has(
                  String(pedido.id)
                )
            );

          if (hayPedidoNuevo) {
            reproducirSonido();
          }
        }

        primeraCarga.current = false;
        idsPedidosAnteriores.current =
          idsActuales;

        setPedidos(pedidosActivos);
        setError("");
      } catch (errorCarga) {
        console.error(
          "Error cargando pedidos:",
          errorCarga
        );

        setError(errorCarga.message);
      } finally {
        setCargando(false);
      }
    },
    [reproducirSonido]
  );

  useEffect(() => {
    cargarPedidos(true);

    // Respaldo por si se interrumpe la conexión en tiempo real.
    const intervaloPedidos = setInterval(
      () => cargarPedidos(false),
      30000
    );

    return () =>
      clearInterval(intervaloPedidos);
  }, [cargarPedidos]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Cocina conectada en tiempo real.");
    });

    socket.on("pedido:nuevo", () => {
  console.log("Nuevo pedido recibido");
  cargarPedidos(false);
});

socket.on("pedido:estado-actualizado", () => {
  cargarPedidos(false);
});

socket.on("pedidos:actualizados", () => {
  cargarPedidos(false);
});

    socket.on("connect_error", (errorSocket) => {
      console.warn(
        "Tiempo real no disponible. Se usará actualización de respaldo:",
        errorSocket.message
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [cargarPedidos]);

  useEffect(() => {
    const intervaloReloj = setInterval(() => {
      setHoraActual(Date.now());
    }, 1000);

    return () =>
      clearInterval(intervaloReloj);
  }, []);

  useEffect(() => {
    function actualizarPantallaCompleta() {
      setPantallaCompleta(
        Boolean(document.fullscreenElement)
      );
    }

    document.addEventListener(
      "fullscreenchange",
      actualizarPantallaCompleta
    );

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        actualizarPantallaCompleta
      );
  }, []);

  async function cambiarEstado(
    pedido,
    nuevoEstado
  ) {
    if (cambiandoPedidoId !== null) {
      return;
    }

    try {
      setCambiandoPedidoId(pedido.id);

      const respuesta = await fetch(
  `${API_URL}/pedidos/${pedido.id}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado: nuevoEstado,
          }),
        }
      );

      const textoRespuesta =
        await respuesta.text();

      let datos = {};

      try {
        datos = textoRespuesta
          ? JSON.parse(textoRespuesta)
          : {};
      } catch {
        datos = {};
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            textoRespuesta ||
            "No se pudo actualizar el pedido."
        );
      }

      setPedidos((pedidosActuales) =>
        pedidosActuales
          .map((item) =>
            item.id === pedido.id
              ? {
                  ...item,
                  estado: nuevoEstado,
                  fechaActualizacion:
                    datos.fechaActualizacion ||
                    new Date().toISOString(),
                }
              : item
          )
          .filter((item) =>
            ESTADOS_COCINA.includes(
              item.estado || "Nuevo"
            )
          )
      );

      setError("");
    } catch (errorActualizacion) {
      console.error(
        "Error actualizando estado:",
        errorActualizacion
      );

      alert(errorActualizacion.message);
    } finally {
      setCambiandoPedidoId(null);
    }
  }

  async function alternarPantallaCompleta() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (errorPantalla) {
      console.error(
        "No se pudo cambiar la pantalla completa:",
        errorPantalla
      );

      alert(
        "El navegador no permitió activar la pantalla completa."
      );
    }
  }

  const pedidosPorEstado = useMemo(() => {
    return ESTADOS_COCINA.reduce(
      (resultado, estado) => {
        resultado[estado] = ordenarPedidos(
          pedidos.filter(
            (pedido) =>
              (pedido.estado || "Nuevo") === estado
          ),
          horaActual
        );

        return resultado;
      },
      {}
    );
  }, [pedidos, horaActual]);

  if (cargando && pedidos.length === 0) {
    return (
      <section className="section cocina-pro">
        <div className="cocina-pro-cargando">
          <span>👨‍🍳</span>
          <h2>Preparando Cocina PRO...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="section cocina-pro">
      <CocinaToolbar
        cantidadPedidos={pedidos.length}
        cargando={cargando}
        sonidoActivo={sonidoActivo}
        setSonidoActivo={setSonidoActivo}
        pantallaCompleta={pantallaCompleta}
        actualizar={() => cargarPedidos(true)}
        alternarPantallaCompleta={
          alternarPantallaCompleta
        }
      />

      {error && (
        <div className="cocina-pro-error">
          <strong>⚠ Error de conexión</strong>
          <p>{error}</p>
        </div>
      )}

      {pedidos.length === 0 ? (
        <div className="cocina-pro-vacia">
          <span>✅</span>
          <h2>No hay pedidos pendientes</h2>
          <p>
            Los nuevos pedidos aparecerán
            automáticamente.
          </p>
        </div>
      ) : (
        <div className="cocina-pro-tablero">
          {ESTADOS_COCINA.map((estado) => (
            <CocinaColumna
              key={estado}
              estado={estado}
              pedidos={pedidosPorEstado[estado]}
              horaActual={horaActual}
              cambiandoPedidoId={
                cambiandoPedidoId
              }
              cambiarEstado={cambiarEstado}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Cocina;

    
