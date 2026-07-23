import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  API_URL,
  SOCKET_URL,
} from "../config/api";

const API_VENTAS = `${API_URL}/ventas`;
const API_REPARTIDORES = `${API_URL}/repartidores`;

function Delivery() {
  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [repartidoresSeleccionados, setRepartidoresSeleccionados] =
    useState({});
  const [cargando, setCargando] = useState(true);
  const [actualizandoPedidoId, setActualizandoPedidoId] = useState(null);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [socketConectado, setSocketConectado] = useState(false);

  useEffect(() => {
    cargarDatos();

    const intervalo = setInterval(() => {
      cargarDatos(false);
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setSocketConectado(true));
    socket.on("disconnect", () => setSocketConectado(false));
    socket.on("connect_error", () => setSocketConectado(false));

    socket.on("venta:nueva", actualizarPedidoLocal);
    socket.on("venta:estado", actualizarPedidoLocal);
    socket.on("delivery:actualizado", actualizarPedidoLocal);

    socket.on("repartidores:actualizados", (datos) => {
      if (Array.isArray(datos)) setRepartidores(datos);
    });

    socket.on("repartidor:nuevo", actualizarRepartidorLocal);
    socket.on("repartidor:actualizado", actualizarRepartidorLocal);
    socket.on("repartidor:estado", actualizarRepartidorLocal);
    socket.on("repartidor:activo", actualizarRepartidorLocal);
    socket.on("repartidor:entrega", actualizarRepartidorLocal);

    return () => socket.disconnect();
  }, []);

  function actualizarPedidoLocal(pedidoActualizado) {
    if (!pedidoActualizado) return;

    setPedidos((actuales) => {
      const existe = actuales.some(
        (item) => String(obtenerId(item)) === String(obtenerId(pedidoActualizado))
      );

      if (!existe) return [...actuales, pedidoActualizado];

      return actuales.map((item) =>
        String(obtenerId(item)) === String(obtenerId(pedidoActualizado))
          ? { ...item, ...pedidoActualizado }
          : item
      );
    });
  }

  function actualizarRepartidorLocal(repartidorActualizado) {
    if (!repartidorActualizado) return;

    setRepartidores((actuales) => {
      const existe = actuales.some(
        (item) => String(item.id) === String(repartidorActualizado.id)
      );

      if (!existe) return [...actuales, repartidorActualizado];

      return actuales.map((item) =>
        String(item.id) === String(repartidorActualizado.id)
          ? { ...item, ...repartidorActualizado }
          : item
      );
    });
  }

  async function cargarDatos(mostrarCarga = true) {
    await Promise.all([
      cargarPedidos(mostrarCarga),
      cargarRepartidores(),
    ]);
  }

  async function cargarPedidos(mostrarCarga = true) {
    try {
      if (mostrarCarga) {
        setCargando(true);
      }

      const respuesta = await fetch(API_VENTAS);

      if (!respuesta.ok) {
        throw new Error(
          `No se pudieron cargar los pedidos. Código ${respuesta.status}`
        );
      }

      const datos = await respuesta.json();

      setPedidos(Array.isArray(datos) ? datos : []);
      setError("");
      setUltimaActualizacion(new Date());
    } catch (errorCarga) {
      console.error("Error cargando Delivery:", errorCarga);
      setError(
        "No se pudo conectar con el servidor. Verificá que el backend esté encendido."
      );
    } finally {
      setCargando(false);
    }
  }

  async function cargarRepartidores() {
    try {
      const respuesta = await fetch(
        `${API_REPARTIDORES}?incluirInactivos=true`
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error || "No se pudieron cargar los repartidores."
        );
      }

      setRepartidores(Array.isArray(datos) ? datos : []);
    } catch (errorCarga) {
      console.error("Error cargando repartidores:", errorCarga);
      setError(
        errorCarga.message || "No se pudieron cargar los repartidores."
      );
    }
  }

  async function actualizarEstadoRepartidor(repartidorId, estado) {
    const respuesta = await fetch(
      `${API_REPARTIDORES}/${repartidorId}/estado`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.error || "No se pudo actualizar el repartidor."
      );
    }

    actualizarRepartidorLocal(datos);
    return datos;
  }

  async function registrarEntregaRepartidor(repartidorId, tiempoEntrega) {
    const respuesta = await fetch(
      `${API_REPARTIDORES}/${repartidorId}/entrega`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiempoEntrega }),
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.error || "No se pudo registrar la entrega del repartidor."
      );
    }

    actualizarRepartidorLocal(datos);
    return datos;
  }

  function obtenerId(pedido) {
    return pedido.id ?? pedido._id ?? pedido.numeroPedido;
  }

  function obtenerNumeroPedido(pedido) {
    return (
      pedido.numeroPedido ??
      pedido.numero ??
      pedido.id ??
      pedido._id ??
      "Sin número"
    );
  }

  function obtenerEstado(pedido) {
    return String(pedido.estado || "Nuevo").trim();
  }

  function normalizarEstado(estado) {
    return String(estado || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function esEstado(pedido, estadosPermitidos) {
    const estadoActual = normalizarEstado(obtenerEstado(pedido));

    return estadosPermitidos.some(
      (estado) => normalizarEstado(estado) === estadoActual
    );
  }

  function obtenerCliente(pedido) {
    if (typeof pedido.cliente === "string" && pedido.cliente.trim()) {
      return pedido.cliente;
    }

    return (
      pedido.cliente?.nombre ||
      pedido.nombreCliente ||
      pedido.nombre ||
      "Cliente sin nombre"
    );
  }

  function obtenerTelefono(pedido) {
    return (
      pedido.cliente?.telefono ||
      pedido.telefonoCliente ||
      pedido.telefono ||
      "Sin teléfono"
    );
  }

  function obtenerDireccion(pedido) {
    return (
      pedido.cliente?.direccion ||
      pedido.direccionEntrega ||
      pedido.direccion ||
      "Sin dirección cargada"
    );
  }

  function obtenerObservaciones(pedido) {
    return (
      pedido.observaciones ||
      pedido.nota ||
      pedido.notas ||
      pedido.comentario ||
      ""
    );
  }

  function obtenerFechaPedido(pedido) {
    const valorFecha =
      pedido.fecha ||
      pedido.fechaCreacion ||
      pedido.createdAt ||
      pedido.hora ||
      null;

    if (!valorFecha) {
      return null;
    }

    const fecha = new Date(valorFecha);

    if (Number.isNaN(fecha.getTime())) {
      return null;
    }

    return fecha;
  }

  function formatearHora(pedido) {
    const fecha = obtenerFechaPedido(pedido);

    if (!fecha) {
      return "Sin hora";
    }

    return fecha.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function calcularMinutosTranscurridos(pedido) {
    const fecha = obtenerFechaPedido(pedido);

    if (!fecha) {
      return null;
    }

    const diferencia = Date.now() - fecha.getTime();

    if (diferencia < 0) {
      return 0;
    }

    return Math.floor(diferencia / 60000);
  }

  function mostrarTiempoTranscurrido(pedido) {
    const minutos = calcularMinutosTranscurridos(pedido);

    if (minutos === null) {
      return "Tiempo no disponible";
    }

    if (minutos < 1) {
      return "Hace menos de 1 minuto";
    }

    if (minutos === 1) {
      return "Hace 1 minuto";
    }

    if (minutos < 60) {
      return `Hace ${minutos} minutos`;
    }

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    if (minutosRestantes === 0) {
      return `Hace ${horas} h`;
    }

    return `Hace ${horas} h ${minutosRestantes} min`;
  }

  function obtenerProductos(pedido) {
    if (Array.isArray(pedido.productos)) {
      return pedido.productos
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          const cantidad = Number(item.cantidad) || 1;
          const nombre =
            item.nombre ||
            item.producto ||
            item.descripcion ||
            "Producto sin nombre";

          return `${cantidad} × ${nombre}`;
        })
        .filter(Boolean);
    }

    if (Array.isArray(pedido.items)) {
      return pedido.items
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          const cantidad = Number(item.cantidad) || 1;
          const nombre =
            item.nombre ||
            item.producto ||
            item.descripcion ||
            "Producto sin nombre";

          return `${cantidad} × ${nombre}`;
        })
        .filter(Boolean);
    }

    if (pedido.producto) {
      const cantidad = Number(pedido.cantidad) || 1;
      return [`${cantidad} × ${pedido.producto}`];
    }

    return ["Sin productos cargados"];
  }

  function obtenerTotal(pedido) {
    const total =
      Number(pedido.total) ||
      Number(pedido.precioTotal) ||
      Number(pedido.monto) ||
      0;

    return total.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });
  }

  function obtenerRepartidorActual(pedido) {
    if (typeof pedido.repartidor === "string") {
      return pedido.repartidor;
    }

    return (
      pedido.repartidor?.nombre ||
      pedido.nombreRepartidor ||
      pedido.delivery ||
      ""
    );
  }

  async function actualizarPedido(pedido, cambios) {
    const pedidoId = obtenerId(pedido);

    if (pedidoId === undefined || pedidoId === null) {
      alert("Este pedido no tiene un ID válido.");
      return false;
    }

    try {
      setActualizandoPedidoId(pedidoId);
      setError("");

      const respuesta = await fetch(`${API_VENTAS}/${pedidoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cambios),
      });

      const textoRespuesta = await respuesta.text();

      let datosRespuesta = null;

      if (textoRespuesta) {
        try {
          datosRespuesta = JSON.parse(textoRespuesta);
        } catch {
          datosRespuesta = textoRespuesta;
        }
      }

      if (!respuesta.ok) {
        const mensajeServidor =
          typeof datosRespuesta === "object"
            ? datosRespuesta?.error || datosRespuesta?.mensaje
            : datosRespuesta;

        throw new Error(
          mensajeServidor ||
            `No se pudo actualizar el pedido. Código ${respuesta.status}`
        );
      }

      setPedidos((pedidosActuales) =>
        pedidosActuales.map((pedidoActual) => {
          if (String(obtenerId(pedidoActual)) !== String(pedidoId)) {
            return pedidoActual;
          }

          return {
            ...pedidoActual,
            ...cambios,
          };
        })
      );

      return true;
    } catch (errorActualizacion) {
      console.error("Error actualizando pedido:", errorActualizacion);

      setError(
        errorActualizacion.message ||
          "No se pudo actualizar el estado del pedido."
      );

      return false;
    } finally {
      setActualizandoPedidoId(null);
    }
  }

  async function asignarRepartidor(pedido) {
    const pedidoId = obtenerId(pedido);
    const repartidorSeleccionado = repartidoresSeleccionados[pedidoId];

    if (!repartidorSeleccionado) {
      alert("Seleccioná un repartidor antes de asignarlo.");
      return;
    }

    const repartidor = repartidores.find(
      (item) => String(item.id) === String(repartidorSeleccionado)
    );

    if (!repartidor) {
      alert("No se encontró el repartidor seleccionado.");
      return;
    }

    if (repartidor.activo === false || repartidor.estado !== "Disponible") {
      alert("Ese repartidor ya no está disponible.");
      await cargarRepartidores();
      return;
    }

    const actualizado = await actualizarPedido(pedido, {
      repartidor: repartidor.nombre,
      repartidorId: repartidor.id,
      fechaAsignacionRepartidor: new Date().toISOString(),
    });

    if (actualizado) {
      alert(`${repartidor.nombre} fue asignado al pedido.`);
    }
  }

  async function salirAReparto(pedido) {
    const pedidoId = obtenerId(pedido);
    const repartidorId =
      pedido.repartidorId || repartidoresSeleccionados[pedidoId];

    const repartidor = repartidores.find(
      (item) => String(item.id) === String(repartidorId)
    );

    const repartidorActual =
      obtenerRepartidorActual(pedido) || repartidor?.nombre;

    if (!repartidorActual || !repartidorId) {
      alert("Primero debés asignar un repartidor.");
      return;
    }

    if (repartidor && repartidor.estado !== "Disponible") {
      alert(`${repartidor.nombre} ya no está disponible.`);
      await cargarRepartidores();
      return;
    }

    try {
      await actualizarEstadoRepartidor(repartidorId, "En reparto");

      const actualizado = await actualizarPedido(pedido, {
        estado: "En reparto",
        repartidor: repartidorActual,
        repartidorId,
        horaSalida: new Date().toISOString(),
      });

      if (!actualizado) {
        await actualizarEstadoRepartidor(repartidorId, "Disponible");
        return;
      }

      alert("El pedido salió a reparto.");
    } catch (errorSalida) {
      console.error("Error iniciando reparto:", errorSalida);
      setError(errorSalida.message || "No se pudo iniciar el reparto.");
    }
  }

  async function marcarEntregado(pedido) {
    const confirmado = window.confirm(
      `¿Confirmás que el pedido #${obtenerNumeroPedido(
        pedido
      )} fue entregado?`
    );

    if (!confirmado) return;

    const horaEntrega = new Date();
    const actualizado = await actualizarPedido(pedido, {
      estado: "Entregado",
      horaEntrega: horaEntrega.toISOString(),
    });

    if (!actualizado) return;

    const repartidorId = pedido.repartidorId;

    if (repartidorId) {
      try {
        const horaSalida = pedido.horaSalida
          ? new Date(pedido.horaSalida)
          : null;

        const tiempoEntrega =
          horaSalida && !Number.isNaN(horaSalida.getTime())
            ? Math.max(
                Math.round((horaEntrega.getTime() - horaSalida.getTime()) / 60000),
                1
              )
            : 0;

        await registrarEntregaRepartidor(repartidorId, tiempoEntrega);
      } catch (errorEntrega) {
        console.error("Pedido entregado, pero falló la estadística:", errorEntrega);
        setError(
          "El pedido fue entregado, pero no se pudo actualizar la estadística del repartidor."
        );
      }
    }

    alert("Pedido marcado como entregado.");
  }

  const repartidoresDisponibles = useMemo(
    () =>
      repartidores
        .filter(
          (item) => item.activo !== false && item.estado === "Disponible"
        )
        .sort((a, b) =>
          String(a.nombre).localeCompare(String(b.nombre), "es")
        ),
    [repartidores]
  );

  const pedidosDelivery = useMemo(() => {
    return pedidos
      .filter((pedido) =>
        esEstado(pedido, ["Listo", "En reparto", "En camino"])
      )
      .sort((pedidoA, pedidoB) => {
        const fechaA = obtenerFechaPedido(pedidoA)?.getTime() || 0;
        const fechaB = obtenerFechaPedido(pedidoB)?.getTime() || 0;

        return fechaA - fechaB;
      });
  }, [pedidos]);

  const pedidosListos = useMemo(
    () =>
      pedidosDelivery.filter((pedido) =>
        esEstado(pedido, ["Listo"])
      ),
    [pedidosDelivery]
  );

  const pedidosEnReparto = useMemo(
    () =>
      pedidosDelivery.filter((pedido) =>
        esEstado(pedido, ["En reparto", "En camino"])
      ),
    [pedidosDelivery]
  );

  const entregadosHoy = useMemo(() => {
    const ahora = new Date();

    return pedidos.filter((pedido) => {
      if (!esEstado(pedido, ["Entregado"])) {
        return false;
      }

      const fechaEntrega = new Date(
        pedido.horaEntrega ||
          pedido.fechaEntrega ||
          pedido.updatedAt ||
          pedido.fecha ||
          ""
      );

      if (Number.isNaN(fechaEntrega.getTime())) {
        return false;
      }

      return (
        fechaEntrega.getDate() === ahora.getDate() &&
        fechaEntrega.getMonth() === ahora.getMonth() &&
        fechaEntrega.getFullYear() === ahora.getFullYear()
      );
    }).length;
  }, [pedidos]);

  const tiempoPromedioEntrega = useMemo(() => {
    const tiempos = pedidos
      .filter((pedido) => esEstado(pedido, ["Entregado"]))
      .map((pedido) => {
        const inicio = obtenerFechaPedido(pedido);
        const fin = new Date(
          pedido.horaEntrega || pedido.fechaEntrega || ""
        );

        if (
          !inicio ||
          Number.isNaN(fin.getTime()) ||
          fin.getTime() < inicio.getTime()
        ) {
          return null;
        }

        return Math.round((fin.getTime() - inicio.getTime()) / 60000);
      })
      .filter((tiempo) => tiempo !== null && tiempo <= 300);

    if (tiempos.length === 0) {
      return "—";
    }

    const promedio =
      tiempos.reduce((acumulado, tiempo) => acumulado + tiempo, 0) /
      tiempos.length;

    return `${Math.round(promedio)} min`;
  }, [pedidos]);

  return (
    <section className="delivery-pro">
      <style>{`
        .delivery-pro {
          min-height: 100%;
          padding: 24px;
          color: #1f2937;
          background:
            radial-gradient(circle at top right, rgba(239, 68, 68, 0.08), transparent 35%),
            #f5f7fb;
          box-sizing: border-box;
        }

        .delivery-pro * {
          box-sizing: border-box;
        }

        .delivery-encabezado {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .delivery-titulo-contenedor h1 {
          margin: 0;
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.1;
          color: #111827;
        }

        .delivery-titulo-contenedor p {
          margin: 8px 0 0;
          color: #6b7280;
          font-size: 15px;
        }

        .delivery-actualizacion {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          color: #6b7280;
          font-size: 13px;
        }

        .delivery-boton-actualizar {
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 10px 15px;
          background: #ffffff;
          color: #374151;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .delivery-boton-actualizar:hover {
          transform: translateY(-1px);
          border-color: #ef4444;
          color: #dc2626;
        }

        .delivery-kpis {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .delivery-kpi {
          position: relative;
          overflow: hidden;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        }

        .delivery-kpi::after {
          content: "";
          position: absolute;
          top: -30px;
          right: -30px;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.07);
        }

        .delivery-kpi-icono {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          margin-bottom: 15px;
          border-radius: 12px;
          background: #fff1f2;
          font-size: 22px;
        }

        .delivery-kpi-etiqueta {
          color: #6b7280;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .delivery-kpi-valor {
          display: block;
          margin-top: 6px;
          color: #111827;
          font-size: 30px;
          font-weight: 800;
        }

        .delivery-error {
          margin-bottom: 20px;
          padding: 14px 16px;
          border: 1px solid #fecaca;
          border-radius: 12px;
          background: #fef2f2;
          color: #b91c1c;
          font-weight: 600;
        }

        .delivery-columnas {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .delivery-columna {
          min-width: 0;
        }

        .delivery-columna-titulo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
        }

        .delivery-columna-titulo h2 {
          margin: 0;
          color: #111827;
          font-size: 21px;
        }

        .delivery-contador {
          min-width: 34px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #111827;
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          text-align: center;
        }

        .delivery-listado {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .delivery-pedido {
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
        }

        .delivery-pedido-cabecera {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 18px 15px;
          border-bottom: 1px solid #f0f1f3;
        }

        .delivery-numero {
          margin: 0;
          color: #111827;
          font-size: 20px;
          font-weight: 800;
        }

        .delivery-hora {
          margin-top: 5px;
          color: #6b7280;
          font-size: 13px;
        }

        .delivery-estado {
          align-self: flex-start;
          padding: 7px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .delivery-estado-listo {
          background: #dcfce7;
          color: #166534;
        }

        .delivery-estado-reparto {
          background: #ffedd5;
          color: #9a3412;
        }

        .delivery-pedido-cuerpo {
          padding: 17px 18px;
        }

        .delivery-cliente {
          margin-bottom: 14px;
        }

        .delivery-cliente-nombre {
          margin: 0;
          color: #111827;
          font-size: 17px;
          font-weight: 800;
        }

        .delivery-dato {
          display: flex;
          gap: 9px;
          margin-top: 8px;
          color: #4b5563;
          font-size: 14px;
          line-height: 1.45;
        }

        .delivery-productos {
          margin: 15px 0 0;
          padding: 14px;
          border-radius: 12px;
          background: #f9fafb;
        }

        .delivery-productos-titulo {
          margin-bottom: 8px;
          color: #374151;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .delivery-producto {
          margin: 5px 0;
          color: #374151;
          font-size: 14px;
        }

        .delivery-observaciones {
          margin-top: 13px;
          padding: 11px 13px;
          border-left: 4px solid #f59e0b;
          border-radius: 8px;
          background: #fffbeb;
          color: #92400e;
          font-size: 13px;
          line-height: 1.45;
        }

        .delivery-resumen {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 15px;
        }

        .delivery-total {
          color: #111827;
          font-size: 20px;
          font-weight: 900;
        }

        .delivery-tiempo {
          color: #6b7280;
          font-size: 13px;
          font-weight: 700;
        }

        .delivery-repartidor-asignado {
          margin-top: 14px;
          padding: 11px 13px;
          border-radius: 10px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 14px;
          font-weight: 700;
        }

        .delivery-acciones {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 15px 18px 18px;
          border-top: 1px solid #f0f1f3;
        }

        .delivery-select {
          flex: 1 1 170px;
          min-width: 0;
          padding: 11px 12px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          background: #ffffff;
          color: #374151;
          font-weight: 600;
          outline: none;
        }

        .delivery-select:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .delivery-boton {
          flex: 1 1 135px;
          border: none;
          border-radius: 10px;
          padding: 11px 14px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .delivery-boton:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .delivery-boton:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .delivery-boton-asignar {
          background: #111827;
          color: #ffffff;
        }

        .delivery-boton-salir {
          background: #f97316;
          color: #ffffff;
        }

        .delivery-boton-entregado {
          background: #16a34a;
          color: #ffffff;
        }

        .delivery-vacio,
        .delivery-cargando {
          padding: 40px 20px;
          border: 1px dashed #d1d5db;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.7);
          color: #6b7280;
          text-align: center;
        }

        .delivery-vacio-icono {
          display: block;
          margin-bottom: 10px;
          font-size: 34px;
        }

        @media (max-width: 1100px) {
          .delivery-kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .delivery-columnas {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .delivery-pro {
            padding: 16px;
          }

          .delivery-encabezado {
            flex-direction: column;
          }

          .delivery-actualizacion {
            width: 100%;
            align-items: stretch;
          }

          .delivery-kpis {
            grid-template-columns: 1fr;
          }

          .delivery-pedido-cabecera {
            align-items: flex-start;
          }

          .delivery-resumen {
            align-items: flex-start;
            flex-direction: column;
          }

          .delivery-acciones {
            flex-direction: column;
          }

          .delivery-select,
          .delivery-boton {
            width: 100%;
            flex-basis: auto;
          }
        }
      `}</style>

      <header className="delivery-encabezado">
        <div className="delivery-titulo-contenedor">
          <h1>🛵 Delivery PRO</h1>
          <p>
            Asignación, seguimiento y control de entregas en tiempo real.
          </p>
        </div>

        <div className="delivery-actualizacion">
          <button
            type="button"
            className="delivery-boton-actualizar"
            onClick={() => cargarDatos()}
            disabled={cargando}
          >
            {cargando ? "Actualizando..." : "↻ Actualizar pedidos"}
          </button>

          <span>
            {socketConectado ? "🟢 Tiempo real · " : "🔴 Sin tiempo real · "}
            {ultimaActualizacion
              ? `Última actualización: ${ultimaActualizacion.toLocaleTimeString(
                  "es-AR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                )}`
              : "Esperando actualización"}
          </span>
        </div>
      </header>

      <div className="delivery-kpis">
        <article className="delivery-kpi">
          <div className="delivery-kpi-icono">📦</div>
          <span className="delivery-kpi-etiqueta">Pedidos listos</span>
          <strong className="delivery-kpi-valor">
            {pedidosListos.length}
          </strong>
        </article>

        <article className="delivery-kpi">
          <div className="delivery-kpi-icono">🛵</div>
          <span className="delivery-kpi-etiqueta">En reparto</span>
          <strong className="delivery-kpi-valor">
            {pedidosEnReparto.length}
          </strong>
        </article>

        <article className="delivery-kpi">
          <div className="delivery-kpi-icono">✅</div>
          <span className="delivery-kpi-etiqueta">Entregados hoy</span>
          <strong className="delivery-kpi-valor">{entregadosHoy}</strong>
        </article>

        <article className="delivery-kpi">
          <div className="delivery-kpi-icono">⏱️</div>
          <span className="delivery-kpi-etiqueta">Tiempo promedio</span>
          <strong className="delivery-kpi-valor">
            {tiempoPromedioEntrega}
          </strong>
        </article>
      </div>

      {error && <div className="delivery-error">⚠️ {error}</div>}

      {cargando && pedidos.length === 0 ? (
        <div className="delivery-cargando">
          Cargando pedidos de Delivery...
        </div>
      ) : (
        <div className="delivery-columnas">
          <div className="delivery-columna">
            <div className="delivery-columna-titulo">
              <h2>📦 Esperando repartidor</h2>
              <span className="delivery-contador">
                {pedidosListos.length}
              </span>
            </div>

            <div className="delivery-listado">
              {pedidosListos.length === 0 ? (
                <div className="delivery-vacio">
                  <span className="delivery-vacio-icono">🎉</span>
                  No hay pedidos esperando reparto.
                </div>
              ) : (
                pedidosListos.map((pedido) => {
                  const pedidoId = obtenerId(pedido);
                  const repartidorActual =
                    obtenerRepartidorActual(pedido);
                  const procesando =
                    String(actualizandoPedidoId) === String(pedidoId);

                  return (
                    <article
                      className="delivery-pedido"
                      key={pedidoId ?? obtenerNumeroPedido(pedido)}
                    >
                      <div className="delivery-pedido-cabecera">
                        <div>
                          <h3 className="delivery-numero">
                            Pedido #{obtenerNumeroPedido(pedido)}
                          </h3>

                          <div className="delivery-hora">
                            🕒 {formatearHora(pedido)}
                          </div>
                        </div>

                        <span className="delivery-estado delivery-estado-listo">
                          Listo
                        </span>
                      </div>

                      <div className="delivery-pedido-cuerpo">
                        <div className="delivery-cliente">
                          <p className="delivery-cliente-nombre">
                            👤 {obtenerCliente(pedido)}
                          </p>

                          <div className="delivery-dato">
                            <span>📞</span>
                            <span>{obtenerTelefono(pedido)}</span>
                          </div>

                          <div className="delivery-dato">
                            <span>📍</span>
                            <span>{obtenerDireccion(pedido)}</span>
                          </div>
                        </div>

                        <div className="delivery-productos">
                          <div className="delivery-productos-titulo">
                            Productos
                          </div>

                          {obtenerProductos(pedido).map(
                            (producto, indice) => (
                              <div
                                className="delivery-producto"
                                key={`${pedidoId}-producto-${indice}`}
                              >
                                {producto}
                              </div>
                            )
                          )}
                        </div>

                        {obtenerObservaciones(pedido) && (
                          <div className="delivery-observaciones">
                            <strong>Observaciones:</strong>{" "}
                            {obtenerObservaciones(pedido)}
                          </div>
                        )}

                        <div className="delivery-resumen">
                          <span className="delivery-total">
                            {obtenerTotal(pedido)}
                          </span>

                          <span className="delivery-tiempo">
                            ⏱ {mostrarTiempoTranscurrido(pedido)}
                          </span>
                        </div>

                        {repartidorActual && (
                          <div className="delivery-repartidor-asignado">
                            🛵 Repartidor asignado: {repartidorActual}
                          </div>
                        )}
                      </div>

                      <div className="delivery-acciones">
                        <select
                          className="delivery-select"
                          value={
                            repartidoresSeleccionados[pedidoId] || ""
                          }
                          onChange={(evento) =>
                            setRepartidoresSeleccionados(
                              (seleccionActual) => ({
                                ...seleccionActual,
                                [pedidoId]: evento.target.value,
                              })
                            )
                          }
                          disabled={procesando || repartidoresDisponibles.length === 0}
                        >
                          <option value="">
                            {repartidoresDisponibles.length > 0
                              ? "Seleccionar repartidor"
                              : "No hay repartidores disponibles"}
                          </option>

                          {repartidoresDisponibles.map((repartidor) => (
                            <option
                              key={repartidor.id}
                              value={repartidor.id}
                            >
                              {repartidor.nombre} · {repartidor.estado}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="delivery-boton delivery-boton-asignar"
                          onClick={() => asignarRepartidor(pedido)}
                          disabled={
                            procesando || repartidoresDisponibles.length === 0
                          }
                        >
                          {procesando ? "Guardando..." : "Asignar"}
                        </button>

                        <button
                          type="button"
                          className="delivery-boton delivery-boton-salir"
                          onClick={() => salirAReparto(pedido)}
                          disabled={procesando}
                        >
                          🛵 Salir a reparto
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          <div className="delivery-columna">
            <div className="delivery-columna-titulo">
              <h2>🛵 Pedidos en reparto</h2>
              <span className="delivery-contador">
                {pedidosEnReparto.length}
              </span>
            </div>

            <div className="delivery-listado">
              {pedidosEnReparto.length === 0 ? (
                <div className="delivery-vacio">
                  <span className="delivery-vacio-icono">🏁</span>
                  No hay pedidos actualmente en reparto.
                </div>
              ) : (
                pedidosEnReparto.map((pedido) => {
                  const pedidoId = obtenerId(pedido);
                  const procesando =
                    String(actualizandoPedidoId) === String(pedidoId);

                  return (
                    <article
                      className="delivery-pedido"
                      key={pedidoId ?? obtenerNumeroPedido(pedido)}
                    >
                      <div className="delivery-pedido-cabecera">
                        <div>
                          <h3 className="delivery-numero">
                            Pedido #{obtenerNumeroPedido(pedido)}
                          </h3>

                          <div className="delivery-hora">
                            Salió:{" "}
                            {pedido.horaSalida
                              ? new Date(
                                  pedido.horaSalida
                                ).toLocaleTimeString("es-AR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Sin hora registrada"}
                          </div>
                        </div>

                        <span className="delivery-estado delivery-estado-reparto">
                          En reparto
                        </span>
                      </div>

                      <div className="delivery-pedido-cuerpo">
                        <div className="delivery-cliente">
                          <p className="delivery-cliente-nombre">
                            👤 {obtenerCliente(pedido)}
                          </p>

                          <div className="delivery-dato">
                            <span>📞</span>
                            <span>{obtenerTelefono(pedido)}</span>
                          </div>

                          <div className="delivery-dato">
                            <span>📍</span>
                            <span>{obtenerDireccion(pedido)}</span>
                          </div>
                        </div>

                        <div className="delivery-productos">
                          <div className="delivery-productos-titulo">
                            Productos
                          </div>

                          {obtenerProductos(pedido).map(
                            (producto, indice) => (
                              <div
                                className="delivery-producto"
                                key={`${pedidoId}-reparto-${indice}`}
                              >
                                {producto}
                              </div>
                            )
                          )}
                        </div>

                        <div className="delivery-resumen">
                          <span className="delivery-total">
                            {obtenerTotal(pedido)}
                          </span>

                          <span className="delivery-tiempo">
                            ⏱ {mostrarTiempoTranscurrido(pedido)}
                          </span>
                        </div>

                        <div className="delivery-repartidor-asignado">
                          🛵 Repartidor:{" "}
                          {obtenerRepartidorActual(pedido) ||
                            "Sin repartidor registrado"}
                        </div>
                      </div>

                      <div className="delivery-acciones">
                        <button
                          type="button"
                          className="delivery-boton delivery-boton-entregado"
                          onClick={() => marcarEntregado(pedido)}
                          disabled={procesando}
                        >
                          {procesando
                            ? "Guardando..."
                            : "✅ Marcar entregado"}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Delivery;