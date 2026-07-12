import { useEffect, useRef, useState } from "react";

function Cocina() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const cantidadPedidosAnterior = useRef(0);

  async function cargarPedidos() {
    try {
      const respuesta = await fetch("http://localhost:3000/api/ventas");

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los pedidos.");
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos)) {
        setPedidos([]);
        return;
      }

      const pedidosActivos = datos
        .filter((pedido) => {
          const estado = pedido.estado || "Nuevo";
          return estado !== "Entregado" && estado !== "Cancelado";
        })
        .sort((a, b) => Number(a.id) - Number(b.id));

      if (
        cantidadPedidosAnterior.current !== 0 &&
        pedidosActivos.length > cantidadPedidosAnterior.current
      ) {
        reproducirSonido();
      }

      cantidadPedidosAnterior.current = pedidosActivos.length;

      setPedidos(pedidosActivos);
      setError("");
    } catch (errorCarga) {
      console.error("Error cargando pedidos:", errorCarga);
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPedidos();

    const intervalo = setInterval(() => {
      cargarPedidos();
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  function reproducirSonido() {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVYGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA"
      );

      audio.play().catch(() => {
        // Algunos navegadores bloquean audio automático.
      });
    } catch (errorAudio) {
      console.error("No se pudo reproducir el sonido:", errorAudio);
    }
  }

  async function cambiarEstado(pedido, nuevoEstado) {
    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/ventas/${pedido.id}/estado`,
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

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error || "No se pudo actualizar el pedido."
        );
      }

      setPedidos((pedidosActuales) =>
        pedidosActuales
          .map((item) =>
            item.id === pedido.id
              ? {
                  ...item,
                  estado: nuevoEstado,
                }
              : item
          )
          .filter(
            (item) =>
              item.estado !== "Entregado" &&
              item.estado !== "Cancelado"
          )
      );
    } catch (errorActualizacion) {
      console.error(
        "Error actualizando estado:",
        errorActualizacion
      );

      alert(errorActualizacion.message);
    }
  }

  function obtenerEstado(pedido) {
    return pedido.estado || "Nuevo";
  }

  function obtenerClaseEstado(estado) {
    switch (estado) {
      case "Preparando":
        return "pedido-preparando";

      case "Listo":
        return "pedido-listo";

      default:
        return "pedido-nuevo";
    }
  }

  function obtenerTextoProductos(pedido) {
    if (Array.isArray(pedido.productos)) {
      return pedido.productos.map((producto, indice) => (
        <div key={`${pedido.id}-${producto.id || indice}`}>
          <strong>
            {producto.cantidad}x {producto.nombre}
          </strong>
        </div>
      ));
    }

    if (pedido.producto) {
      return pedido.producto
        .split(",")
        .map((producto, indice) => (
          <div key={`${pedido.id}-${indice}`}>
            <strong>{producto.trim()}</strong>
          </div>
        ));
    }

    return <p>Sin productos registrados.</p>;
  }

  function formatearHora(fecha) {
    if (!fecha) {
      return "Sin hora";
    }

    const fechaPedido = new Date(fecha);

    if (Number.isNaN(fechaPedido.getTime())) {
      return fecha;
    }

    return fechaPedido.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (cargando) {
    return (
      <section className="section">
        <h2>🍕 Cocina</h2>
        <p>Cargando pedidos...</p>
      </section>
    );
  }

  return (
    <section className="section cocina-section">
      <div className="cocina-encabezado">
        <div>
          <h2>🍕 Cocina</h2>
          <p>Pedidos activos: {pedidos.length}</p>
        </div>

        <button type="button" onClick={cargarPedidos}>
          🔄 Actualizar
        </button>
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      {pedidos.length === 0 ? (
        <div className="cocina-vacia">
          <h3>✅ No hay pedidos pendientes</h3>
          <p>Los nuevos pedidos aparecerán automáticamente.</p>
        </div>
      ) : (
        <div className="pedidos-grid">
          {pedidos.map((pedido) => {
            const estado = obtenerEstado(pedido);

            return (
              <article
                key={pedido.id}
                className={`pedido-card ${obtenerClaseEstado(
                  estado
                )}`}
              >
                <div className="pedido-cabecera">
                  <h2>Pedido #{pedido.id}</h2>

                  <span className="pedido-estado">
                    {estado === "Nuevo" && "🟢 NUEVO"}
                    {estado === "Preparando" &&
                      "🟡 PREPARANDO"}
                    {estado === "Listo" && "🔵 LISTO"}
                  </span>
                </div>

                <div className="pedido-datos">
                  <p>
                    <strong>Cliente:</strong>{" "}
                    {pedido.cliente || "Mostrador"}
                  </p>

                  {pedido.telefono && (
                    <p>
                      <strong>Teléfono:</strong>{" "}
                      {pedido.telefono}
                    </p>
                  )}

                  {pedido.direccion && (
                    <p>
                      <strong>Dirección:</strong>{" "}
                      {pedido.direccion}
                    </p>
                  )}

                  <p>
                    <strong>Hora:</strong>{" "}
                    {formatearHora(
                      pedido.fechaHora ||
                        pedido.createdAt ||
                        pedido.fecha
                    )}
                  </p>
                </div>

                <div className="pedido-productos">
                  <h3>Productos</h3>
                  {obtenerTextoProductos(pedido)}
                </div>

                <div className="pedido-acciones">
                  {estado === "Nuevo" && (
                    <button
                      type="button"
                      className="boton-preparar"
                      onClick={() =>
                        cambiarEstado(pedido, "Preparando")
                      }
                    >
                      👨‍🍳 Comenzar
                    </button>
                  )}

                  {estado === "Preparando" && (
                    <button
                      type="button"
                      className="boton-listo"
                      onClick={() =>
                        cambiarEstado(pedido, "Listo")
                      }
                    >
                      ✅ Marcar listo
                    </button>
                  )}

                  {estado === "Listo" && (
                    <button
                      type="button"
                      className="boton-entregar"
                      onClick={() =>
                        cambiarEstado(pedido, "Entregado")
                      }
                    >
                      📦 Entregar
                    </button>
                  )}

                  <button
                    type="button"
                    className="boton-cancelar"
                    onClick={() => {
                      const confirmar = window.confirm(
                        `¿Cancelar el pedido #${pedido.id}?`
                      );

                      if (confirmar) {
                        cambiarEstado(pedido, "Cancelado");
                      }
                    }}
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Cocina;