const express = require("express");

const comprasService = require(
  "../services/comprasService"
);

const stockService = require(
  "../services/stockService"
);

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

function crearComprasRouter({
  io,
}) {
  const router =
    express.Router();

  /*
   * LISTAR COMPRAS
   *
   * GET /api/compras
   */
  router.get(
    "/",
    async (req, res) => {
      try {
        const compras =
          await comprasService
            .listarCompras();

        res.json(compras);
      } catch (error) {
        responderError(
          res,
          error,
          "No se pudieron cargar las compras."
        );
      }
    }
  );

  /*
   * OBTENER UNA COMPRA
   *
   * GET /api/compras/:id
   */
  router.get(
    "/:id",
    async (req, res) => {
      try {
        const compra =
          await comprasService
            .obtenerCompra(
              req.params.id
            );

        res.json(compra);
      } catch (error) {
        responderError(
          res,
          error,
          "No se pudo cargar la compra."
        );
      }
    }
  );

  /*
   * REGISTRAR COMPRA
   *
   * POST /api/compras
   */
  router.post(
    "/",
    async (req, res) => {
      try {
        const nuevaCompra =
          await comprasService
            .crearCompra({
              body: req.body,

              usuario:
                req.usuario || null,
            });

        const stockActualizado =
          await stockService
            .listarStock();

        if (io) {
          io.emit(
            "compra:nueva",
            nuevaCompra
          );

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
          .json(nuevaCompra);
      } catch (error) {
        responderError(
          res,
          error,
          "No se pudo registrar la compra."
        );
      }
    }
  );

  return router;
}

module.exports =
  crearComprasRouter;