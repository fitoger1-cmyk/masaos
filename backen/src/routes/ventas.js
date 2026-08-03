const express = require("express");

const ventasService = require(
  "../services/ventasService"
);
const stockService = require("../services/stockService");

function responderError(
  res,
  error,
  mensajePredeterminado
) {
  console.error(
    mensajePredeterminado,
    error
  );

  const estado =
    Number(error.status) || 500;

  res.status(estado).json({
    error:
      estado === 500
        ? mensajePredeterminado
        : error.message,
  });
}

function validarIdVenta(valor) {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error(
      "El ID de la venta no es válido."
    );

    error.status = 400;

    throw error;
  }

  return id;
}

function crearVentasRouter({
  ventas,
  recetas,
  stock,
  clientes,
  ventasPath,
  insumosPath,
  clientesPath,
  io,
}) {
  const router = express.Router();

  /*
   * LISTAR TODAS LAS VENTAS
   *
   * GET /api/ventas
   */
  router.get("/", async (req, res) => {
    try {
      const resultado =
        await ventasService.listarVentas();

      res.json(resultado);
    } catch (error) {
      responderError(
        res,
        error,
        "No se pudieron cargar las ventas."
      );
    }
  });

  /*
   * REGISTRAR NUEVA VENTA
   *
   * POST /api/ventas
   */
  router.post("/", async (req, res) => {
    try {
      const nuevaVenta = await ventasService.crearVenta({
  body: req.body,
  recetas,
  clientes,
  ventas,
  ventasPath,
  clientesPath,
});

      if (io) {
        io.emit(
          "venta:nueva",
          nuevaVenta
        );

        const stockActualizado =
  await stockService.listarStock();

io.emit(
  "stock:actualizado",
  stockActualizado
);

        io.emit(
          "dashboard:update"
        );
      }

      res
        .status(201)
        .json(nuevaVenta);
    } catch (error) {
      responderError(
        res,
        error,
        "No se pudo registrar la venta."
      );
    }
  });

  /*
   * ACTUALIZAR PEDIDO COMPLETO
   *
   * Utilizado por Delivery PRO.
   *
   * PUT /api/ventas/:id
   */
  router.put(
    "/:id",
    async (req, res) => {
      try {
        const ventaId =
          validarIdVenta(
            req.params.id
          );

        const ventaActualizada =
          await ventasService
            .actualizarVenta({
              ventaId,

              body: req.body,

              ventas,

              ventasPath,
            });

        if (io) {
          io.emit(
            "venta:estado",
            ventaActualizada
          );

          io.emit(
            "delivery:actualizado",
            ventaActualizada
          );

          io.emit(
            "dashboard:update"
          );
        }

        res.json(
          ventaActualizada
        );
      } catch (error) {
        responderError(
          res,
          error,
          "No se pudo actualizar el pedido."
        );
      }
    }
  );

  /*
   * ACTUALIZAR SOLAMENTE EL ESTADO
   *
   * Utilizado por Cocina PRO.
   *
   * PUT /api/ventas/:id/estado
   */
  router.put(
    "/:id/estado",
    async (req, res) => {
      try {
        const ventaId =
          validarIdVenta(
            req.params.id
          );

        const ventaActualizada =
          await ventasService
            .actualizarEstado({
              ventaId,

              estado:
                req.body.estado,

              ventas,

              ventasPath,
            });

        if (io) {
          io.emit(
            "venta:estado",
            ventaActualizada
          );

          io.emit(
            "delivery:actualizado",
            ventaActualizada
          );

          io.emit(
            "dashboard:update"
          );
        }

        res.json(
          ventaActualizada
        );
      } catch (error) {
        responderError(
          res,
          error,
          "No se pudo actualizar el estado del pedido."
        );
      }
    }
  );

  return router;
}

module.exports = crearVentasRouter;