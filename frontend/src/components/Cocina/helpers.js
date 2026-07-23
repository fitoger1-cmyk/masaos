export const ESTADOS_COCINA = [
  "Nuevo",
  "Preparando",
  "Listo",
];

export function obtenerFechaPedido(pedido) {
  const valorFecha =
    pedido.fechaHora ||
    pedido.createdAt ||
    pedido.fecha ||
    pedido.fechaCreacion;

  if (!valorFecha) {
    return null;
  }

  const fecha = new Date(valorFecha);

  return Number.isNaN(fecha.getTime())
    ? null
    : fecha;
}

export function obtenerSegundosTranscurridos(
  pedido,
  horaActual
) {
  const fechaPedido = obtenerFechaPedido(pedido);

  if (!fechaPedido) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      (horaActual - fechaPedido.getTime()) / 1000
    )
  );
}

export function formatearCronometro(segundosTotales) {
  const horas = Math.floor(segundosTotales / 3600);
  const minutos = Math.floor(
    (segundosTotales % 3600) / 60
  );
  const segundos = segundosTotales % 60;

  return `${String(horas).padStart(2, "0")}:${String(
    minutos
  ).padStart(2, "0")}:${String(segundos).padStart(
    2,
    "0"
  )}`;
}

export function obtenerMinutosTranscurridos(
  pedido,
  horaActual
) {
  return Math.floor(
    obtenerSegundosTranscurridos(
      pedido,
      horaActual
    ) / 60
  );
}

export function obtenerPrioridad(
  pedido,
  horaActual
) {
  const estado = pedido.estado || "Nuevo";

  if (estado === "Listo") {
    return {
      texto: "LISTO PARA ENTREGAR",
      icono: "✅",
      clase: "prioridad-listo",
      demora: "demora-listo",
    };
  }

  const minutos = obtenerMinutosTranscurridos(
    pedido,
    horaActual
  );

  if (minutos >= 30) {
    return {
      texto: "URGENTE",
      icono: "🔴",
      clase: "prioridad-urgente",
      demora: "demora-alta",
    };
  }

  if (minutos >= 15) {
    return {
      texto: "ATENCIÓN",
      icono: "🟡",
      clase: "prioridad-atencion",
      demora: "demora-media",
    };
  }

  return {
    texto: "A TIEMPO",
    icono: "🟢",
    clase: "prioridad-normal",
    demora: "demora-normal",
  };
}

export function obtenerEtiquetaEstado(estado) {
  switch (estado) {
    case "Preparando":
      return "PREPARANDO";
    case "Listo":
      return "LISTOS";
    default:
      return "NUEVOS";
  }
}

export function obtenerIconoEstado(estado) {
  switch (estado) {
    case "Preparando":
      return "🔥";
    case "Listo":
      return "✅";
    default:
      return "🆕";
  }
}

export function obtenerClaseColumna(estado) {
  return `cocina-pro-columna-${estado.toLowerCase()}`;
}

export function formatearHoraPedido(pedido) {
  const fechaPedido = obtenerFechaPedido(pedido);

  if (!fechaPedido) {
    return "Sin hora";
  }

  return fechaPedido.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ordenarPedidos(pedidos, horaActual) {
  return [...pedidos].sort((a, b) => {
    const minutosA = obtenerMinutosTranscurridos(
      a,
      horaActual
    );
    const minutosB = obtenerMinutosTranscurridos(
      b,
      horaActual
    );

    if (minutosA !== minutosB) {
      return minutosB - minutosA;
    }

    return Number(a.id || 0) - Number(b.id || 0);
  });
}

export function normalizarProductos(pedido) {
  if (Array.isArray(pedido.productos)) {
    return pedido.productos.map(
      (producto, indice) => ({
        id:
          producto.carritoId ||
          producto.id ||
          `${pedido.id}-${indice}`,
        nombre:
          producto.nombre || "Producto sin nombre",
        cantidad: Number(producto.cantidad || 1),
        observacion: String(
          producto.observacion || ""
        ).trim(),
      })
    );
  }

  if (pedido.producto) {
    return String(pedido.producto)
      .split(",")
      .map((texto, indice) => {
        const producto = texto.trim();
        const coincidencia = producto.match(
          /^(.*)\s+x(\d+)(?:\s+\((.*)\))?$/i
        );

        if (coincidencia) {
          return {
            id: `${pedido.id}-${indice}`,
            nombre: coincidencia[1].trim(),
            cantidad: Number(coincidencia[2]),
            observacion: String(
              coincidencia[3] || ""
            ).trim(),
          };
        }

        return {
          id: `${pedido.id}-${indice}`,
          nombre: producto,
          cantidad: 1,
          observacion: "",
        };
      })
      .filter((producto) => producto.nombre);
  }

  return [];
}
