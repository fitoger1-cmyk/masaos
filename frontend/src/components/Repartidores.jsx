import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const API_REPARTIDORES =
  "http://localhost:3000/api/repartidores";

const FORMULARIO_INICIAL = {
  nombre: "",
  telefono: "",
  vehiculo: "Moto",
  patente: "",
  observaciones: "",
};

const ESTADOS = [
  "Disponible",
  "En reparto",
  "Fuera de servicio",
];

const VEHICULOS = [
  "Moto",
  "Auto",
  "Bicicleta",
  "A pie",
  "Otro",
];

function Repartidores() {
  const [repartidores, setRepartidores] = useState([]);
  const [formulario, setFormulario] =
    useState(FORMULARIO_INICIAL);

  const [repartidorEditando, setRepartidorEditando] =
    useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [mostrarInactivos, setMostrarInactivos] =
    useState(true);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [socketConectado, setSocketConectado] =
    useState(false);

  useEffect(() => {
    cargarRepartidores();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setSocketConectado(true);
    });

    socket.on("disconnect", () => {
      setSocketConectado(false);
    });

    socket.on("connect_error", () => {
      setSocketConectado(false);
    });

    socket.on("repartidores:actualizados", (datos) => {
      if (Array.isArray(datos)) {
        setRepartidores(datos);
      }
    });

    socket.on("repartidor:nuevo", (nuevoRepartidor) => {
      setRepartidores((actuales) => {
        const existe = actuales.some(
          (item) =>
            Number(item.id) ===
            Number(nuevoRepartidor.id)
        );

        return existe
          ? actuales
          : [...actuales, nuevoRepartidor];
      });
    });

    socket.on(
      "repartidor:actualizado",
      actualizarRepartidorLocal
    );

    socket.on(
      "repartidor:estado",
      actualizarRepartidorLocal
    );

    socket.on(
      "repartidor:activo",
      actualizarRepartidorLocal
    );

    socket.on(
      "repartidor:entrega",
      actualizarRepartidorLocal
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  function actualizarRepartidorLocal(repartidorActualizado) {
    setRepartidores((actuales) =>
      actuales.map((item) =>
        Number(item.id) ===
        Number(repartidorActualizado.id)
          ? {
              ...item,
              ...repartidorActualizado,
            }
          : item
      )
    );
  }

  async function cargarRepartidores() {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(
        `${API_REPARTIDORES}?incluirInactivos=true`
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            "No se pudieron cargar los repartidores."
        );
      }

      setRepartidores(
        Array.isArray(datos) ? datos : []
      );
    } catch (errorCarga) {
      console.error(
        "Error cargando repartidores:",
        errorCarga
      );

      setError(
        errorCarga.message ||
          "No se pudieron cargar los repartidores."
      );
    } finally {
      setCargando(false);
    }
  }

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function limpiarFormulario() {
    setFormulario(FORMULARIO_INICIAL);
    setRepartidorEditando(null);
    setError("");
  }

  function editarRepartidor(repartidor) {
    setRepartidorEditando(repartidor);

    setFormulario({
      nombre: repartidor.nombre || "",
      telefono: repartidor.telefono || "",
      vehiculo: repartidor.vehiculo || "Moto",
      patente: repartidor.patente || "",
      observaciones:
        repartidor.observaciones || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function guardarRepartidor(evento) {
    evento.preventDefault();

    const nombre = formulario.nombre.trim();

    if (!nombre) {
      setError(
        "El nombre del repartidor es obligatorio."
      );
      return;
    }

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const editando = Boolean(repartidorEditando);

      const url = editando
        ? `${API_REPARTIDORES}/${repartidorEditando.id}`
        : API_REPARTIDORES;

      const respuesta = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          telefono: formulario.telefono.trim(),
          vehiculo: formulario.vehiculo,
          patente: formulario.patente
            .trim()
            .toUpperCase(),
          observaciones:
            formulario.observaciones.trim(),
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            "No se pudo guardar el repartidor."
        );
      }

      if (editando) {
        actualizarRepartidorLocal(datos);
        setMensaje(
          "Repartidor actualizado correctamente."
        );
      } else {
        setRepartidores((actuales) => {
          const existe = actuales.some(
            (item) =>
              Number(item.id) === Number(datos.id)
          );

          return existe
            ? actuales
            : [...actuales, datos];
        });

        setMensaje(
          "Repartidor creado correctamente."
        );
      }

      limpiarFormulario();
    } catch (errorGuardado) {
      console.error(
        "Error guardando repartidor:",
        errorGuardado
      );

      setError(
        errorGuardado.message ||
          "No se pudo guardar el repartidor."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(
    repartidor,
    nuevoEstado
  ) {
    try {
      setError("");
      setMensaje("");

      const respuesta = await fetch(
        `${API_REPARTIDORES}/${repartidor.id}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado: nuevoEstado,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            "No se pudo cambiar el estado."
        );
      }

      actualizarRepartidorLocal(datos);
      setMensaje(
        `Estado actualizado a ${nuevoEstado}.`
      );
    } catch (errorEstado) {
      console.error(
        "Error cambiando estado:",
        errorEstado
      );

      setError(
        errorEstado.message ||
          "No se pudo cambiar el estado."
      );
    }
  }

  async function cambiarActivo(repartidor) {
    const nuevoActivo =
      repartidor.activo === false;

    const accion = nuevoActivo
      ? "activar"
      : "desactivar";

    const confirmado = window.confirm(
      `¿Confirmás que querés ${accion} a ${repartidor.nombre}?`
    );

    if (!confirmado) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const respuesta = await fetch(
        `${API_REPARTIDORES}/${repartidor.id}/activo`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activo: nuevoActivo,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            "No se pudo actualizar el repartidor."
        );
      }

      actualizarRepartidorLocal(datos);

      setMensaje(
        nuevoActivo
          ? "Repartidor activado."
          : "Repartidor desactivado."
      );
    } catch (errorActivo) {
      console.error(
        "Error cambiando actividad:",
        errorActivo
      );

      setError(
        errorActivo.message ||
          "No se pudo actualizar el repartidor."
      );
    }
  }

  function normalizarTexto(valor = "") {
    return String(valor)
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  const repartidoresFiltrados = useMemo(() => {
    const termino = normalizarTexto(busqueda);

    return repartidores
      .filter((repartidor) => {
        if (
          !mostrarInactivos &&
          repartidor.activo === false
        ) {
          return false;
        }

        if (
          filtroEstado !== "Todos" &&
          repartidor.estado !== filtroEstado
        ) {
          return false;
        }

        if (!termino) {
          return true;
        }

        const textoCompleto = normalizarTexto(
          [
            repartidor.nombre,
            repartidor.telefono,
            repartidor.vehiculo,
            repartidor.patente,
            repartidor.estado,
          ].join(" ")
        );

        return textoCompleto.includes(termino);
      })
      .sort((a, b) =>
        String(a.nombre).localeCompare(
          String(b.nombre),
          "es"
        )
      );
  }, [
    repartidores,
    busqueda,
    filtroEstado,
    mostrarInactivos,
  ]);

  const resumen = useMemo(() => {
    const activos = repartidores.filter(
      (item) => item.activo !== false
    );

    const disponibles = activos.filter(
      (item) => item.estado === "Disponible"
    ).length;

    const enReparto = activos.filter(
      (item) => item.estado === "En reparto"
    ).length;

    const fueraServicio = repartidores.filter(
      (item) =>
        item.estado === "Fuera de servicio" ||
        item.activo === false
    ).length;

    const entregasTotales = repartidores.reduce(
      (total, item) =>
        total + Number(item.entregas || 0),
      0
    );

    return {
      activos: activos.length,
      disponibles,
      enReparto,
      fueraServicio,
      entregasTotales,
    };
  }, [repartidores]);

  function obtenerClaseEstado(estado) {
    switch (estado) {
      case "Disponible":
        return "repartidores-estado-disponible";

      case "En reparto":
        return "repartidores-estado-reparto";

      default:
        return "repartidores-estado-fuera";
    }
  }

  function obtenerIconoVehiculo(vehiculo) {
    switch (vehiculo) {
      case "Moto":
        return "🛵";

      case "Auto":
        return "🚗";

      case "Bicicleta":
        return "🚲";

      case "A pie":
        return "🚶";

      default:
        return "🚚";
    }
  }

  return (
    <section className="repartidores-pro">
      <style>{`
        .repartidores-pro {
          min-height: 100%;
          padding: 24px;
          box-sizing: border-box;
          color: #172033;
          background:
            radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 30%),
            #f5f7fb;
        }

        .repartidores-pro * {
          box-sizing: border-box;
        }

        .repartidores-encabezado {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 22px;
        }

        .repartidores-titulo h1 {
          margin: 0;
          color: #111827;
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.1;
        }

        .repartidores-titulo p {
          margin: 8px 0 0;
          color: #6b7280;
          font-size: 15px;
        }

        .repartidores-conexion {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          background: #ffffff;
          color: #4b5563;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
        }

        .repartidores-conexion-punto {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ef4444;
        }

        .repartidores-conexion-punto.activo {
          background: #22c55e;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.14);
        }

        .repartidores-kpis {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .repartidores-kpi {
          padding: 18px;
          border: 1px solid #e5e7eb;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
        }

        .repartidores-kpi-icono {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          margin-bottom: 12px;
          border-radius: 12px;
          background: #eff6ff;
          font-size: 21px;
        }

        .repartidores-kpi-etiqueta {
          display: block;
          color: #6b7280;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .repartidores-kpi-valor {
          display: block;
          margin-top: 5px;
          color: #111827;
          font-size: 28px;
          font-weight: 900;
        }

        .repartidores-mensaje {
          margin-bottom: 18px;
          padding: 13px 15px;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 700;
        }

        .repartidores-mensaje-exito {
          border: 1px solid #bbf7d0;
          background: #f0fdf4;
          color: #166534;
        }

        .repartidores-mensaje-error {
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        }

        .repartidores-contenido {
          display: grid;
          grid-template-columns: minmax(280px, 350px) minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .repartidores-panel {
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.06);
        }

        .repartidores-panel-formulario {
          position: sticky;
          top: 18px;
          padding: 20px;
        }

        .repartidores-panel-titulo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .repartidores-panel-titulo h2 {
          margin: 0;
          color: #111827;
          font-size: 20px;
        }

        .repartidores-etiqueta-edicion {
          padding: 5px 9px;
          border-radius: 999px;
          background: #fef3c7;
          color: #92400e;
          font-size: 11px;
          font-weight: 800;
        }

        .repartidores-campo {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 14px;
        }

        .repartidores-campo label {
          color: #374151;
          font-size: 13px;
          font-weight: 800;
        }

        .repartidores-campo input,
        .repartidores-campo select,
        .repartidores-campo textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          background: #ffffff;
          color: #111827;
          font: inherit;
          outline: none;
          transition: 0.2s ease;
        }

        .repartidores-campo textarea {
          min-height: 90px;
          resize: vertical;
        }

        .repartidores-campo input:focus,
        .repartidores-campo select:focus,
        .repartidores-campo textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .repartidores-formulario-acciones {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        .repartidores-boton {
          border: none;
          border-radius: 10px;
          padding: 11px 14px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .repartidores-boton:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .repartidores-boton:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .repartidores-boton-principal {
          flex: 1;
          background: #2563eb;
          color: #ffffff;
        }

        .repartidores-boton-secundario {
          background: #f3f4f6;
          color: #374151;
        }

        .repartidores-listado-panel {
          overflow: hidden;
        }

        .repartidores-herramientas {
          display: grid;
          grid-template-columns: minmax(180px, 1fr) 190px auto;
          gap: 12px;
          padding: 18px;
          border-bottom: 1px solid #e5e7eb;
        }

        .repartidores-buscador,
        .repartidores-filtro {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          background: #ffffff;
          color: #374151;
          font: inherit;
          outline: none;
        }

        .repartidores-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4b5563;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .repartidores-tabla-contenedor {
          overflow-x: auto;
        }

        .repartidores-tabla {
          width: 100%;
          border-collapse: collapse;
          min-width: 880px;
        }

        .repartidores-tabla th,
        .repartidores-tabla td {
          padding: 14px 15px;
          border-bottom: 1px solid #eef0f3;
          text-align: left;
          vertical-align: middle;
        }

        .repartidores-tabla th {
          background: #f9fafb;
          color: #6b7280;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .repartidores-tabla td {
          color: #374151;
          font-size: 14px;
        }

        .repartidores-fila-inactiva {
          opacity: 0.58;
          background: #fafafa;
        }

        .repartidores-nombre {
          color: #111827;
          font-weight: 850;
        }

        .repartidores-subdato {
          display: block;
          margin-top: 4px;
          color: #9ca3af;
          font-size: 12px;
        }

        .repartidores-vehiculo {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-weight: 700;
        }

        .repartidores-estado {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .repartidores-estado-disponible {
          background: #dcfce7;
          color: #166534;
        }

        .repartidores-estado-reparto {
          background: #ffedd5;
          color: #9a3412;
        }

        .repartidores-estado-fuera {
          background: #fee2e2;
          color: #991b1b;
        }

        .repartidores-select-estado {
          width: 155px;
          padding: 8px 9px;
          border: 1px solid #d1d5db;
          border-radius: 9px;
          background: #ffffff;
          color: #374151;
          font-size: 12px;
          font-weight: 700;
        }

        .repartidores-acciones-tabla {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .repartidores-boton-tabla {
          border: none;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .repartidores-boton-editar {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .repartidores-boton-desactivar {
          background: #fee2e2;
          color: #b91c1c;
        }

        .repartidores-boton-activar {
          background: #dcfce7;
          color: #166534;
        }

        .repartidores-vacio,
        .repartidores-cargando {
          padding: 50px 20px;
          color: #6b7280;
          text-align: center;
        }

        .repartidores-vacio-icono {
          display: block;
          margin-bottom: 10px;
          font-size: 35px;
        }

        @media (max-width: 1200px) {
          .repartidores-kpis {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .repartidores-contenido {
            grid-template-columns: 1fr;
          }

          .repartidores-panel-formulario {
            position: static;
          }
        }

        @media (max-width: 780px) {
          .repartidores-pro {
            padding: 15px;
          }

          .repartidores-encabezado {
            flex-direction: column;
          }

          .repartidores-kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .repartidores-herramientas {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 500px) {
          .repartidores-kpis {
            grid-template-columns: 1fr;
          }

          .repartidores-formulario-acciones {
            flex-direction: column;
          }
        }
      `}</style>

      <header className="repartidores-encabezado">
        <div className="repartidores-titulo">
          <h1>🛵 Repartidores PRO</h1>

          <p>
            Administración, disponibilidad y rendimiento del
            equipo de entregas.
          </p>
        </div>

        <div className="repartidores-conexion">
          <span
            className={`repartidores-conexion-punto ${
              socketConectado ? "activo" : ""
            }`}
          />

          {socketConectado
            ? "Tiempo real conectado"
            : "Tiempo real desconectado"}
        </div>
      </header>

      <div className="repartidores-kpis">
        <article className="repartidores-kpi">
          <div className="repartidores-kpi-icono">
            👥
          </div>

          <span className="repartidores-kpi-etiqueta">
            Repartidores activos
          </span>

          <strong className="repartidores-kpi-valor">
            {resumen.activos}
          </strong>
        </article>

        <article className="repartidores-kpi">
          <div className="repartidores-kpi-icono">
            🟢
          </div>

          <span className="repartidores-kpi-etiqueta">
            Disponibles
          </span>

          <strong className="repartidores-kpi-valor">
            {resumen.disponibles}
          </strong>
        </article>

        <article className="repartidores-kpi">
          <div className="repartidores-kpi-icono">
            🛵
          </div>

          <span className="repartidores-kpi-etiqueta">
            En reparto
          </span>

          <strong className="repartidores-kpi-valor">
            {resumen.enReparto}
          </strong>
        </article>

        <article className="repartidores-kpi">
          <div className="repartidores-kpi-icono">
            ⛔
          </div>

          <span className="repartidores-kpi-etiqueta">
            Fuera de servicio
          </span>

          <strong className="repartidores-kpi-valor">
            {resumen.fueraServicio}
          </strong>
        </article>

        <article className="repartidores-kpi">
          <div className="repartidores-kpi-icono">
            📦
          </div>

          <span className="repartidores-kpi-etiqueta">
            Entregas acumuladas
          </span>

          <strong className="repartidores-kpi-valor">
            {resumen.entregasTotales}
          </strong>
        </article>
      </div>

      {mensaje && (
        <div className="repartidores-mensaje repartidores-mensaje-exito">
          ✅ {mensaje}
        </div>
      )}

      {error && (
        <div className="repartidores-mensaje repartidores-mensaje-error">
          ⚠️ {error}
        </div>
      )}

      <div className="repartidores-contenido">
        <form
          className="repartidores-panel repartidores-panel-formulario"
          onSubmit={guardarRepartidor}
        >
          <div className="repartidores-panel-titulo">
            <h2>
              {repartidorEditando
                ? "Editar repartidor"
                : "Nuevo repartidor"}
            </h2>

            {repartidorEditando && (
              <span className="repartidores-etiqueta-edicion">
                EDITANDO
              </span>
            )}
          </div>

          <div className="repartidores-campo">
            <label htmlFor="nombre">
              Nombre completo *
            </label>

            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formulario.nombre}
              onChange={manejarCambio}
              placeholder="Ejemplo: Juan Pérez"
              autoComplete="off"
            />
          </div>

          <div className="repartidores-campo">
            <label htmlFor="telefono">
              Teléfono
            </label>

            <input
              id="telefono"
              name="telefono"
              type="text"
              value={formulario.telefono}
              onChange={manejarCambio}
              placeholder="Ejemplo: 11 2345 6789"
              autoComplete="off"
            />
          </div>

          <div className="repartidores-campo">
            <label htmlFor="vehiculo">
              Vehículo
            </label>

            <select
              id="vehiculo"
              name="vehiculo"
              value={formulario.vehiculo}
              onChange={manejarCambio}
            >
              {VEHICULOS.map((vehiculo) => (
                <option
                  key={vehiculo}
                  value={vehiculo}
                >
                  {vehiculo}
                </option>
              ))}
            </select>
          </div>

          <div className="repartidores-campo">
            <label htmlFor="patente">
              Patente
            </label>

            <input
              id="patente"
              name="patente"
              type="text"
              value={formulario.patente}
              onChange={manejarCambio}
              placeholder="Ejemplo: A123BCD"
              autoComplete="off"
            />
          </div>

          <div className="repartidores-campo">
            <label htmlFor="observaciones">
              Observaciones
            </label>

            <textarea
              id="observaciones"
              name="observaciones"
              value={formulario.observaciones}
              onChange={manejarCambio}
              placeholder="Turnos, zona habitual, información adicional..."
            />
          </div>

          <div className="repartidores-formulario-acciones">
            <button
              type="submit"
              className="repartidores-boton repartidores-boton-principal"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : repartidorEditando
                  ? "Guardar cambios"
                  : "Crear repartidor"}
            </button>

            {repartidorEditando && (
              <button
                type="button"
                className="repartidores-boton repartidores-boton-secundario"
                onClick={limpiarFormulario}
                disabled={guardando}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="repartidores-panel repartidores-listado-panel">
          <div className="repartidores-herramientas">
            <input
              type="search"
              className="repartidores-buscador"
              placeholder="Buscar por nombre, teléfono, vehículo o patente..."
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
            />

            <select
              className="repartidores-filtro"
              value={filtroEstado}
              onChange={(evento) =>
                setFiltroEstado(evento.target.value)
              }
            >
              <option value="Todos">
                Todos los estados
              </option>

              {ESTADOS.map((estado) => (
                <option
                  key={estado}
                  value={estado}
                >
                  {estado}
                </option>
              ))}
            </select>

            <label className="repartidores-checkbox">
              <input
                type="checkbox"
                checked={mostrarInactivos}
                onChange={(evento) =>
                  setMostrarInactivos(
                    evento.target.checked
                  )
                }
              />

              Mostrar inactivos
            </label>
          </div>

          {cargando ? (
            <div className="repartidores-cargando">
              Cargando repartidores...
            </div>
          ) : repartidoresFiltrados.length === 0 ? (
            <div className="repartidores-vacio">
              <span className="repartidores-vacio-icono">
                🛵
              </span>

              No se encontraron repartidores.
            </div>
          ) : (
            <div className="repartidores-tabla-contenedor">
              <table className="repartidores-tabla">
                <thead>
                  <tr>
                    <th>Repartidor</th>
                    <th>Vehículo</th>
                    <th>Estado</th>
                    <th>Entregas</th>
                    <th>Promedio</th>
                    <th>Cambiar estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {repartidoresFiltrados.map(
                    (repartidor) => (
                      <tr
                        key={repartidor.id}
                        className={
                          repartidor.activo === false
                            ? "repartidores-fila-inactiva"
                            : ""
                        }
                      >
                        <td>
                          <span className="repartidores-nombre">
                            {repartidor.nombre}
                          </span>

                          <span className="repartidores-subdato">
                            {repartidor.telefono ||
                              "Sin teléfono"}
                          </span>

                          {repartidor.activo === false && (
                            <span className="repartidores-subdato">
                              Cuenta inactiva
                            </span>
                          )}
                        </td>

                        <td>
                          <span className="repartidores-vehiculo">
                            {obtenerIconoVehiculo(
                              repartidor.vehiculo
                            )}

                            {repartidor.vehiculo}
                          </span>

                          <span className="repartidores-subdato">
                            {repartidor.patente ||
                              "Sin patente"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`repartidores-estado ${obtenerClaseEstado(
                              repartidor.estado
                            )}`}
                          >
                            {repartidor.estado}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {Number(
                              repartidor.entregas || 0
                            )}
                          </strong>
                        </td>

                        <td>
                          {Number(
                            repartidor.tiempoPromedio || 0
                          ) > 0
                            ? `${Number(
                                repartidor.tiempoPromedio
                              ).toFixed(1)} min`
                            : "—"}
                        </td>

                        <td>
                          <select
                            className="repartidores-select-estado"
                            value={
                              repartidor.estado ||
                              "Disponible"
                            }
                            onChange={(evento) =>
                              cambiarEstado(
                                repartidor,
                                evento.target.value
                              )
                            }
                            disabled={
                              repartidor.activo === false
                            }
                          >
                            {ESTADOS.map((estado) => (
                              <option
                                key={estado}
                                value={estado}
                              >
                                {estado}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <div className="repartidores-acciones-tabla">
                            <button
                              type="button"
                              className="repartidores-boton-tabla repartidores-boton-editar"
                              onClick={() =>
                                editarRepartidor(
                                  repartidor
                                )
                              }
                            >
                              ✏️ Editar
                            </button>

                            <button
                              type="button"
                              className={`repartidores-boton-tabla ${
                                repartidor.activo === false
                                  ? "repartidores-boton-activar"
                                  : "repartidores-boton-desactivar"
                              }`}
                              onClick={() =>
                                cambiarActivo(
                                  repartidor
                                )
                              }
                            >
                              {repartidor.activo ===
                              false
                                ? "✅ Activar"
                                : "⛔ Desactivar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Repartidores;