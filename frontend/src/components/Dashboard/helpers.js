export function formatearDinero(valor) {
  return Number(valor || 0).toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  });
}

export function obtenerFechaLocalTexto(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function extraerProductosVenta(venta) {
  if (Array.isArray(venta.productos)) {
    return venta.productos.map((producto) => ({
      nombre: String(producto.nombre || "").trim() || "Producto",
      cantidad: Number(producto.cantidad || 1),
    }));
  }

  return String(venta.producto || "")
    .split(",")
    .map((texto) => {
      const limpio = texto.trim();
      const coincidencia = limpio.match(/^(.*?)\s+x(\d+)/i);

      return {
        nombre:
          coincidencia?.[1]?.trim() ||
          limpio ||
          "Producto",
        cantidad: Number(coincidencia?.[2] || 1),
      };
    })
    .filter((producto) => producto.nombre);
}

export function calcularDashboard({
  ventas,
  productos,
  usuarios,
  stock,
  produccion,
  clientes,
}) {
  const hoy = obtenerFechaLocalTexto();

  const ventasHoy = ventas.filter(
    (venta) => venta.fecha === hoy
  );

  const facturacionHoy = ventasHoy.reduce(
    (total, venta) =>
      total + Number(venta.total || 0),
    0
  );

  const ticketPromedio =
    ventasHoy.length > 0
      ? facturacionHoy / ventasHoy.length
      : 0;

  const pedidosActivos = ventas.filter((venta) =>
    ["Nuevo", "Preparando", "Listo"].includes(
      venta.estado || "Nuevo"
    )
  );

  const pedidosEnCocina = ventas.filter((venta) =>
    ["Nuevo", "Preparando"].includes(
      venta.estado || "Nuevo"
    )
  ).length;

  const entregadosHoy = ventasHoy.filter(
    (venta) => venta.estado === "Entregado"
  ).length;

  const deliveriesHoy = ventasHoy.filter(
    (venta) =>
      String(venta.tipoPedido || "")
        .trim()
        .toLowerCase() === "delivery"
  ).length;

  const productosActivos = productos.filter(
    (producto) => producto.activo !== false
  ).length;

  const usuariosActivos = usuarios.filter(
    (usuario) => usuario.activo !== false
  ).length;

  const stockCritico = stock.filter(
    (insumo) => Number(insumo.cantidad || 0) <= 5
  );

  const cantidadesPorProducto = {};

  ventas.forEach((venta) => {
    extraerProductosVenta(venta).forEach(
      (producto) => {
        cantidadesPorProducto[producto.nombre] =
          Number(
            cantidadesPorProducto[producto.nombre] || 0
          ) + producto.cantidad;
      }
    );
  });

  const productosMasVendidos = Object.entries(
    cantidadesPorProducto
  )
    .map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  const ventasUltimosSieteDias = [];

  for (let indice = 6; indice >= 0; indice -= 1) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - indice);
    const fechaTexto = obtenerFechaLocalTexto(fecha);

    const total = ventas
      .filter((venta) => venta.fecha === fechaTexto)
      .reduce(
        (acumulado, venta) =>
          acumulado + Number(venta.total || 0),
        0
      );

    ventasUltimosSieteDias.push({
      fecha: fecha.toLocaleDateString("es-AR", {
        weekday: "short",
      }),
      total,
    });
  }

  const produccionMasBaja = [...produccion]
    .sort(
      (a, b) =>
        Number(a.produccionMaxima || 0) -
        Number(b.produccionMaxima || 0)
    )
    .slice(0, 4);

  const clientesHoy = clientes.filter(
    (cliente) => cliente.ultimaCompra === hoy
  ).length;

  return {
    hoy,
    ventasHoy,
    facturacionHoy,
    ticketPromedio,
    pedidosActivos,
    pedidosEnCocina,
    entregadosHoy,
    deliveriesHoy,
    productosActivos,
    usuariosActivos,
    stockCritico,
    productosMasVendidos,
    productoEstrella:
      productosMasVendidos[0] || null,
    ventasUltimosSieteDias,
    produccionMasBaja,
    clientesHoy,
  };
}
