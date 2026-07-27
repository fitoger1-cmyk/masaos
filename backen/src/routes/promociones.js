const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const promocionesPath = path.join(
  __dirname,
  "../controllers/promociones.json"
);

function leerPromociones() {
  try {
    if (!fs.existsSync(promocionesPath)) {
      fs.writeFileSync(
        promocionesPath,
        JSON.stringify([], null, 2),
        "utf-8"
      );

      return [];
    }

    const contenido = fs.readFileSync(
      promocionesPath,
      "utf-8"
    );

    if (!contenido.trim()) {
      return [];
    }

    const promociones = JSON.parse(contenido);

    return Array.isArray(promociones)
      ? promociones
      : [];
  } catch (error) {
    console.error(
      "Error leyendo promociones:",
      error
    );

    return [];
  }
}

function guardarPromociones(promociones) {
  fs.writeFileSync(
    promocionesPath,
    JSON.stringify(promociones, null, 2),
    "utf-8"
  );
}

function limpiarTexto(valor) {
  return typeof valor === "string"
    ? valor.trim()
    : "";
}

function convertirNumero(valor) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : 0;
}

function convertirBooleano(
  valor,
  valorPredeterminado = false
) {
  if (typeof valor === "boolean") {
    return valor;
  }

  if (valor === "true") {
    return true;
  }

  if (valor === "false") {
    return false;
  }

  return valorPredeterminado;
}

function normalizarPromocion(body = {}, anterior = {}) {
  return {
    ...anterior,

    nombre: limpiarTexto(
      body.nombre ?? anterior.nombre
    ),

    descripcion: limpiarTexto(
      body.descripcion ?? anterior.descripcion
    ),

    imagen: limpiarTexto(
      body.imagen ?? anterior.imagen
    ),

    precioAnterior: convertirNumero(
      body.precioAnterior ??
        anterior.precioAnterior
    ),

    precioPromocional: convertirNumero(
      body.precioPromocional ??
        anterior.precioPromocional
    ),

    inicio: limpiarTexto(
      body.inicio ?? anterior.inicio
    ),

    fin: limpiarTexto(
      body.fin ?? anterior.fin
    ),

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

    activa: convertirBooleano(
      body.activa,
      anterior.activa ?? true
    ),

    actualizadoEn: new Date().toISOString(),
  };
}

// Listar promociones
router.get("/", (req, res) => {
  const promociones = leerPromociones();

  res.json(promociones);
});

// Obtener una promoción
router.get("/:id", (req, res) => {
  const promociones = leerPromociones();

  const promocion = promociones.find(
    (item) =>
      String(item.id) === String(req.params.id)
  );

  if (!promocion) {
    return res.status(404).json({
      error: "Promoción no encontrada.",
    });
  }

  res.json(promocion);
});

// Crear promoción
router.post("/", (req, res) => {
  try {
    const promociones = leerPromociones();

    const nombre = limpiarTexto(
      req.body?.nombre
    );

    if (!nombre) {
      return res.status(400).json({
        error:
          "El nombre de la promoción es obligatorio.",
      });
    }

    const nuevaPromocion = normalizarPromocion(
      req.body
    );

    nuevaPromocion.id = Date.now();
    nuevaPromocion.creadoEn =
      new Date().toISOString();

    promociones.push(nuevaPromocion);
    guardarPromociones(promociones);

    res.status(201).json(nuevaPromocion);
  } catch (error) {
    console.error(
      "Error creando promoción:",
      error
    );

    res.status(500).json({
      error:
        "No se pudo crear la promoción.",
    });
  }
});

// Actualizar promoción
router.put("/:id", (req, res) => {
  try {
    const promociones = leerPromociones();

    const indice = promociones.findIndex(
      (item) =>
        String(item.id) ===
        String(req.params.id)
    );

    if (indice === -1) {
      return res.status(404).json({
        error: "Promoción no encontrada.",
      });
    }

    const promocionActualizada =
      normalizarPromocion(
        req.body,
        promociones[indice]
      );

    promocionActualizada.id =
      promociones[indice].id;

    promocionActualizada.creadoEn =
      promociones[indice].creadoEn;

    promociones[indice] =
      promocionActualizada;

    guardarPromociones(promociones);

    res.json(promocionActualizada);
  } catch (error) {
    console.error(
      "Error actualizando promoción:",
      error
    );

    res.status(500).json({
      error:
        "No se pudo actualizar la promoción.",
    });
  }
});

// Activar o desactivar
router.patch("/:id/estado", (req, res) => {
  try {
    const promociones = leerPromociones();

    const indice = promociones.findIndex(
      (item) =>
        String(item.id) ===
        String(req.params.id)
    );

    if (indice === -1) {
      return res.status(404).json({
        error: "Promoción no encontrada.",
      });
    }

    promociones[indice] = {
      ...promociones[indice],

      activa: convertirBooleano(
        req.body?.activa,
        promociones[indice].activa
      ),

      actualizadoEn:
        new Date().toISOString(),
    };

    guardarPromociones(promociones);

    res.json(promociones[indice]);
  } catch (error) {
    console.error(
      "Error cambiando estado:",
      error
    );

    res.status(500).json({
      error:
        "No se pudo cambiar el estado.",
    });
  }
});

// Eliminar promoción
router.delete("/:id", (req, res) => {
  try {
    const promociones = leerPromociones();

    const existe = promociones.some(
      (item) =>
        String(item.id) ===
        String(req.params.id)
    );

    if (!existe) {
      return res.status(404).json({
        error: "Promoción no encontrada.",
      });
    }

    const promocionesActualizadas =
      promociones.filter(
        (item) =>
          String(item.id) !==
          String(req.params.id)
      );

    guardarPromociones(
      promocionesActualizadas
    );

    res.json({
      mensaje:
        "Promoción eliminada correctamente.",
    });
  } catch (error) {
    console.error(
      "Error eliminando promoción:",
      error
    );

    res.status(500).json({
      error:
        "No se pudo eliminar la promoción.",
    });
  }
});

module.exports = router;