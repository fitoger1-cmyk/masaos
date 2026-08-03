const express = require("express");
const stockService = require("../services/stockService");

const router = express.Router();

function responderError(res, error) {
  console.error("Stock:", error);

  const status = error.status || 500;

  res.status(status).json({
    error:
      status === 500
        ? "Ocurrió un error interno en el módulo de stock."
        : error.message,
  });
}

router.get("/", async (req, res) => {
  try {
    const stock = await stockService.listarStock();

    res.json(stock);
  } catch (error) {
    responderError(res, error);
  }
});

router.get("/alertas", async (req, res) => {
  try {
    const alertas =
      await stockService.obtenerAlertasStock();

    res.json(alertas);
  } catch (error) {
    responderError(res, error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const insumo =
      await stockService.obtenerInsumo(
        req.params.id
      );

    res.json(insumo);
  } catch (error) {
    responderError(res, error);
  }
});

router.post("/", async (req, res) => {
  try {
    const nuevoInsumo =
      await stockService.crearInsumo({
        ...req.body,
        usuarioId: req.usuario?.id,
        usuarioNombre:
          req.usuario?.nombre ||
          req.usuario?.usuario,
      });

    res.status(201).json(nuevoInsumo);
  } catch (error) {
    responderError(res, error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const insumoActualizado =
      await stockService.editarInsumo(
        req.params.id,
        {
          ...req.body,
          usuarioId: req.usuario?.id,
          usuarioNombre:
            req.usuario?.nombre ||
            req.usuario?.usuario,
        }
      );

    res.json(insumoActualizado);
  } catch (error) {
    responderError(res, error);
  }
});

router.patch("/:id/entrada", async (req, res) => {
  try {
    const insumoActualizado =
      await stockService.sumarStock(
        req.params.id,
        {
          ...req.body,
          tipo: req.body.tipo || "entrada",
          usuarioId: req.usuario?.id,
          usuarioNombre:
            req.usuario?.nombre ||
            req.usuario?.usuario,
        }
      );

    res.json(insumoActualizado);
  } catch (error) {
    responderError(res, error);
  }
});

router.patch("/:id/salida", async (req, res) => {
  try {
    const insumoActualizado =
      await stockService.descontarStock(
        req.params.id,
        {
          ...req.body,
          tipo: req.body.tipo || "salida",
          usuarioId: req.usuario?.id,
          usuarioNombre:
            req.usuario?.nombre ||
            req.usuario?.usuario,
        }
      );

    res.json(insumoActualizado);
  } catch (error) {
    responderError(res, error);
  }
});

router.patch("/:id/ajuste", async (req, res) => {
  try {
    const insumoActualizado =
      await stockService.ajustarStock(
        req.params.id,
        {
          ...req.body,
          usuarioId: req.usuario?.id,
          usuarioNombre:
            req.usuario?.nombre ||
            req.usuario?.usuario,
        }
      );

    res.json(insumoActualizado);
  } catch (error) {
    responderError(res, error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const resultado =
      await stockService.eliminarInsumo(
        req.params.id
      );

    res.json(resultado);
  } catch (error) {
    responderError(res, error);
  }
});

module.exports = router;