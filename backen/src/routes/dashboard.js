const express = require("express");

const router = express.Router();

function convertirNumero(valor) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : 0;
}

function obtenerFechaLocal(valor) {
  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  return fecha;
}

function esMismoDia(fechaA, fechaB) {
  return (
    fechaA.getFullYear() ===
      fechaB.getFullYear() &&
    fechaA.getMonth() ===
      fechaB.getMonth() &&
    fechaA.getDate() ===
      fechaB.getDate()
  );
}

function obtenerTotalVenta(venta) {
  return convertirNumero(
    venta.total ??
      venta.totalVenta ??
      venta.monto ??
      0
  );
}

function obtenerFechaVenta(venta) {
  return obtenerFechaLocal(
    venta.fecha ??
      venta.creadoEn ??
      venta.createdAt ??
      venta.fechaVenta
  );
}

function obtenerItemsVenta(venta) {
  if (Array.isArray(venta.items)) {
    return venta.items;
  }

  if (Array.isArray(venta.productos)) {
    return venta.productos;
  }

  if (Array.isArray(venta.detalle)) {
    return venta.detalle;
  }

  return [];
}

router.get("/", async (req, res) => {
  try {
    /*
      Estas colecciones deben pasarse
      desde server.js al crear el router.
    */
    const {
      ventas = [],
      pedidos = [],
      stock = [],
      clientes = [],
    } = req.app.locals.dashboardData || {};

    const hoy = new Date();

    const ventasHoy = ventas.filter(
      (venta) => {
        const fecha =
          obtenerFechaVenta(venta);

        return (
          fecha &&
          esMismoDia(fecha, hoy)
        );
      }
    );

    const totalVentasHoy =
      ventasHoy.reduce(
        (acumulado, venta) =>
          acumulado +
          obtenerTotalVenta(venta),
        0
      );

    const pedidosHoy =
      ventasHoy.length;

    const ticketPromedio =
      pedidosHoy > 0
        ? totalVentasHoy /
          pedidosHoy
        : 0;

    const conteoProductos = {};

    ventasHoy.forEach((venta) => {
      const items =
        obtenerItemsVenta(venta);

      items.forEach((item) => {
        const nombre =
          item.nombre ??
          item.producto ??
          item.descripcion ??
          "Producto";

        const cantidad =
          convertirNumero(
            item.cantidad ?? 1
          );

        conteoProductos[nombre] =
          (conteoProductos[nombre] ||
            0) +
          cantidad;
      });
    });

    const productoMasVendido =
      Object.entries(
        conteoProductos
      ).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || "Sin datos";

    const pedidosPendientes =
      pedidos.filter((pedido) => {
        const estado = String(
          pedido.estado || ""
        ).toLowerCase();

        return ![
          "entregado",
          "cancelado",
        ].includes(estado);
      }).length;

    const stockCritico =
      stock.filter((item) => {
        const cantidad =
          convertirNumero(
            item.cantidad ??
            item.stock ??
            item.disponible
          );

        const minimo =
          convertirNumero(
            item.stockMinimo ??
            item.minimo ??
            5
          );

        return cantidad <= minimo;
      }).length;

    const clientesNuevos =
      clientes.filter((cliente) => {
        const fecha =
          obtenerFechaLocal(
            cliente.creadoEn ??
            cliente.createdAt ??
            cliente.fechaAlta
          );

        return (
          fecha &&
          esMismoDia(fecha, hoy)
        );
      }).length;

    res.json({
      ventasHoy: Math.round(
        totalVentasHoy
      ),

      pedidosHoy,

      ticketPromedio: Math.round(
        ticketPromedio
      ),

      productoMasVendido,

      promocionMasVendida:
        "Sin datos",

      clientesNuevos,

      stockCritico,

      pedidosPendientes,

      actualizadoEn:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Error generando dashboard:",
      error
    );

    res.status(500).json({
      error:
        "No se pudo obtener el resumen del dashboard.",
    });
  }
});

module.exports = router;