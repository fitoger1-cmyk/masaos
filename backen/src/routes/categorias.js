const express = require("express");
const fs = require("fs");
const path = require("path");
const { pool } = require("../config/database");

const router = express.Router();
const categoriasPath = path.join(
  __dirname,
  "..",
  "controllers",
  "categorias.json"
);
const productosPath = path.join(
  __dirname,
  "..",
  "controllers",
  "productos.json"
);

function texto(valor = "") {
  return String(valor).trim();
}

function booleano(valor, predeterminado = true) {
  if (valor === undefined || valor === null) return predeterminado;
  if (typeof valor === "string") return valor.toLowerCase() !== "false";
  return Boolean(valor);
}

function normalizar(categoria) {
  return {
    ...categoria,
    id: Number(categoria.id),
    nombre: texto(categoria.nombre),
    descripcion: texto(categoria.descripcion),
    imagen: texto(categoria.imagen),
    icono: texto(categoria.icono),
    orden: Number(categoria.orden) || 0,
    activo: categoria.activo !== false,
  };
}

function leerJson() {
  if (!fs.existsSync(categoriasPath)) return [];
  const datos = JSON.parse(fs.readFileSync(categoriasPath, "utf8") || "[]");
  return Array.isArray(datos) ? datos.map(normalizar) : [];
}

function guardarJson(categorias) {
  fs.writeFileSync(
    categoriasPath,
    JSON.stringify(categorias, null, 2),
    "utf8"
  );
}

function datosBody(body = {}, anterior = {}) {
  return {
    nombre: texto(body.nombre ?? anterior.nombre),
    descripcion: texto(body.descripcion ?? anterior.descripcion),
    imagen: texto(body.imagen ?? anterior.imagen),
    icono: texto(body.icono ?? anterior.icono),
    orden: Number(body.orden ?? anterior.orden) || 0,
    activo: booleano(body.activo, anterior.activo ?? true),
  };
}

router.get("/", async (req, res) => {
  try {
    if (!pool) {
      return res.json(
        leerJson().sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
      );
    }
    const resultado = await pool.query(`
      SELECT id, nombre, descripcion, imagen, icono, orden, activo
      FROM categorias
      ORDER BY orden ASC, nombre ASC
    `);
    res.json(resultado.rows.map(normalizar));
  } catch (error) {
    console.error("Error listando categorías:", error);
    res.status(500).json({ error: "No se pudieron cargar las categorías." });
  }
});

router.post("/", async (req, res) => {
  try {
    const categoria = datosBody(req.body);
    if (!categoria.nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio." });
    }

    if (!pool) {
      const categorias = leerJson();
      if (categorias.some((item) => item.nombre.toLowerCase() === categoria.nombre.toLowerCase())) {
        return res.status(409).json({ error: "La categoría ya existe." });
      }
      const nueva = {
        id: categorias.length ? Math.max(...categorias.map((item) => item.id)) + 1 : 1,
        ...categoria,
        orden: categoria.orden || categorias.length + 1,
      };
      categorias.push(nueva);
      guardarJson(categorias);
      return res.status(201).json(nueva);
    }

    const resultado = await pool.query(
      `
        INSERT INTO categorias (nombre, descripcion, imagen, icono, orden, activo)
        VALUES ($1, $2, $3, $4,
          COALESCE(NULLIF($5, 0), (SELECT COALESCE(MAX(orden), 0) + 1 FROM categorias)),
          $6)
        RETURNING id, nombre, descripcion, imagen, icono, orden, activo
      `,
      [categoria.nombre, categoria.descripcion, categoria.imagen, categoria.icono, categoria.orden, categoria.activo]
    );
    res.status(201).json(normalizar(resultado.rows[0]));
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "La categoría ya existe." });
    }
    console.error("Error creando categoría:", error);
    res.status(500).json({ error: "No se pudo crear la categoría." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido." });

    if (!pool) {
      const categorias = leerJson();
      const indice = categorias.findIndex((item) => item.id === id);
      if (indice < 0) return res.status(404).json({ error: "Categoría no encontrada." });
      const anterior = categorias[indice];
      const actualizada = { id, ...datosBody(req.body, anterior) };
      if (!actualizada.nombre) return res.status(400).json({ error: "El nombre es obligatorio." });
      categorias[indice] = actualizada;
      guardarJson(categorias);

      if (
        anterior.nombre !== actualizada.nombre &&
        fs.existsSync(productosPath)
      ) {
        const productos = JSON.parse(
          fs.readFileSync(productosPath, "utf8") || "[]"
        );
        productos.forEach((producto) => {
          if (
            texto(producto.categoria).toLowerCase() ===
            anterior.nombre.toLowerCase()
          ) {
            producto.categoria = actualizada.nombre;
          }
        });
        fs.writeFileSync(
          productosPath,
          JSON.stringify(productos, null, 2),
          "utf8"
        );
      }
      return res.json(actualizada);
    }

    const anterior = await pool.query("SELECT * FROM categorias WHERE id = $1", [id]);
    if (!anterior.rowCount) return res.status(404).json({ error: "Categoría no encontrada." });
    const categoria = datosBody(req.body, anterior.rows[0]);
    const nombreAnterior = anterior.rows[0].nombre;
    const resultado = await pool.query(
      `
        UPDATE categorias
        SET nombre = $1, descripcion = $2, imagen = $3, icono = $4,
            orden = $5, activo = $6, actualizado_en = NOW()
        WHERE id = $7
        RETURNING id, nombre, descripcion, imagen, icono, orden, activo
      `,
      [categoria.nombre, categoria.descripcion, categoria.imagen, categoria.icono, categoria.orden, categoria.activo, id]
    );
    if (nombreAnterior !== categoria.nombre) {
      await pool.query("UPDATE productos SET categoria = $1 WHERE LOWER(categoria) = LOWER($2)", [categoria.nombre, nombreAnterior]);
    }
    res.json(normalizar(resultado.rows[0]));
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "La categoría ya existe." });
    console.error("Error actualizando categoría:", error);
    res.status(500).json({ error: "No se pudo actualizar la categoría." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!pool) {
      const categorias = leerJson();
      const categoria = categorias.find((item) => item.id === id);
      if (!categoria) return res.status(404).json({ error: "Categoría no encontrada." });
      const productos = fs.existsSync(productosPath)
        ? JSON.parse(fs.readFileSync(productosPath, "utf8") || "[]")
        : [];
      const enUso = productos.some(
        (producto) =>
          texto(producto.categoria).toLowerCase() ===
          categoria.nombre.toLowerCase()
      );
      if (enUso) {
        return res.status(409).json({ error: "No se puede eliminar: tiene productos asignados. Podés desactivarla." });
      }
      categorias.splice(categorias.indexOf(categoria), 1);
      guardarJson(categorias);
      return res.json({ ok: true });
    }
    const uso = await pool.query(
      `SELECT COUNT(*)::INTEGER AS cantidad FROM productos p
       JOIN categorias c ON LOWER(p.categoria) = LOWER(c.nombre)
       WHERE c.id = $1`,
      [id]
    );
    if (uso.rows[0].cantidad > 0) {
      return res.status(409).json({ error: "No se puede eliminar: tiene productos asignados. Podés desactivarla." });
    }
    const resultado = await pool.query("DELETE FROM categorias WHERE id = $1", [id]);
    if (!resultado.rowCount) return res.status(404).json({ error: "Categoría no encontrada." });
    res.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando categoría:", error);
    res.status(500).json({ error: "No se pudo eliminar la categoría." });
  }
});

module.exports = router;
