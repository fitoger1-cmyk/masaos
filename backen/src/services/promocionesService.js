const fs = require("fs");
const path = require("path");
const { pool } = require("../config/database");

const promocionesPath = path.join(
  __dirname,
  "..",
  "controllers",
  "promociones.json"
);

let inicializacionPendiente = null;

function leerJSON() {
  try {
    const contenido = fs.readFileSync(promocionesPath, "utf8").trim();
    if (!contenido) return [];
    const promociones = JSON.parse(contenido);
    return Array.isArray(promociones) ? promociones : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function guardarJSON(promociones) {
  fs.mkdirSync(path.dirname(promocionesPath), { recursive: true });
  fs.writeFileSync(promocionesPath, JSON.stringify(promociones, null, 2), "utf8");
}

function fechaValida(valor, predeterminada = null) {
  if (!valor) return predeterminada;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? predeterminada : fecha.toISOString();
}

function desdeFila(fila) {
  return {
    id: Number(fila.id),
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    imagen: fila.imagen,
    precioAnterior: Number(fila.precio_anterior),
    precioPromocional: Number(fila.precio_promocional),
    inicio: fila.inicio,
    fin: fila.fin,
    mostrarInicio: fila.mostrar_inicio,
    mostrarCarrusel: fila.mostrar_carrusel,
    mostrarDestacados: fila.mostrar_destacados,
    mostrarPopup: fila.mostrar_popup,
    activa: fila.activa,
    creadoEn: fila.creado_en?.toISOString?.() || fila.creado_en,
    actualizadoEn: fila.actualizado_en?.toISOString?.() || fila.actualizado_en,
  };
}

const columnasInsert = `
  id, nombre, descripcion, imagen, precio_anterior, precio_promocional,
  inicio, fin, mostrar_inicio, mostrar_carrusel, mostrar_destacados,
  mostrar_popup, activa, creado_en, actualizado_en
`;

function valoresPromocion(promocion) {
  return [
    promocion.id,
    promocion.nombre,
    promocion.descripcion,
    promocion.imagen,
    promocion.precioAnterior,
    promocion.precioPromocional,
    promocion.inicio,
    promocion.fin,
    promocion.mostrarInicio,
    promocion.mostrarCarrusel,
    promocion.mostrarDestacados,
    promocion.mostrarPopup,
    promocion.activa,
    fechaValida(promocion.creadoEn, new Date().toISOString()),
    fechaValida(promocion.actualizadoEn, new Date().toISOString()),
  ];
}

async function inicializarPromociones() {
  if (!pool) return { postgres: false, migrados: 0 };

  if (!inicializacionPendiente) {
    inicializacionPendiente = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS promociones_web (
          id BIGINT PRIMARY KEY,
          nombre VARCHAR(160) NOT NULL,
          descripcion TEXT NOT NULL DEFAULT '',
          imagen TEXT NOT NULL DEFAULT '',
          precio_anterior NUMERIC(12,2) NOT NULL DEFAULT 0,
          precio_promocional NUMERIC(12,2) NOT NULL DEFAULT 0,
          inicio VARCHAR(40) NOT NULL DEFAULT '',
          fin VARCHAR(40) NOT NULL DEFAULT '',
          mostrar_inicio BOOLEAN NOT NULL DEFAULT TRUE,
          mostrar_carrusel BOOLEAN NOT NULL DEFAULT FALSE,
          mostrar_destacados BOOLEAN NOT NULL DEFAULT FALSE,
          mostrar_popup BOOLEAN NOT NULL DEFAULT FALSE,
          activa BOOLEAN NOT NULL DEFAULT TRUE,
          creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      const cantidad = await pool.query("SELECT COUNT(*)::int AS total FROM promociones_web");
      let migrados = 0;

      if (cantidad.rows[0].total === 0) {
        for (const promocion of leerJSON()) {
          const datos = {
            descripcion: "",
            imagen: "",
            precioAnterior: 0,
            precioPromocional: 0,
            inicio: "",
            fin: "",
            mostrarInicio: true,
            mostrarCarrusel: false,
            mostrarDestacados: false,
            mostrarPopup: false,
            activa: true,
            ...promocion,
            id: Number(promocion.id) || Date.now() + migrados,
          };

          await pool.query(
            `INSERT INTO promociones_web (${columnasInsert})
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
             ON CONFLICT (id) DO NOTHING`,
            valoresPromocion(datos)
          );
          migrados += 1;
        }
      }

      console.log(`Promociones web: tabla lista. Migradas ahora: ${migrados}.`);
      return { postgres: true, migrados };
    })().catch((error) => {
      inicializacionPendiente = null;
      throw error;
    });
  }

  return inicializacionPendiente;
}

async function listarPromociones() {
  if (!pool) return leerJSON();
  await inicializarPromociones();
  const resultado = await pool.query(
    "SELECT * FROM promociones_web ORDER BY creado_en DESC, id DESC"
  );
  return resultado.rows.map(desdeFila);
}

async function obtenerPromocion(id) {
  if (!pool) return leerJSON().find((item) => String(item.id) === String(id)) || null;
  await inicializarPromociones();
  const resultado = await pool.query("SELECT * FROM promociones_web WHERE id = $1", [id]);
  return resultado.rows[0] ? desdeFila(resultado.rows[0]) : null;
}

async function crearPromocion(promocion) {
  if (!pool) {
    const promociones = leerJSON();
    promociones.push(promocion);
    guardarJSON(promociones);
    return promocion;
  }
  await inicializarPromociones();
  const resultado = await pool.query(
    `INSERT INTO promociones_web (${columnasInsert})
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    valoresPromocion(promocion)
  );
  return desdeFila(resultado.rows[0]);
}

async function actualizarPromocion(promocion) {
  if (!pool) {
    const promociones = leerJSON();
    const indice = promociones.findIndex((item) => String(item.id) === String(promocion.id));
    if (indice === -1) return null;
    promociones[indice] = promocion;
    guardarJSON(promociones);
    return promocion;
  }
  await inicializarPromociones();
  const valores = valoresPromocion(promocion);
  const resultado = await pool.query(
    `UPDATE promociones_web SET
       nombre=$2, descripcion=$3, imagen=$4, precio_anterior=$5,
       precio_promocional=$6, inicio=$7, fin=$8, mostrar_inicio=$9,
       mostrar_carrusel=$10, mostrar_destacados=$11, mostrar_popup=$12,
       activa=$13, creado_en=$14, actualizado_en=$15
     WHERE id=$1 RETURNING *`,
    valores
  );
  return resultado.rows[0] ? desdeFila(resultado.rows[0]) : null;
}

async function eliminarPromocion(id) {
  if (!pool) {
    const promociones = leerJSON();
    const nuevas = promociones.filter((item) => String(item.id) !== String(id));
    if (nuevas.length === promociones.length) return false;
    guardarJSON(nuevas);
    return true;
  }
  await inicializarPromociones();
  const resultado = await pool.query("DELETE FROM promociones_web WHERE id=$1", [id]);
  return resultado.rowCount > 0;
}

module.exports = {
  inicializarPromociones,
  listarPromociones,
  obtenerPromocion,
  crearPromocion,
  actualizarPromocion,
  eliminarPromocion,
};
