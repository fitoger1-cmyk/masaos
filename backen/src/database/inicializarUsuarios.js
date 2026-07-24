const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const {
  pool,
} = require("../config/database");

const usuariosPath = path.join(
  __dirname,
  "..",
  "controllers",
  "usuarios.json"
);

async function inicializarUsuarios() {
  if (!pool) {
    console.log(
      "PostgreSQL no configurado: se mantienen usuarios en JSON."
    );

    return {
      configurada: false,
      cantidad: 0,
    };
  }

  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    await cliente.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(120) NOT NULL,
        usuario VARCHAR(80) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        rol VARCHAR(50) NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        ultimo_login TIMESTAMPTZ,
        creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const contenido = fs.readFileSync(
      usuariosPath,
      "utf8"
    );

    const usuarios = JSON.parse(contenido);

    for (const usuario of usuarios) {
      const nombreUsuario = String(
        usuario.usuario || ""
      )
        .trim()
        .toLowerCase();

      const existente = await cliente.query(
        `
          SELECT id
          FROM usuarios
          WHERE id = $1 OR usuario = $2
          LIMIT 1
        `,
        [
          Number(usuario.id),
          nombreUsuario,
        ]
      );

      if (existente.rowCount > 0) {
        continue;
      }

      const passwordHash = await bcrypt.hash(
        String(usuario.password || ""),
        12
      );

      const ultimoLogin =
        usuario.ultimoLogin
          ? new Date(usuario.ultimoLogin)
          : null;

      await cliente.query(
        `
          INSERT INTO usuarios (
            id,
            nombre,
            usuario,
            password_hash,
            rol,
            activo,
            ultimo_login
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          Number(usuario.id),
          String(
            usuario.nombre || ""
          ).trim(),
          nombreUsuario,
          passwordHash,
          String(usuario.rol || "")
            .trim()
            .toLowerCase(),
          usuario.activo !== false,
          ultimoLogin,
        ]
      );
    }

    await cliente.query(`
      SELECT SETVAL(
        PG_GET_SERIAL_SEQUENCE(
          'usuarios',
          'id'
        ),
        GREATEST(
          COALESCE(
            (SELECT MAX(id) FROM usuarios),
            0
          ),
          1
        ),
        EXISTS(
          SELECT 1 FROM usuarios
        )
      )
    `);

    const resultadoCantidad =
      await cliente.query(`
        SELECT COUNT(*)::INTEGER AS cantidad
        FROM usuarios
      `);

    await cliente.query("COMMIT");

    const cantidad =
      resultadoCantidad.rows[0].cantidad;

    console.log(
      `PostgreSQL: tabla usuarios lista con ${cantidad} registros cifrados.`
    );

    return {
      configurada: true,
      cantidad,
    };
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}

module.exports = {
  inicializarUsuarios,
};