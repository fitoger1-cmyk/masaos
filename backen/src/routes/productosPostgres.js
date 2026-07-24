const express = require("express");

const {
  pool,
} = require("../config/database");

if (!pool) {
  console.log(
    "Productos: PostgreSQL no configurado; se utilizará JSON."
  );

  module.exports = require("./productos");
} else {
  const router = express.Router();

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

  function convertirBooleano(
    valor,
    valorPredeterminado = true
  ) {
    if (valor === undefined || valor === null) {
      return valorPredeterminado;
    }

    if (typeof valor === "boolean") {
      return valor;
    }

    if (typeof valor === "string") {
      const valorLimpio =
        valor.trim().toLowerCase();

      if (valorLimpio === "true") {
        return true;
      }

      if (valorLimpio === "false") {
        return false;
      }
    }

    return Boolean(valor);
  }

  function validarProducto(body = {}) {
    const nombre = String(
      body.nombre || ""
    ).trim();

    const categoria = normalizarCategoria(
      body.categoria
    );

    const precio = Number(body.precio);

    if (!nombre) {
      return "El nombre del producto es obligatorio.";
    }

    if (
      !Number.isFinite(precio) ||
      precio < 0
    ) {
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

  function normalizarFila(producto) {
    return {
      ...producto,
      id: Number(producto.id),
      precio: Number(producto.precio),
      activo: producto.activo !== false,
    };
  }

  function validarId(valor) {
    const id = Number(valor);

    return Number.isInteger(id) && id > 0
      ? id
      : null;
  }

  // GET /api/productos
  router.get("/", async (req, res) => {
    try {
      const resultado = await pool.query(`
        SELECT
          id,
          nombre,
          categoria,
          precio,
          descripcion,
          imagen,
          activo
        FROM productos
        ORDER BY id ASC
      `);

      res.json(
        resultado.rows.map(normalizarFila)
      );
    } catch (error) {
      console.error(
        "Error leyendo productos PostgreSQL:",
        error
      );

      res.status(500).json({
        error:
          "No se pudieron leer los productos.",
      });
    }
  });

  // GET /api/productos/:id
  router.get("/:id", async (req, res) => {
    try {
      const idProducto = validarId(
        req.params.id
      );

      if (!idProducto) {
        return res.status(400).json({
          error:
            "El ID del producto no es válido.",
        });
      }

      const resultado = await pool.query(
        `
          SELECT
            id,
            nombre,
            categoria,
            precio,
            descripcion,
            imagen,
            activo
          FROM productos
          WHERE id = $1
        `,
        [idProducto]
      );

      if (resultado.rowCount === 0) {
        return res.status(404).json({
          error: "Producto no encontrado.",
        });
      }

      res.json(
        normalizarFila(resultado.rows[0])
      );
    } catch (error) {
      console.error(
        "Error buscando producto PostgreSQL:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo buscar el producto.",
      });
    }
  });

  // POST /api/productos
  router.post("/", async (req, res) => {
    try {
      const errorValidacion =
        validarProducto(req.body);

      if (errorValidacion) {
        return res.status(400).json({
          error: errorValidacion,
        });
      }

      const resultado = await pool.query(
        `
          INSERT INTO productos (
            nombre,
            categoria,
            precio,
            descripcion,
            imagen,
            activo
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING
            id,
            nombre,
            categoria,
            precio,
            descripcion,
            imagen,
            activo
        `,
        [
          String(req.body.nombre).trim(),
          normalizarCategoria(
            req.body.categoria
          ),
          Number(req.body.precio),
          String(
            req.body.descripcion || ""
          ).trim(),
          String(
            req.body.imagen || ""
          ).trim(),
          convertirBooleano(
            req.body.activo,
            true
          ),
        ]
      );

      res
        .status(201)
        .json(
          normalizarFila(resultado.rows[0])
        );
    } catch (error) {
      console.error(
        "Error creando producto PostgreSQL:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo crear el producto.",
      });
    }
  });

  // PUT /api/productos/:id
  router.put("/:id", async (req, res) => {
    try {
      const idProducto = validarId(
        req.params.id
      );

      if (!idProducto) {
        return res.status(400).json({
          error:
            "El ID del producto no es válido.",
        });
      }

      const errorValidacion =
        validarProducto(req.body);

      if (errorValidacion) {
        return res.status(400).json({
          error: errorValidacion,
        });
      }

      const productoAnterior =
        await pool.query(
          `
            SELECT activo
            FROM productos
            WHERE id = $1
          `,
          [idProducto]
        );

      if (productoAnterior.rowCount === 0) {
        return res.status(404).json({
          error: "Producto no encontrado.",
        });
      }

      const activo = convertirBooleano(
        req.body.activo,
        productoAnterior.rows[0].activo !==
          false
      );

      const resultado = await pool.query(
        `
          UPDATE productos
          SET
            nombre = $1,
            categoria = $2,
            precio = $3,
            descripcion = $4,
            imagen = $5,
            activo = $6,
            actualizado_en = NOW()
          WHERE id = $7
          RETURNING
            id,
            nombre,
            categoria,
            precio,
            descripcion,
            imagen,
            activo
        `,
        [
          String(req.body.nombre).trim(),
          normalizarCategoria(
            req.body.categoria
          ),
          Number(req.body.precio),
          String(
            req.body.descripcion || ""
          ).trim(),
          String(
            req.body.imagen || ""
          ).trim(),
          activo,
          idProducto,
        ]
      );

      res.json(
        normalizarFila(resultado.rows[0])
      );
    } catch (error) {
      console.error(
        "Error actualizando producto PostgreSQL:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo actualizar el producto.",
      });
    }
  });

  // PATCH /api/productos/:id/estado
  router.patch(
    "/:id/estado",
    async (req, res) => {
      try {
        const idProducto = validarId(
          req.params.id
        );

        if (!idProducto) {
          return res.status(400).json({
            error:
              "El ID del producto no es válido.",
          });
        }

        const productoAnterior =
          await pool.query(
            `
              SELECT activo
              FROM productos
              WHERE id = $1
            `,
            [idProducto]
          );

        if (
          productoAnterior.rowCount === 0
        ) {
          return res.status(404).json({
            error:
              "Producto no encontrado.",
          });
        }

        const activo = convertirBooleano(
          req.body.activo,
          productoAnterior.rows[0].activo !==
            false
        );

        const resultado = await pool.query(
          `
            UPDATE productos
            SET
              activo = $1,
              actualizado_en = NOW()
            WHERE id = $2
            RETURNING
              id,
              nombre,
              categoria,
              precio,
              descripcion,
              imagen,
              activo
          `,
          [activo, idProducto]
        );

        res.json(
          normalizarFila(resultado.rows[0])
        );
      } catch (error) {
        console.error(
          "Error cambiando estado PostgreSQL:",
          error
        );

        res.status(500).json({
          error:
            "No se pudo cambiar el estado del producto.",
        });
      }
    }
  );

  // DELETE /api/productos/:id
  router.delete("/:id", async (req, res) => {
    try {
      const idProducto = validarId(
        req.params.id
      );

      if (!idProducto) {
        return res.status(400).json({
          error:
            "El ID del producto no es válido.",
        });
      }

      const resultado = await pool.query(
        `
          DELETE FROM productos
          WHERE id = $1
          RETURNING id
        `,
        [idProducto]
      );

      if (resultado.rowCount === 0) {
        return res.status(404).json({
          error: "Producto no encontrado.",
        });
      }

      res.json({
        ok: true,
        mensaje:
          "Producto eliminado correctamente.",
      });
    } catch (error) {
      console.error(
        "Error eliminando producto PostgreSQL:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo eliminar el producto.",
      });
    }
  });

  module.exports = router;
}