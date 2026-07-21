function normalizarTexto(valor = "") {
  return String(valor)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function convertirNumero(valor, valorPredeterminado = 0) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : valorPredeterminado;
}

function redondear(valor, decimales = 0) {
  const numero = convertirNumero(valor);
  const factor = 10 ** decimales;

  return Math.round(numero * factor) / factor;
}

function obtenerFechaVenta(venta) {
  const valoresPosibles = [
    venta.fechaHora,
    venta.createdAt,
    venta.fechaCreacion,
    venta.fecha,
    venta.hora,
  ];

  for (const valor of valoresPosibles) {
    if (!valor) {
      continue;
    }

    const fecha = new Date(valor);

    if (!Number.isNaN(fecha.getTime())) {
      return fecha;
    }
  }

  return null;
}

function esMismoDia(fechaA, fechaB) {
  if (!fechaA || !fechaB) {
    return false;
  }

  return (
    fechaA.getFullYear() === fechaB.getFullYear() &&
    fechaA.getMonth() === fechaB.getMonth() &&
    fechaA.getDate() === fechaB.getDate()
  );
}

function esVentaValida(venta) {
  const estado = normalizarTexto(venta.estado);

  return estado !== "cancelado";
}

function obtenerVentasDelDia(ventas, fechaReferencia = new Date()) {
  return ventas.filter((venta) => {
    if (!esVentaValida(venta)) {
      return false;
    }

    const fechaVenta = obtenerFechaVenta(venta);

    return esMismoDia(fechaVenta, fechaReferencia);
  });
}

function obtenerTotalVentas(ventas) {
  return ventas.reduce(
    (total, venta) =>
      total + convertirNumero(venta.total),
    0
  );
}

function obtenerTicketPromedio(ventas) {
  if (ventas.length === 0) {
    return 0;
  }

  return obtenerTotalVentas(ventas) / ventas.length;
}

function obtenerItemsVenta(venta) {
  if (
    Array.isArray(venta.productos) &&
    venta.productos.length > 0
  ) {
    return venta.productos
      .map((producto) => ({
        nombre:
          producto.nombre ||
          producto.producto ||
          producto.descripcion ||
          "Producto sin nombre",

        cantidad: Math.max(
          convertirNumero(producto.cantidad, 1),
          1
        ),

        precio: convertirNumero(
          producto.precio
        ),
      }))
      .filter((producto) =>
        normalizarTexto(producto.nombre)
      );
  }

  if (
    Array.isArray(venta.items) &&
    venta.items.length > 0
  ) {
    return venta.items
      .map((producto) => ({
        nombre:
          producto.nombre ||
          producto.producto ||
          producto.descripcion ||
          "Producto sin nombre",

        cantidad: Math.max(
          convertirNumero(producto.cantidad, 1),
          1
        ),

        precio: convertirNumero(
          producto.precio
        ),
      }))
      .filter((producto) =>
        normalizarTexto(producto.nombre)
      );
  }

  const textoProductos = String(
    venta.producto || ""
  ).trim();

  if (!textoProductos) {
    return [];
  }

  return textoProductos
    .split(",")
    .map((texto) => {
      const item = texto.trim();

      const coincidencia = item.match(
        /^(.*?)\s+x(\d+)(?:\s+\((.*)\))?$/i
      );

      if (coincidencia) {
        return {
          nombre: coincidencia[1].trim(),
          cantidad: Math.max(
            convertirNumero(
              coincidencia[2],
              1
            ),
            1
          ),
          precio: 0,
        };
      }

      return {
        nombre: item,
        cantidad: 1,
        precio: 0,
      };
    })
    .filter((producto) =>
      normalizarTexto(producto.nombre)
    );
}

function obtenerRankingProductos(ventas) {
  const acumulado = new Map();

  ventas.forEach((venta) => {
    const items = obtenerItemsVenta(venta);

    items.forEach((item) => {
      const clave = normalizarTexto(item.nombre);

      if (!clave) {
        return;
      }

      const existente = acumulado.get(clave) || {
        nombre: item.nombre,
        cantidad: 0,
        facturacion: 0,
      };

      existente.cantidad +=
        convertirNumero(item.cantidad);

      existente.facturacion +=
        convertirNumero(item.precio) *
        convertirNumero(item.cantidad);

      acumulado.set(clave, existente);
    });
  });

  return Array.from(acumulado.values())
    .sort((productoA, productoB) => {
      if (
        productoB.cantidad !==
        productoA.cantidad
      ) {
        return (
          productoB.cantidad -
          productoA.cantidad
        );
      }

      return (
        productoB.facturacion -
        productoA.facturacion
      );
    })
    .map((producto, indice) => ({
      posicion: indice + 1,
      nombre: producto.nombre,
      cantidad: redondear(
        producto.cantidad,
        0
      ),
      facturacion: redondear(
        producto.facturacion,
        2
      ),
    }));
}

function obtenerCantidadProductosVendidos(ventas) {
  return ventas.reduce((total, venta) => {
    const items = obtenerItemsVenta(venta);

    return (
      total +
      items.reduce(
        (subtotal, item) =>
          subtotal +
          convertirNumero(item.cantidad),
        0
      )
    );
  }, 0);
}

function obtenerClienteTop(clientes) {
  const clientesValidos = clientes
    .filter((cliente) => {
      const nombre = normalizarTexto(
        cliente.nombre
      );

      return (
        nombre &&
        nombre !== "mostrador"
      );
    })
    .sort((clienteA, clienteB) => {
      const totalA = convertirNumero(
        clienteA.totalGastado
      );

      const totalB = convertirNumero(
        clienteB.totalGastado
      );

      if (totalB !== totalA) {
        return totalB - totalA;
      }

      return (
        convertirNumero(
          clienteB.cantidadPedidos
        ) -
        convertirNumero(
          clienteA.cantidadPedidos
        )
      );
    });

  const cliente = clientesValidos[0];

  if (!cliente) {
    return null;
  }

  return {
    id: cliente.id,
    nombre:
      cliente.nombre ||
      "Cliente sin nombre",

    telefono:
      cliente.telefono || "",

    cantidadPedidos:
      convertirNumero(
        cliente.cantidadPedidos
      ),

    totalGastado: redondear(
      cliente.totalGastado,
      2
    ),

    ultimaCompra:
      cliente.ultimaCompra || "",
  };
}

function obtenerPorcentajeStock(item) {
  const cantidad = convertirNumero(
    item.cantidad
  );

  const minimo = convertirNumero(
    item.stockMinimo ??
      item.minimo ??
      item.cantidadMinima
  );

  const maximo = convertirNumero(
    item.stockMaximo ??
      item.maximo ??
      item.cantidadMaxima
  );

  if (maximo > 0) {
    return Math.max(
      0,
      Math.min(
        100,
        (cantidad / maximo) * 100
      )
    );
  }

  if (minimo > 0) {
    return Math.max(
      0,
      Math.min(
        100,
        (cantidad / (minimo * 3)) * 100
      )
    );
  }

  return null;
}

function obtenerNivelStock(item) {
  const cantidad = convertirNumero(
    item.cantidad
  );

  const minimo = convertirNumero(
    item.stockMinimo ??
      item.minimo ??
      item.cantidadMinima
  );

  const porcentaje =
    obtenerPorcentajeStock(item);

  if (cantidad <= 0) {
    return "agotado";
  }

  if (
    minimo > 0 &&
    cantidad <= minimo
  ) {
    return "critico";
  }

  if (
    porcentaje !== null &&
    porcentaje <= 25
  ) {
    return "critico";
  }

  if (
    minimo > 0 &&
    cantidad <= minimo * 1.5
  ) {
    return "bajo";
  }

  if (
    porcentaje !== null &&
    porcentaje <= 45
  ) {
    return "bajo";
  }

  return "normal";
}

function obtenerStockAnalizado(stock) {
  return stock
    .map((item) => {
      const ingrediente =
        item.ingrediente ||
        item.nombre ||
        "Insumo sin nombre";

      const cantidad =
        convertirNumero(item.cantidad);

      const unidad =
        item.unidad ||
        item.unidadMedida ||
        "";

      return {
        id: item.id,
        ingrediente,
        cantidad,
        unidad,
        stockMinimo: convertirNumero(
          item.stockMinimo ??
            item.minimo ??
            item.cantidadMinima
        ),
        porcentaje: redondear(
          obtenerPorcentajeStock(item),
          1
        ),
        nivel: obtenerNivelStock(item),
        costoUnitario: convertirNumero(
          item.costoUnitario
        ),
      };
    })
    .sort((itemA, itemB) => {
      const prioridades = {
        agotado: 0,
        critico: 1,
        bajo: 2,
        normal: 3,
      };

      return (
        prioridades[itemA.nivel] -
        prioridades[itemB.nivel]
      );
    });
}

function obtenerStockCritico(stock) {
  return obtenerStockAnalizado(stock)
    .filter((item) =>
      [
        "agotado",
        "critico",
        "bajo",
      ].includes(item.nivel)
    );
}

function obtenerCostoProducto(
  nombreProducto,
  recetas,
  stock
) {
  const receta = recetas.find(
    (item) =>
      normalizarTexto(item.producto) ===
      normalizarTexto(nombreProducto)
  );

  if (
    !receta ||
    !Array.isArray(receta.ingredientes)
  ) {
    return 0;
  }

  return receta.ingredientes.reduce(
    (costoTotal, ingredienteReceta) => {
      const insumo = stock.find(
        (item) =>
          normalizarTexto(
            item.ingrediente
          ) ===
          normalizarTexto(
            ingredienteReceta.ingrediente
          )
      );

      if (!insumo) {
        return costoTotal;
      }

      const cantidad = convertirNumero(
        ingredienteReceta.cantidad
      );

      const costoUnitario =
        convertirNumero(
          insumo.costoUnitario
        );

      return (
        costoTotal +
        cantidad * costoUnitario
      );
    },
    0
  );
}

function obtenerRentabilidadProductos({
  productos,
  recetas,
  stock,
}) {
  return productos
    .filter(
      (producto) =>
        producto.activo !== false
    )
    .map((producto) => {
      const precio = convertirNumero(
        producto.precio
      );

      const costo = obtenerCostoProducto(
        producto.nombre,
        recetas,
        stock
      );

      const ganancia =
        precio - costo;

      const margen =
        precio > 0
          ? (ganancia / precio) * 100
          : 0;

      return {
        id: producto.id,
        nombre: producto.nombre,
        precio: redondear(precio, 2),
        costo: redondear(costo, 2),
        ganancia: redondear(
          ganancia,
          2
        ),
        margen: redondear(
          margen,
          1
        ),
      };
    })
    .sort(
      (productoA, productoB) =>
        productoB.margen -
        productoA.margen
    );
}

function obtenerRentabilidadPromedio(
  rentabilidadProductos
) {
  const productosConPrecio =
    rentabilidadProductos.filter(
      (producto) =>
        producto.precio > 0
    );

  if (
    productosConPrecio.length === 0
  ) {
    return 0;
  }

  const suma = productosConPrecio.reduce(
    (total, producto) =>
      total + producto.margen,
    0
  );

  return redondear(
    suma / productosConPrecio.length,
    1
  );
}

function obtenerResumenDelivery({
  ventas,
  repartidores,
  fechaReferencia,
}) {
  const ventasDelDia =
    obtenerVentasDelDia(
      ventas,
      fechaReferencia
    );

  const repartidoresActivos =
    repartidores.filter(
      (repartidor) =>
        repartidor.activo !== false
    );

  const disponibles =
    repartidoresActivos.filter(
      (repartidor) =>
        normalizarTexto(
          repartidor.estado
        ) === "disponible"
    ).length;

  const enReparto =
    repartidoresActivos.filter(
      (repartidor) =>
        normalizarTexto(
          repartidor.estado
        ) === "en reparto"
    ).length;

  const entregadosHoy =
    ventasDelDia.filter(
      (venta) =>
        normalizarTexto(
          venta.estado
        ) === "entregado"
    ).length;

  const tiemposEntrega =
    ventasDelDia
      .map((venta) => {
        if (
          !venta.horaSalida ||
          !venta.horaEntrega
        ) {
          return null;
        }

        const salida = new Date(
          venta.horaSalida
        );

        const entrega = new Date(
          venta.horaEntrega
        );

        if (
          Number.isNaN(
            salida.getTime()
          ) ||
          Number.isNaN(
            entrega.getTime()
          ) ||
          entrega < salida
        ) {
          return null;
        }

        return (
          (entrega.getTime() -
            salida.getTime()) /
          60000
        );
      })
      .filter(
        (tiempo) =>
          tiempo !== null &&
          tiempo <= 300
      );

  const tiempoPromedio =
    tiemposEntrega.length > 0
      ? tiemposEntrega.reduce(
          (total, tiempo) =>
            total + tiempo,
          0
        ) / tiemposEntrega.length
      : 0;

  return {
    repartidoresActivos:
      repartidoresActivos.length,

    disponibles,

    enReparto,

    entregadosHoy,

    tiempoPromedio: redondear(
      tiempoPromedio,
      1
    ),
  };
}

function crearAlertas({
  ventasHoy,
  rankingProductos,
  clienteTop,
  stockCritico,
  rentabilidadPromedio,
  delivery,
}) {
  const alertas = [];

  const agotados =
    stockCritico.filter(
      (item) =>
        item.nivel === "agotado"
    );

  const criticos =
    stockCritico.filter(
      (item) =>
        item.nivel === "critico"
    );

  const bajos =
    stockCritico.filter(
      (item) =>
        item.nivel === "bajo"
    );

  agotados.slice(0, 3).forEach(
    (item) => {
      alertas.push({
        tipo: "stock",
        nivel: "critico",
        titulo: `${item.ingrediente} agotado`,
        mensaje:
          `No queda stock de ${item.ingrediente}. Conviene reponerlo antes de registrar nuevas ventas.`,
      });
    }
  );

  criticos.slice(0, 3).forEach(
    (item) => {
      alertas.push({
        tipo: "stock",
        nivel: "critico",
        titulo: `Stock crítico de ${item.ingrediente}`,
        mensaje:
          `Quedan ${item.cantidad}${item.unidad ? ` ${item.unidad}` : ""}. Conviene comprar hoy.`,
      });
    }
  );

  bajos.slice(0, 3).forEach(
    (item) => {
      alertas.push({
        tipo: "stock",
        nivel: "advertencia",
        titulo: `Stock bajo de ${item.ingrediente}`,
        mensaje:
          `El nivel disponible de ${item.ingrediente} está por debajo de lo recomendado.`,
      });
    }
  );

  if (ventasHoy.length === 0) {
    alertas.push({
      tipo: "ventas",
      nivel: "informacion",
      titulo: "Sin ventas registradas hoy",
      mensaje:
        "Todavía no se registraron ventas durante el día.",
    });
  }

  if (
    rankingProductos.length > 0
  ) {
    alertas.push({
      tipo: "producto",
      nivel: "positivo",
      titulo: "Producto destacado",
      mensaje:
        `${rankingProductos[0].nombre} lidera las ventas de hoy con ${rankingProductos[0].cantidad} unidades.`,
    });
  }

  if (
    clienteTop &&
    clienteTop.cantidadPedidos > 1
  ) {
    alertas.push({
      tipo: "cliente",
      nivel: "positivo",
      titulo: "Cliente destacado",
      mensaje:
        `${clienteTop.nombre} acumula ${clienteTop.cantidadPedidos} pedidos y $${Math.round(clienteTop.totalGastado).toLocaleString("es-AR")} en compras.`,
    });
  }

  if (
    rentabilidadPromedio > 0 &&
    rentabilidadPromedio < 30
  ) {
    alertas.push({
      tipo: "rentabilidad",
      nivel: "advertencia",
      titulo: "Margen bajo",
      mensaje:
        `La rentabilidad promedio estimada es de ${rentabilidadPromedio} %. Conviene revisar precios y costos.`,
    });
  }

  if (
    delivery.enReparto > 0 &&
    delivery.disponibles === 0
  ) {
    alertas.push({
      tipo: "delivery",
      nivel: "advertencia",
      titulo: "Sin repartidores disponibles",
      mensaje:
        "Todos los repartidores activos están realizando entregas.",
    });
  }

  return alertas.slice(0, 10);
}

function calcularSaludNegocio({
  ventasHoy,
  stockCritico,
  rentabilidadPromedio,
  clienteTop,
  delivery,
}) {
  let puntajeVentas =
    ventasHoy.length > 0
      ? 100
      : 45;

  let puntajeStock = 100;

  stockCritico.forEach((item) => {
    if (item.nivel === "agotado") {
      puntajeStock -= 25;
    } else if (
      item.nivel === "critico"
    ) {
      puntajeStock -= 15;
    } else {
      puntajeStock -= 7;
    }
  });

  puntajeStock = Math.max(
    puntajeStock,
    0
  );

  let puntajeRentabilidad = 50;

  if (rentabilidadPromedio >= 55) {
    puntajeRentabilidad = 100;
  } else if (
    rentabilidadPromedio >= 40
  ) {
    puntajeRentabilidad = 80;
  } else if (
    rentabilidadPromedio >= 30
  ) {
    puntajeRentabilidad = 65;
  } else if (
    rentabilidadPromedio > 0
  ) {
    puntajeRentabilidad = 40;
  }

  const puntajeClientes =
    clienteTop ? 90 : 55;

  let puntajeDelivery = 80;

  if (
    delivery.enReparto > 0 &&
    delivery.disponibles === 0
  ) {
    puntajeDelivery = 55;
  } else if (
    delivery.disponibles > 0
  ) {
    puntajeDelivery = 100;
  }

  const total =
    puntajeVentas * 0.25 +
    puntajeStock * 0.25 +
    puntajeRentabilidad * 0.25 +
    puntajeClientes * 0.15 +
    puntajeDelivery * 0.1;

  return {
    puntaje: Math.round(total),

    estado:
      total >= 85
        ? "Excelente"
        : total >= 70
          ? "Bueno"
          : total >= 55
            ? "Atención"
            : "Crítico",

    detalle: {
      ventas: Math.round(
        puntajeVentas
      ),
      stock: Math.round(
        puntajeStock
      ),
      rentabilidad: Math.round(
        puntajeRentabilidad
      ),
      clientes: Math.round(
        puntajeClientes
      ),
      delivery: Math.round(
        puntajeDelivery
      ),
    },
  };
}

function generarDashboardMasaIA({
  ventas = [],
  productos = [],
  stock = [],
  clientes = [],
  recetas = [],
  compras = [],
  repartidores = [],
  fechaReferencia = new Date(),
}) {
  const ventasValidas =
    ventas.filter(esVentaValida);

  const ventasHoy =
    obtenerVentasDelDia(
      ventasValidas,
      fechaReferencia
    );

  const totalVendidoHoy =
    obtenerTotalVentas(ventasHoy);

  const ticketPromedio =
    obtenerTicketPromedio(ventasHoy);

  const rankingProductos =
    obtenerRankingProductos(ventasHoy);

  const productosVendidos =
    obtenerCantidadProductosVendidos(
      ventasHoy
    );

  const clienteTop =
    obtenerClienteTop(clientes);

  const stockAnalizado =
    obtenerStockAnalizado(stock);

  const stockCritico =
    obtenerStockCritico(stock);

  const rentabilidadProductos =
    obtenerRentabilidadProductos({
      productos,
      recetas,
      stock,
    });

  const rentabilidadPromedio =
    obtenerRentabilidadPromedio(
      rentabilidadProductos
    );

  const delivery =
    obtenerResumenDelivery({
      ventas,
      repartidores,
      fechaReferencia,
    });

  const alertas = crearAlertas({
    ventasHoy,
    rankingProductos,
    clienteTop,
    stockCritico,
    rentabilidadPromedio,
    delivery,
  });

  const saludNegocio =
    calcularSaludNegocio({
      ventasHoy,
      stockCritico,
      rentabilidadPromedio,
      clienteTop,
      delivery,
    });

  return {
    generadoEn:
      new Date().toISOString(),

    fechaAnalizada:
      fechaReferencia
        .toISOString()
        .split("T")[0],

    resumen: {
      ventasHoy: redondear(
        totalVendidoHoy,
        2
      ),

      cantidadVentasHoy:
        ventasHoy.length,

      ticketPromedio: redondear(
        ticketPromedio,
        2
      ),

      productosVendidos:
        redondear(
          productosVendidos,
          0
        ),

      productoTop:
        rankingProductos[0] || null,

      clienteTop,

      rentabilidadPromedio,

      stockCritico:
        stockCritico.length,

      alertasActivas:
        alertas.filter(
          (alerta) =>
            alerta.nivel ===
              "critico" ||
            alerta.nivel ===
              "advertencia"
        ).length,
    },

    ventas: {
      totalHoy: redondear(
        totalVendidoHoy,
        2
      ),

      cantidadHoy:
        ventasHoy.length,

      ticketPromedio:
        redondear(
          ticketPromedio,
          2
        ),

      productosVendidos:
        redondear(
          productosVendidos,
          0
        ),

      rankingProductos:
        rankingProductos.slice(0, 10),
    },

    clientes: {
      destacado: clienteTop,
      cantidadTotal:
        clientes.length,
    },

    stock: {
      cantidadInsumos:
        stock.length,

      criticos:
        stockCritico,

      detalle:
        stockAnalizado,
    },

    rentabilidad: {
      promedio:
        rentabilidadPromedio,

      productoMasRentable:
        rentabilidadProductos[0] ||
        null,

      productos:
        rentabilidadProductos.slice(
          0,
          10
        ),
    },

    delivery,

    compras: {
      cantidadRegistrada:
        compras.length,

      totalHistorico:
        redondear(
          compras.reduce(
            (total, compra) =>
              total +
              convertirNumero(
                compra.total
              ),
            0
          ),
          2
        ),
    },

    saludNegocio,

    alertas,
  };
}

module.exports = {
  generarDashboardMasaIA,
  obtenerVentasDelDia,
  obtenerRankingProductos,
  obtenerStockCritico,
  obtenerRentabilidadProductos,
};