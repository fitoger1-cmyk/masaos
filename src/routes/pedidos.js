const express = require("express");
const fs = require("fs");

function crearPedidosRouter({
  pedidos,
  setPedidos,
  pedidosPath,
}) {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.json(pedidos);
  });

  router.post("/", (req, res) => {
    const textoProductos = String(
      req.body.producto || ""
    ).trim();

    if (!textoProductos) {
      return res.status(400).json({
        error: "El pedido debe contener productos.",
      });
    }

    const siguienteId = pedidos.length
      ? Math.max(
          ...pedidos.map((pedido) => Number(pedido.id))
        ) + 1
      : 1;

    const ahora = new Date();

    const nuevoPedido = {
      id: siguienteId,
      cliente: req.body.cliente || "Mostrador",
      telefono: req.body.telefono || "",
      direccion: req.body.direccion || "",
      producto: textoProductos,
      cantidad: Number(req.body.cantidad || 0),
      total: Number(req.body.total || 0),
      formaPago: req.body.formaPago || "",
      observaciones: req.body.observaciones || "",
      tipoEntrega: req.body.tipoEntrega || "Retiro",
      estado: "Nuevo",
      fecha: ahora.toISOString().split("T")[0],
      fechaHora: ahora.toISOString(),
    };

    pedidos.push(nuevoPedido);

    fs.writeFileSync(
      pedidosPath,
      JSON.stringify(pedidos, null, 2)
    );

    setPedidos(pedidos);

    res.json(nuevoPedido);
  });

  router.put("/:id/estado", (req, res) => {
    const id = Number(req.params.id);

    const estadosPermitidos = [
      "Nuevo",
      "Preparando",
      "Listo",
      "Entregado",
      "Cancelado",
    ];

    const nuevoEstado = String(
      req.body.estado || ""
    ).trim();

    if (!estadosPermitidos.includes(nuevoEstado)) {
      return res.status(400).json({
        error: "Estado de pedido no válido.",
      });
    }

    const pedido = pedidos.find(
      (item) => Number(item.id) === id
    );

    if (!pedido) {
      return res.status(404).json({
        error: "Pedido no encontrado.",
      });
    }

    pedido.estado = nuevoEstado;
    pedido.fechaActualizacion = new Date().toISOString();

    fs.writeFileSync(
      pedidosPath,
      JSON.stringify(pedidos, null, 2)
    );

    setPedidos(pedidos);

    res.json(pedido);
  });

  return router;
}

module.exports = crearPedidosRouter;