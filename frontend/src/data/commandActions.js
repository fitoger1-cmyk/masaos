const commandActions = [
  {
    tipo: "accion",
    icono: "➕",
    texto: "Nuevo cliente",
    accion: "nuevoCliente",
    keywords: [
      "cliente",
      "nuevo cliente",
      "alta cliente",
    ],
  },

  {
    tipo: "accion",
    icono: "🛒",
    texto: "Nueva compra",
    accion: "nuevaCompra",
    keywords: [
      "compra",
      "comprar",
      "proveedor",
    ],
  },

  {
    tipo: "accion",
    icono: "📦",
    texto: "Nuevo producto",
    accion: "nuevoProducto",
    keywords: [
      "producto",
      "pizza",
      "focaccia",
      "postre",
    ],
  },

  {
    tipo: "accion",
    icono: "💵",
    texto: "Abrir caja",
    accion: "abrirCaja",
    keywords: [
      "caja",
      "cobrar",
      "venta",
    ],
  },
];

export default commandActions;