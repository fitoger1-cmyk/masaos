// ============================================
// MasaOS Enterprise
// Pedido Service
// ============================================

export function construirPedido({
  datos,
  items,
  subtotal,
  cantidadTotal,
}) {
  return {
    cliente: {
      nombre: datos.nombre.trim(),
      telefono: datos.telefono.trim(),
    },

    entrega: {
      tipo: datos.tipoEntrega,

      direccion:
        datos.tipoEntrega === "delivery"
          ? datos.direccion.trim()
          : "",

      localidad: datos.localidad.trim(),

      referencia: datos.referencia.trim(),
    },

    pago: {
      metodo: datos.formaPago,

      pagaCon:
        datos.formaPago === "efectivo"
          ? Number(datos.pagaCon) || null
          : null,

      estado: "Pendiente",
    },

    observaciones: datos.observaciones.trim(),

    productos: items.map((item, indice) => {
      const precio = Number(item.precio) || 0;
      const cantidad = Number(item.cantidad) || 1;

      return {
        id:
          item.id ??
          item._id ??
          item.carritoId ??
          indice + 1,

        nombre:
          item.nombre ??
          item.name ??
          `Producto ${indice + 1}`,

        categoria: item.categoria || "",

        precio,

        cantidad,

        subtotal: precio * cantidad,

        observaciones:
          item.observaciones || "",
      };
    }),

    cantidadTotal,

    subtotal,

    costoEnvio: 0,

    origen: "Web 3.2",

    estado: "Nuevo",
  };
}