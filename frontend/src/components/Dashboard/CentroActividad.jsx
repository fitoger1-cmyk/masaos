import { useEffect, useMemo, useState } from "react";
import Card from "../ui/Card";

function formatearHora(fecha) {
  if (!fecha) {
    return "--:--";
  }

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "--:--";
  }

  return valor.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearDinero(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);
}

function obtenerDatosEstado(estado = "") {
  const valor = String(estado).toLowerCase();

  if (valor === "nuevo") {
    return {
      icono: "🧾",
      titulo: "Pedido registrado",
      clase: "primary",
    };
  }

  if (
    valor === "preparando" ||
    valor === "en preparación"
  ) {
    return {
      icono: "👨‍🍳",
      titulo: "Pedido en cocina",
      clase: "warning",
    };
  }

  if (valor === "listo") {
    return {
      icono: "✅",
      titulo: "Pedido listo",
      clase: "success",
    };
  }

  if (
    valor === "en reparto" ||
    valor === "en camino"
  ) {
    return {
      icono: "🛵",
      titulo: "Pedido en reparto",
      clase: "primary",
    };
  }

  if (valor === "entregado") {
    return {
      icono: "🏁",
      titulo: "Pedido entregado",
      clase: "success",
    };
  }

  if (valor === "cancelado") {
    return {
      icono: "❌",
      titulo: "Pedido cancelado",
      clase: "danger",
    };
  }

  return {
    icono: "📌",
    titulo: "Actividad operativa",
    clase: "neutral",
  };
}

function crearActividadVenta(venta) {
  const estado = obtenerDatosEstado(venta?.estado);

  return {
    id: `venta-${venta?.id}-${venta?.fechaActualizacion || venta?.fechaHora}`,
    icono: estado.icono,
    titulo: estado.titulo,
    descripcion:
      venta?.producto ||
      venta?.productos?.map((item) => item.nombre).join(", ") ||
      "Venta sin detalle",

    detalle: `Venta #${venta?.id || "-"} · ${formatearDinero(
      venta?.total
    )}`,

    hora: formatearHora(
      venta?.fechaActualizacion ||
      venta?.fechaHora
    ),

    fechaOrden:
      venta?.fechaActualizacion ||
      venta?.fechaHora ||
      venta?.fecha ||
      "",

    clase: estado.clase,
  };
}

function CentroActividad({
  ventas = [],
  socketConectado = false,
}) {
  const [actualizadoHace, setActualizadoHace] =
    useState("ahora");

  const actividades = useMemo(() => {
    if (!Array.isArray(ventas)) {
      return [];
    }

    return [...ventas]
      .map(crearActividadVenta)
      .sort(
        (a, b) =>
          new Date(b.fechaOrden).getTime() -
          new Date(a.fechaOrden).getTime()
      )
      .slice(0, 6);
  }, [ventas]);

  useEffect(() => {
    setActualizadoHace("ahora");

    let segundos = 0;

    const intervalo = setInterval(() => {
      segundos += 1;

      if (segundos < 5) {
        setActualizadoHace("ahora");
        return;
      }

      if (segundos < 60) {
        setActualizadoHace(`hace ${segundos} segundos`);
        return;
      }

      const minutos = Math.floor(segundos / 60);

      setActualizadoHace(
        minutos === 1
          ? "hace 1 minuto"
          : `hace ${minutos} minutos`
      );
    }, 1000);

    return () => clearInterval(intervalo);
  }, [ventas]);

  return (
    <Card className="centro-actividad">
      <div className="centro-actividad-header">
        <div>
          <span className="centro-actividad-kicker">
            TIEMPO REAL
          </span>

          <h3>Actividad reciente</h3>

          <p>
            Últimos movimientos registrados en MasaOS.
          </p>
        </div>

        <div
          className={`centro-actividad-conexion ${
            socketConectado
              ? "conectado"
              : "desconectado"
          }`}
        >
          <span />

          {socketConectado
            ? "En vivo"
            : "Sin conexión"}
        </div>
      </div>

      <div className="centro-actividad-actualizacion">
        <span>Última actualización</span>
        <strong>{actualizadoHace}</strong>
      </div>

      {actividades.length === 0 ? (
        <div className="centro-actividad-vacio">
          <span>📡</span>

          <strong>
            Esperando actividad
          </strong>

          <p>
            Las ventas y los cambios de estado aparecerán
            aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="centro-actividad-lista">
          {actividades.map((actividad) => (
            <article
              key={actividad.id}
              className="centro-actividad-item"
            >
              <div
                className={`centro-actividad-icono ${actividad.clase}`}
              >
                {actividad.icono}
              </div>

              <div className="centro-actividad-contenido">
                <div className="centro-actividad-item-top">
                  <strong>
                    {actividad.titulo}
                  </strong>

                  <time>{actividad.hora}</time>
                </div>

                <p>{actividad.descripcion}</p>

                <small>{actividad.detalle}</small>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}

export default CentroActividad;