const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const tiposPermitidos = [
  "logo",
  "banner",
  "producto",
];

function validarImagen(req, file, callback) {
  const formatosPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!formatosPermitidos.includes(file.mimetype)) {
    return callback(
      new Error(
        "Solo se permiten imágenes JPG, PNG o WEBP."
      )
    );
  }

  callback(null, true);
}

const subirImagen = multer({
  storage: multer.memoryStorage(),
  fileFilter: validarImagen,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

function verificarCloudinary() {
  const variablesFaltantes = [];

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    variablesFaltantes.push(
      "CLOUDINARY_CLOUD_NAME"
    );
  }

  if (!process.env.CLOUDINARY_API_KEY) {
    variablesFaltantes.push(
      "CLOUDINARY_API_KEY"
    );
  }

  if (!process.env.CLOUDINARY_API_SECRET) {
    variablesFaltantes.push(
      "CLOUDINARY_API_SECRET"
    );
  }

  return variablesFaltantes;
}

function obtenerCarpeta(tipo) {
  if (tipo === "producto") {
    return "masaos/productos";
  }

  return "masaos/configuracion";
}

function obtenerNombrePublico(tipo) {
  if (tipo === "logo") {
    return "logo-principal";
  }

  if (tipo === "banner") {
    return "banner-principal";
  }

  return undefined;
}

function subirBufferACloudinary(
  buffer,
  opciones
) {
  return new Promise((resolve, reject) => {
    const flujoSubida =
      cloudinary.uploader.upload_stream(
        opciones,
        (error, resultado) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(resultado);
        }
      );

    flujoSubida.end(buffer);
  });
}

// POST /api/multimedia/logo
// POST /api/multimedia/banner
// POST /api/multimedia/producto
router.post(
  "/:tipo",
  subirImagen.single("imagen"),
  async (req, res) => {
    try {
      const tipo = String(
        req.params.tipo || ""
      )
        .trim()
        .toLowerCase();

      if (!tiposPermitidos.includes(tipo)) {
        return res.status(400).json({
          error:
            "El tipo de imagen no es válido.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error:
            "No se recibió ninguna imagen.",
        });
      }

      const variablesFaltantes =
        verificarCloudinary();

      if (variablesFaltantes.length > 0) {
        console.error(
          "Variables de Cloudinary faltantes:",
          variablesFaltantes
        );

        return res.status(500).json({
          error:
            "Cloudinary no está configurado correctamente.",
        });
      }

      const carpeta = obtenerCarpeta(tipo);

      const publicId =
        obtenerNombrePublico(tipo);

      const opcionesSubida = {
        folder: carpeta,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
        use_filename: false,
        unique_filename: tipo === "producto",
        transformation: [
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      };

      if (publicId) {
        opcionesSubida.public_id = publicId;
      }

      const resultado =
        await subirBufferACloudinary(
          req.file.buffer,
          opcionesSubida
        );

      res.status(201).json({
        ok: true,
        mensaje:
          "Imagen subida correctamente a Cloudinary.",
        tipo,
        archivo: resultado.public_id,
        publicId: resultado.public_id,
        url: resultado.secure_url,
        formato: resultado.format,
        ancho: resultado.width,
        alto: resultado.height,
        tamanio: resultado.bytes,
      });
    } catch (error) {
      console.error(
        "Error subiendo imagen a Cloudinary:",
        error
      );

      res.status(500).json({
        error:
          error.message ||
          "No se pudo subir la imagen a Cloudinary.",
      });
    }
  }
);

router.use((error, req, res, next) => {
  console.error(
    "Error en Multimedia PRO:",
    error
  );

  if (
    error instanceof multer.MulterError &&
    error.code === "LIMIT_FILE_SIZE"
  ) {
    return res.status(400).json({
      error:
        "La imagen supera el máximo permitido de 5 MB.",
    });
  }

  if (
    error instanceof multer.MulterError
  ) {
    return res.status(400).json({
      error:
        "No se pudo procesar el archivo enviado.",
    });
  }

  res.status(400).json({
    error:
      error.message ||
      "No se pudo subir la imagen.",
  });
});

module.exports = router;