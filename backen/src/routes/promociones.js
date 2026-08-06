const express = require("express");
const {
  listarPromociones,
  obtenerPromocion,
  crearPromocion,
  actualizarPromocion,
  eliminarPromocion,
} = require("../services/promocionesService");

const router = express.Router();

function limpiarTexto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function convertirNumero(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

function convertirBooleano(valor, predeterminado = false) {
  if (typeof valor === "boolean") return valor;
  if (typeof valor === "string" && valor.trim().toLowerCase() === "true") return true;
  if (typeof valor === "string" && valor.trim().toLowerCase() === "false") return false;
  return predeterminado;
}

function normalizarPromocion(body = {}, anterior = {}) {
  return {
    ...anterior,
    nombre: limpiarTexto(body.nombre ?? anterior.nombre),
    descripcion: limpiarTexto(body.descripcion ?? anterior.descripcion),
    imagen: limpiarTexto(body.imagen ?? anterior.imagen),
    precioAnterior: convertirNumero(body.precioAnterior ?? anterior.precioAnterior),
    precioPromocional: convertirNumero(
      body.precioPromocional ?? anterior.precioPromocional
    ),
    inicio: limpiarTexto(body.inicio ?? anterior.inicio),
    fin: limpiarTexto(body.fin ?? anterior.fin),
    mostrarInicio: convertirBooleano(
      body.mostrarInicio,
      anterior.mostrarInicio ?? true
    ),
    mostrarCarrusel: convertirBooleano(
      body.mostrarCarrusel,
      anterior.mostrarCarrusel ?? false
    ),
    mostrarDestacados: convertirBooleano(
      body.mostrarDestacados,
      anterior.mostrarDestacados ?? false
    ),
    mostrarPopup: convertirBooleano(
      body.mostrarPopup,
      anterior.mostrarPopup ?? false
    ),
    activa: convertirBooleano(body.activa, anterior.activa ?? true),
    actualizadoEn: new Date().toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    res.json(await listarPromociones());
  } catch (error) {
    console.error("Error listando promociones:", error);
    res.status(500).json({ error: "No se pudieron leer las promociones." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const promocion = await obtenerPromocion(req.params.id);
    if (!promocion) return res.status(404).json({ error: "Promoción no encontrada." });
    res.json(promocion);
  } catch (error) {
    console.error("Error buscando promoción:", error);
    res.status(500).json({ error: "No se pudo leer la promoción." });
  }
});

router.post("/", async (req, res) => {
  try {
    const nueva = normalizarPromocion(req.body);
    if (!nueva.nombre) {
      return res.status(400).json({ error: "El nombre de la promoción es obligatorio." });
    }
    if (nueva.precioAnterior < 0 || nueva.precioPromocional < 0) {
      return res.status(400).json({ error: "Los precios no pueden ser negativos." });
    }
    nueva.id = Date.now();
    nueva.creadoEn = new Date().toISOString();
    res.status(201).json(await crearPromocion(nueva));
  } catch (error) {
    console.error("Error creando promoción:", error);
    res.status(500).json({ error: "No se pudo crear la promoción." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const anterior = await obtenerPromocion(req.params.id);
    if (!anterior) return res.status(404).json({ error: "Promoción no encontrada." });

    const actualizada = normalizarPromocion(req.body, anterior);
    actualizada.id = anterior.id;
    actualizada.creadoEn = anterior.creadoEn;
    if (!actualizada.nombre) {
      return res.status(400).json({ error: "El nombre de la promoción es obligatorio." });
    }
    if (actualizada.precioAnterior < 0 || actualizada.precioPromocional < 0) {
      return res.status(400).json({ error: "Los precios no pueden ser negativos." });
    }
    res.json(await actualizarPromocion(actualizada));
  } catch (error) {
    console.error("Error actualizando promoción:", error);
    res.status(500).json({ error: "No se pudo actualizar la promoción." });
  }
});

router.patch("/:id/estado", async (req, res) => {
  try {
    const anterior = await obtenerPromocion(req.params.id);
    if (!anterior) return res.status(404).json({ error: "Promoción no encontrada." });
    const actualizada = {
      ...anterior,
      activa: convertirBooleano(req.body?.activa, anterior.activa),
      actualizadoEn: new Date().toISOString(),
    };
    res.json(await actualizarPromocion(actualizada));
  } catch (error) {
    console.error("Error cambiando estado:", error);
    res.status(500).json({ error: "No se pudo cambiar el estado." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const eliminada = await eliminarPromocion(req.params.id);
    if (!eliminada) return res.status(404).json({ error: "Promoción no encontrada." });
    res.json({ mensaje: "Promoción eliminada correctamente." });
  } catch (error) {
    console.error("Error eliminando promoción:", error);
    res.status(500).json({ error: "No se pudo eliminar la promoción." });
  }
});

module.exports = router;
