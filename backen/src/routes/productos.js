const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const productosPath = path.join(
  __dirname,
  "..",
  "controllers",
  "productos.json"
);

/**
 * Normaliza categorías escritas de distintas maneras.
 *
 * Ejemplos:
 * pizza, pizzas, PIZZA, Pizza Grande -> Pizza
 * focaccia, focaccias -> Focaccia
 */
function normalizarCategoria(categoria = "") {
  const categoriaLimpia = String(categoria)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!categoriaLimpia) {
    return "Sin categoría";
  }

  if (
    categoriaLimpia === "pizza" ||
    categoriaLimpia === "pizzas" ||
    categoriaLimpia.startsWith("pizza ")
  ) {
    return "Pizza";
  }

  if (
    categoriaLimpia === "focaccia" ||
    categoriaLimpia === "focaccias" ||
    categoriaLimpia.startsWith("focaccia ")
  ) {
    return "Focaccia";
  }

  if (
    categoriaLimpia === "postre" ||
    categoriaLimpia === "postres" ||
    categoriaLimpia.startsWith("postre ")
  ) {
    return "Postre";
  }

  if (
    categoriaLimpia === "bebida" ||
    categoriaLimpia === "bebidas" ||
    categoriaLimpia.startsWith("bebida ")
  ) {
    return "Bebida";
  }

  if (
    categoriaLimpia === "sandwich" ||
    categoriaLimpia === "sandwiches" ||
    categoriaLimpia === "sándwich" ||
    categoriaLimpia === "sándwiches"
  ) {
    return "Sándwich";
  }

  return categoriaLimpia
    .split(" ")
    .map(
      (palabra) =>
        palabra.charAt(0).toUpperCase() +
        palabra.slice(1)
    )
    .join(" ");
}

function normalizarImagen(imagen = "") {
  return String(imagen).trim();
}

function convertirBooleano(valor, valorPredeterminado = true) {
  if (valor === undefined || valor === null) {
    return valorPredeterminado;
  }

  if (typeof valor === "boolean") {
    return valor;
  }

  if (typeof valor === "string") {
    const valorLimpio = valor.trim().toLowerCase();

    if (valorLimpio === "true") {
      return true;
    }

    if (valorLimpio === "false") {
      return false;
    }
  }

  return Boolean(valor);
}

function normalizarProducto(producto = {}) {
  return {
    ...producto,
    id: Number(producto.id),
    nombre: String(producto.nombre || "").trim(),
    categoria: normalizarCategoria(producto.categoria),
    precio: Number(producto.precio) || 0,
    descripcion: String(producto.descripcion || "").trim(),
    imagen: normalizarImagen(producto.imagen),
    activo: convertirBooleano(producto.activo, true),
  };
}

function guardarProductos(productos) {
  fs.writeFileSync(
    productosPath,
    JSON.stringify(productos, null, 2),
    "utf8"
  );
}

function leerProductos() {
  try {
    if (!fs.existsSync(productosPath)) {
      guardarProductos([]);
      return [];
    }

    const contenido = fs
      .readFileSync(productosPath, "utf8")
      .trim();

    if (!contenido) {
      return [];
    }

    const datos = JSON.parse(contenido);

    if (!Array.isArray(datos)) {
      throw new Error(
        "El archivo productos.json debe contener un arreglo."
      );
    }

    const productosNormalizados =
      datos.map(normalizarProducto);

    const huboCambios =
      JSON.stringify(datos) !==
      JSON.stringify(productosNormalizados);

    if (huboCambios) {
      guardarProductos(productosNormalizados);
    }

    return productosNormalizados;
  } catch (error) {
    console.error(
      "Error leyendo productos.json:",
      error
    );

    throw error;
  }
}

function validarProducto(body = {}) {
  const nombre = String(body.nombre || "").trim();
  const categoria = normalizarCategoria(body.categoria);
  const precio = Number(body.precio);

  if (!nombre) {
    return "El nombre del producto es obligatorio.";
  }

  if (!Number.isFinite(precio) || precio < 0) {
    return "El precio debe ser un número válido.";
  }

  if (
    !categoria ||
    categoria === "Sin categoría"
  ) {
    return "La categoría es obligatoria.";
  }

  return null;
}

// GET /api/productos
router.get("/", (req, res) => {
  try {
    const productos = leerProductos();

    res.json(productos);
  } catch (error) {
    res.status(500).json({
      error: "No se pudieron leer los productos.",
    });
  }
});

// GET /api/productos/:id
router.get("/:id", (req, res) => {
  try {
    const idProducto = Number(req.params.id);

    if (!Number.isFinite(idProducto)) {
      return res.status(400).json({
        error: "El ID del producto no es válido.",
      });
    }

    const productos = leerProductos();

    const producto = productos.find(
      (item) => Number(item.id) === idProducto
    );

    if (!producto) {
      return res.status(404).json({
        error: "Producto no encontrado.",
      });
    }

    res.json(producto);
  } catch (error) {
    console.error(
      "Error buscando producto:",
      error
    );

    res.status(500).json({
      error: "No se pudo buscar el producto.",
    });
  }
});

// POST /api/productos
router.post("/", (req, res) => {
  try {
    const errorValidacion =
      validarProducto(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        error: errorValidacion,
      });
    }

    const productos = leerProductos();

    const idsValidos = productos
      .map((producto) => Number(producto.id))
      .filter(Number.isFinite);

    const nuevoId =
      idsValidos.length > 0
        ? Math.max(...idsValidos) + 1
        : 1;

    const nuevoProducto = {
      id: nuevoId,
      nombre: String(req.body.nombre).trim(),
      categoria: normalizarCategoria(
        req.body.categoria
      ),
      precio: Number(req.body.precio),
      descripcion: String(
        req.body.descripcion || ""
      ).trim(),
      imagen: normalizarImagen(req.body.imagen),
      activo: convertirBooleano(
        req.body.activo,
        true
      ),
    };

    productos.push(nuevoProducto);
    guardarProductos(productos);

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error(
      "Error creando producto:",
      error
    );

    res.status(500).json({
      error: "No se pudo crear el producto.",
    });
  }
});

// PUT /api/productos/:id
router.put("/:id", (req, res) => {
  try {
    const idProducto = Number(req.params.id);

    if (!Number.isFinite(idProducto)) {
      return res.status(400).json({
        error: "El ID del producto no es válido.",
      });
    }

    const errorValidacion =
      validarProducto(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        error: errorValidacion,
      });
    }

    const productos = leerProductos();

    const indiceProducto = productos.findIndex(
      (producto) =>
        Number(producto.id) === idProducto
    );

    if (indiceProducto === -1) {
      return res.status(404).json({
        error: "Producto no encontrado.",
      });
    }

    const productoAnterior =
      productos[indiceProducto];

    const productoActualizado = {
      ...productoAnterior,
      id: idProducto,
      nombre: String(req.body.nombre).trim(),
      categoria: normalizarCategoria(
        req.body.categoria
      ),
      precio: Number(req.body.precio),
      descripcion: String(
        req.body.descripcion || ""
      ).trim(),
      imagen: normalizarImagen(req.body.imagen),
      activo: convertirBooleano(
        req.body.activo,
        productoAnterior.activo !== false
      ),
    };

    productos[indiceProducto] =
      productoActualizado;

    guardarProductos(productos);

    res.json(productoActualizado);
  } catch (error) {
    console.error(
      "Error actualizando producto:",
      error
    );

    res.status(500).json({
      error: "No se pudo actualizar el producto.",
    });
  }
});

// PATCH /api/productos/:id/estado
router.patch("/:id/estado", (req, res) => {
  try {
    const idProducto = Number(req.params.id);

    if (!Number.isFinite(idProducto)) {
      return res.status(400).json({
        error: "El ID del producto no es válido.",
      });
    }

    const productos = leerProductos();

    const indiceProducto = productos.findIndex(
      (producto) =>
        Number(producto.id) === idProducto
    );

    if (indiceProducto === -1) {
      return res.status(404).json({
        error: "Producto no encontrado.",
      });
    }

    productos[indiceProducto].activo =
      convertirBooleano(
        req.body.activo,
        productos[indiceProducto].activo !== false
      );

    guardarProductos(productos);

    res.json(productos[indiceProducto]);
  } catch (error) {
    console.error(
      "Error cambiando estado del producto:",
      error
    );

    res.status(500).json({
      error:
        "No se pudo cambiar el estado del producto.",
    });
  }
});

// DELETE /api/productos/:id
router.delete("/:id", (req, res) => {
  try {
    const idProducto = Number(req.params.id);

    if (!Number.isFinite(idProducto)) {
      return res.status(400).json({
        error: "El ID del producto no es válido.",
      });
    }

    const productos = leerProductos();

    const existeProducto = productos.some(
      (producto) =>
        Number(producto.id) === idProducto
    );

    if (!existeProducto) {
      return res.status(404).json({
        error: "Producto no encontrado.",
      });
    }

    const productosActualizados =
      productos.filter(
        (producto) =>
          Number(producto.id) !== idProducto
      );

    guardarProductos(productosActualizados);

    res.json({
      ok: true,
      mensaje:
        "Producto eliminado correctamente.",
    });
  } catch (error) {
    console.error(
      "Error eliminando producto:",
      error
    );

    res.status(500).json({
      error: "No se pudo eliminar el producto.",
    });
  }
});

module.exports = router;