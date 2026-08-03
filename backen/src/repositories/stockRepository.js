const { pool } = require("../config/database");

function convertirFila(fila) {
  if (!fila) return null;

  return {
    id: fila.id,
    ingrediente: fila.ingrediente,
    categoria: fila.categoria,
    cantidad: Number(fila.cantidad),
    unidad: fila.unidad,
    stockMinimo: Number(fila.stock_minimo),
    costoCompra: Number(fila.costo_compra),
    cantidadCompra: Number(fila.cantidad_compra),
    costoUnitario: Number(fila.costo_unitario),
    proveedor: fila.proveedor,
    activo: fila.activo,
    createdAt: fila.created_at,
    updatedAt: fila.updated_at,
  };
}

async function listarStock() {
  const resultado = await pool.query(`
    SELECT *
    FROM stock
    WHERE activo = TRUE
    ORDER BY ingrediente
  `);

  return resultado.rows.map(convertirFila);
}

async function buscarInsumoPorId(id) {
  const resultado = await pool.query(
    `
    SELECT *
    FROM stock
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );

  return convertirFila(resultado.rows[0]);
}

async function buscarInsumoPorNombre(nombre) {
  const resultado = await pool.query(
    `
    SELECT *
    FROM stock
    WHERE LOWER(ingrediente)=LOWER($1)
    LIMIT 1
    `,
    [nombre]
  );

  return convertirFila(resultado.rows[0]);
}

async function crearInsumo(datos) {
  const resultado = await pool.query(
    `
    INSERT INTO stock (
      ingrediente,
      categoria,
      cantidad,
      unidad,
      stock_minimo,
      costo_compra,
      cantidad_compra,
      costo_unitario,
      proveedor
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
    `,
    [
      datos.ingrediente,
      datos.categoria || null,
      datos.cantidad || 0,
      datos.unidad,
      datos.stockMinimo || 0,
      datos.costoCompra || 0,
      datos.cantidadCompra || 0,
      datos.costoUnitario || 0,
      datos.proveedor || null,
    ]
  );

  return convertirFila(resultado.rows[0]);
}

async function actualizarInsumo(id, datos) {
  const resultado = await pool.query(
    `
    UPDATE stock
    SET
      ingrediente=$1,
      categoria=$2,
      cantidad=$3,
      unidad=$4,
      stock_minimo=$5,
      costo_compra=$6,
      cantidad_compra=$7,
      costo_unitario=$8,
      proveedor=$9,
      updated_at=NOW()
    WHERE id=$10
    RETURNING *
    `,
    [
      datos.ingrediente,
      datos.categoria,
      datos.cantidad,
      datos.unidad,
      datos.stockMinimo,
      datos.costoCompra,
      datos.cantidadCompra,
      datos.costoUnitario,
      datos.proveedor,
      id,
    ]
  );

  return convertirFila(resultado.rows[0]);
}

async function actualizarCantidad(id, nuevaCantidad) {
  const resultado = await pool.query(
    `
    UPDATE stock
    SET
      cantidad=$1,
      updated_at=NOW()
    WHERE id=$2
    RETURNING *
    `,
    [nuevaCantidad, id]
  );

  return convertirFila(resultado.rows[0]);
}

async function registrarMovimiento({
  stockId,
  tipo,
  cantidad,
  cantidadAnterior,
  cantidadNueva,
  motivo,
  referenciaTipo,
  referenciaId,
  usuarioId,
  usuarioNombre,
}) {
  await pool.query(
    `
    INSERT INTO stock_movimientos(
      stock_id,
      tipo,
      cantidad,
      cantidad_anterior,
      cantidad_nueva,
      motivo,
      referencia_tipo,
      referencia_id,
      usuario_id,
      usuario_nombre
    )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
    [
      stockId,
      tipo,
      cantidad,
      cantidadAnterior,
      cantidadNueva,
      motivo,
      referenciaTipo,
      referenciaId,
      usuarioId,
      usuarioNombre,
    ]
  );
}

async function eliminarInsumo(id) {
  await pool.query(
    `
    UPDATE stock
    SET
      activo=FALSE,
      updated_at=NOW()
    WHERE id=$1
    `,
    [id]
  );
}

module.exports = {
  listarStock,
  buscarInsumoPorId,
  buscarInsumoPorNombre,
  crearInsumo,
  actualizarInsumo,
  actualizarCantidad,
  registrarMovimiento,
  eliminarInsumo,
};