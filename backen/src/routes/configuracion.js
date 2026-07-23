const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const configuracionPath = path.join(
  __dirname,
  "..",
  "controllers",
  "configuracion.json"
);

const configuracionInicial = {
  nombre: "El Club de la Masa G",
  telefono: "541140480762",
  whatsapp: true,
  instagram: "clubdelamasag",
  facebook: "",
  tiktok: "",
  direccion: "Pilar, Buenos Aires",
  envio: "Sin cargo",
  costoEnvio: 0,
  radioEntregaKm: 10,
  textoPrincipal: "Las mejores pizzas de Pilar",
  textoSecundario:
    "Pizzas artesanales, focaccias y postres elaborados con ingredientes de calidad.",
  horarios: {
    mediodia: "11:00 - 16:00",
    noche: "19:00 - 23:00",
  },
  diasAbiertos: {
    lunes: true,
    martes: true,
    miercoles: true,
    jueves: true,
    viernes: true,
    sabado: true,
    domingo: true,
  },
  mercadoPago: true,
  pedidosYa: true,
  logo: "/imagenes/logo.png",
  banner: "/imagenes/banner.jpg",
  colorPrincipal: "#b71c1c",
  colorSecundario: "#f5f5f5",
  activo: true,
};

function crearArchivoConfiguracion() {
  const carpetaControllers = path.dirname(
    configuracionPath
  );

  if (!fs.existsSync(carpetaControllers)) {
    fs.mkdirSync(carpetaControllers, {
      recursive: true,
    });
  }

  fs.writeFileSync(
    configuracionPath,
    JSON.stringify(configuracionInicial, null, 2),
    "utf8"
  );
}

function leerConfiguracion() {
  try {
    if (!fs.existsSync(configuracionPath)) {
      crearArchivoConfiguracion();
      return configuracionInicial;
    }

    const contenido = fs
      .readFileSync(configuracionPath, "utf8")
      .trim();

    if (!contenido) {
      crearArchivoConfiguracion();
      return configuracionInicial;
    }

    const configuracion = JSON.parse(contenido);

    if (
      typeof configuracion !== "object" ||
      Array.isArray(configuracion)
    ) {
      throw new Error(
        "configuracion.json debe contener un objeto."
      );
    }

    return {
      ...configuracionInicial,
      ...configuracion,
      horarios: {
        ...configuracionInicial.horarios,
        ...(configuracion.horarios || {}),
      },
      diasAbiertos: {
        ...configuracionInicial.diasAbiertos,
        ...(configuracion.diasAbiertos || {}),
      },
    };
  } catch (error) {
    console.error(
      "Error leyendo configuracion.json:",
      error
    );

    throw error;
  }
}

function guardarConfiguracion(configuracion) {
  fs.writeFileSync(
    configuracionPath,
    JSON.stringify(configuracion, null, 2),
    "utf8"
  );
}

function convertirBooleano(
  valor,
  valorPredeterminado = false
) {
  if (valor === undefined || valor === null) {
    return valorPredeterminado;
  }

  if (typeof valor === "boolean") {
    return valor;
  }

  if (typeof valor === "string") {
    const valorLimpio = valor
      .trim()
      .toLowerCase();

    if (valorLimpio === "true") {
      return true;
    }

    if (valorLimpio === "false") {
      return false;
    }
  }

  return Boolean(valor);
}

function limpiarTexto(valor = "") {
  return String(valor).trim();
}

function validarConfiguracion(body = {}) {
  const nombre = limpiarTexto(body.nombre);
  const telefono = limpiarTexto(body.telefono);

  if (!nombre) {
    return "El nombre del negocio es obligatorio.";
  }

  if (!telefono) {
    return "El teléfono es obligatorio.";
  }

  const costoEnvio = Number(body.costoEnvio);

  if (
    !Number.isFinite(costoEnvio) ||
    costoEnvio < 0
  ) {
    return "El costo de envío debe ser un número válido.";
  }

  const radioEntregaKm = Number(
    body.radioEntregaKm
  );

  if (
    !Number.isFinite(radioEntregaKm) ||
    radioEntregaKm < 0
  ) {
    return "El radio de entrega debe ser un número válido.";
  }

  return null;
}

function normalizarConfiguracion(
  body,
  configuracionAnterior
) {
  return {
    ...configuracionAnterior,

    nombre: limpiarTexto(body.nombre),

    telefono: limpiarTexto(body.telefono),

    whatsapp: convertirBooleano(
      body.whatsapp,
      configuracionAnterior.whatsapp
    ),

    instagram: limpiarTexto(body.instagram),

    facebook: limpiarTexto(body.facebook),

    tiktok: limpiarTexto(body.tiktok),

    direccion: limpiarTexto(body.direccion),

    envio: limpiarTexto(body.envio),

    costoEnvio: Number(body.costoEnvio),

    radioEntregaKm: Number(body.radioEntregaKm),

    textoPrincipal: limpiarTexto(
      body.textoPrincipal
    ),

    textoSecundario: limpiarTexto(
      body.textoSecundario
    ),

    horarios: {
      mediodia: limpiarTexto(
        body.horarios?.mediodia
      ),
      noche: limpiarTexto(
        body.horarios?.noche
      ),
    },

    diasAbiertos: {
      lunes: convertirBooleano(
        body.diasAbiertos?.lunes,
        configuracionAnterior.diasAbiertos.lunes
      ),

      martes: convertirBooleano(
        body.diasAbiertos?.martes,
        configuracionAnterior.diasAbiertos.martes
      ),

      miercoles: convertirBooleano(
        body.diasAbiertos?.miercoles,
        configuracionAnterior.diasAbiertos
          .miercoles
      ),

      jueves: convertirBooleano(
        body.diasAbiertos?.jueves,
        configuracionAnterior.diasAbiertos.jueves
      ),

      viernes: convertirBooleano(
        body.diasAbiertos?.viernes,
        configuracionAnterior.diasAbiertos
          .viernes
      ),

      sabado: convertirBooleano(
        body.diasAbiertos?.sabado,
        configuracionAnterior.diasAbiertos.sabado
      ),

      domingo: convertirBooleano(
        body.diasAbiertos?.domingo,
        configuracionAnterior.diasAbiertos
          .domingo
      ),
    },

    mercadoPago: convertirBooleano(
      body.mercadoPago,
      configuracionAnterior.mercadoPago
    ),

    pedidosYa: convertirBooleano(
      body.pedidosYa,
      configuracionAnterior.pedidosYa
    ),

    logo: limpiarTexto(body.logo),

    banner: limpiarTexto(body.banner),

    colorPrincipal: limpiarTexto(
      body.colorPrincipal
    ),

    colorSecundario: limpiarTexto(
      body.colorSecundario
    ),

    activo: convertirBooleano(
      body.activo,
      configuracionAnterior.activo
    ),

    actualizadoEn: new Date().toISOString(),
  };
}

// GET /api/configuracion
router.get("/", (req, res) => {
  try {
    const configuracion =
      leerConfiguracion();

    res.json(configuracion);
  } catch (error) {
    res.status(500).json({
      error:
        "No se pudo leer la configuración.",
    });
  }
});

// PUT /api/configuracion
router.put("/", (req, res) => {
  try {
    const errorValidacion =
      validarConfiguracion(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        error: errorValidacion,
      });
    }

    const configuracionAnterior =
      leerConfiguracion();

    const configuracionActualizada =
      normalizarConfiguracion(
        req.body,
        configuracionAnterior
      );

    guardarConfiguracion(
      configuracionActualizada
    );

    res.json({
      ok: true,
      mensaje:
        "Configuración actualizada correctamente.",
      configuracion:
        configuracionActualizada,
    });
  } catch (error) {
    console.error(
      "Error actualizando configuración:",
      error
    );

    res.status(500).json({
      error:
        "No se pudo actualizar la configuración.",
    });
  }
});

// PATCH /api/configuracion/estado
router.patch("/estado", (req, res) => {
  try {
    const configuracion =
      leerConfiguracion();

    configuracion.activo =
      convertirBooleano(
        req.body.activo,
        configuracion.activo
      );

    configuracion.actualizadoEn =
      new Date().toISOString();

    guardarConfiguracion(configuracion);

    res.json({
      ok: true,
      configuracion,
    });
  } catch (error) {
    console.error(
      "Error cambiando estado del negocio:",
      error
    );

    res.status(500).json({
      error:
        "No se pudo cambiar el estado del negocio.",
    });
  }
});

module.exports = router;