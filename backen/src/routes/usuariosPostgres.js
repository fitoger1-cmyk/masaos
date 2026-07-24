const express = require("express");
const bcrypt = require("bcryptjs");

const {
  pool,
} = require("../config/database");
const {
  generarToken,
  autenticar,
} = require("../middleware/auth");

const router = express.Router();

function normalizarUsuarioFila(fila) {
  return {
    id: Number(fila.id),
    nombre: fila.nombre,
    usuario: fila.usuario,
    rol: fila.rol,
    activo: fila.activo !== false,
    ultimoLogin: fila.ultimo_login || "",
  };
}

function validarId(valor) {
  const id = Number(valor);

  return Number.isInteger(id) && id > 0
    ? id
    : null;
}

if (pool) {
  // GET /api/usuarios
  router.get("/usuarios", async (req, res) => {
    try {
      const resultado = await pool.query(`
        SELECT
          id,
          nombre,
          usuario,
          rol,
          activo,
          ultimo_login
        FROM usuarios
        ORDER BY id ASC
      `);

      res.json(
        resultado.rows.map(
          normalizarUsuarioFila
        )
      );
    } catch (error) {
      console.error(
        "Error leyendo usuarios PostgreSQL:",
        error
      );

      res.status(500).json({
        error:
          "No se pudieron leer los usuarios.",
      });
    }
  });

  // POST /api/usuarios
  router.post(
    "/usuarios",
    async (req, res) => {
      try {
        const nombre = String(
          req.body.nombre || ""
        ).trim();

        const nombreUsuario = String(
          req.body.usuario || ""
        )
          .trim()
          .toLowerCase();

        const password = String(
          req.body.password || ""
        ).trim();

        const rol = String(
          req.body.rol || ""
        )
          .trim()
          .toLowerCase();

        if (
          !nombre ||
          !nombreUsuario ||
          !password ||
          !rol
        ) {
          return res.status(400).json({
            error:
              "Nombre, usuario, contraseña y rol son obligatorios.",
          });
        }

        const existente = await pool.query(
          `
            SELECT id
            FROM usuarios
            WHERE usuario = $1
          `,
          [nombreUsuario]
        );

        if (existente.rowCount > 0) {
          return res.status(400).json({
            error:
              "Ese nombre de usuario ya está registrado.",
          });
        }

        const passwordHash =
          await bcrypt.hash(password, 12);

        const resultado = await pool.query(
          `
            INSERT INTO usuarios (
              nombre,
              usuario,
              password_hash,
              rol,
              activo
            )
            VALUES ($1, $2, $3, $4, TRUE)
            RETURNING
              id,
              nombre,
              usuario,
              rol,
              activo,
              ultimo_login
          `,
          [
            nombre,
            nombreUsuario,
            passwordHash,
            rol,
          ]
        );

        res
          .status(201)
          .json(
            normalizarUsuarioFila(
              resultado.rows[0]
            )
          );
      } catch (error) {
        console.error(
          "Error creando usuario PostgreSQL:",
          error
        );

        res.status(500).json({
          error:
            "No se pudo crear el usuario.",
        });
      }
    }
  );

  // PUT /api/usuarios/:id
  router.put(
    "/usuarios/:id",
    async (req, res) => {
      try {
        const id = validarId(req.params.id);

        if (!id) {
          return res.status(400).json({
            error:
              "El ID del usuario no es válido.",
          });
        }

        const nombre = String(
          req.body.nombre || ""
        ).trim();

        const nombreUsuario = String(
          req.body.usuario || ""
        )
          .trim()
          .toLowerCase();

        const rol = String(
          req.body.rol || ""
        )
          .trim()
          .toLowerCase();

        if (
          !nombre ||
          !nombreUsuario ||
          !rol
        ) {
          return res.status(400).json({
            error:
              "Nombre, usuario y rol son obligatorios.",
          });
        }

        const usuarioActual =
          await pool.query(
            `
              SELECT id, password_hash
              FROM usuarios
              WHERE id = $1
            `,
            [id]
          );

        if (
          usuarioActual.rowCount === 0
        ) {
          return res.status(404).json({
            error: "Usuario no encontrado.",
          });
        }

        const duplicado = await pool.query(
          `
            SELECT id
            FROM usuarios
            WHERE usuario = $1
              AND id <> $2
          `,
          [nombreUsuario, id]
        );

        if (duplicado.rowCount > 0) {
          return res.status(400).json({
            error:
              "Ese nombre de usuario ya está registrado.",
          });
        }

        let passwordHash =
          usuarioActual.rows[0].password_hash;

        if (req.body.password) {
          passwordHash = await bcrypt.hash(
            String(req.body.password).trim(),
            12
          );
        }

        const resultado = await pool.query(
          `
            UPDATE usuarios
            SET
              nombre = $1,
              usuario = $2,
              password_hash = $3,
              rol = $4,
              actualizado_en = NOW()
            WHERE id = $5
            RETURNING
              id,
              nombre,
              usuario,
              rol,
              activo,
              ultimo_login
          `,
          [
            nombre,
            nombreUsuario,
            passwordHash,
            rol,
            id,
          ]
        );

        res.json(
          normalizarUsuarioFila(
            resultado.rows[0]
          )
        );
      } catch (error) {
        console.error(
          "Error actualizando usuario PostgreSQL:",
          error
        );

        res.status(500).json({
          error:
            "No se pudo actualizar el usuario.",
        });
      }
    }
  );

  // PATCH /api/usuarios/:id/estado
  router.patch(
    "/usuarios/:id/estado",
    async (req, res) => {
      try {
        const id = validarId(req.params.id);

        if (!id) {
          return res.status(400).json({
            error:
              "El ID del usuario no es válido.",
          });
        }

        const resultado = await pool.query(
          `
            UPDATE usuarios
            SET
              activo = NOT activo,
              actualizado_en = NOW()
            WHERE id = $1
            RETURNING
              id,
              nombre,
              usuario,
              rol,
              activo,
              ultimo_login
          `,
          [id]
        );

        if (resultado.rowCount === 0) {
          return res.status(404).json({
            error: "Usuario no encontrado.",
          });
        }

        res.json(
          normalizarUsuarioFila(
            resultado.rows[0]
          )
        );
      } catch (error) {
        console.error(
          "Error cambiando estado PostgreSQL:",
          error
        );

        res.status(500).json({
          error:
            "No se pudo cambiar el estado del usuario.",
        });
      }
    }
  );
// GET /api/auth/me
router.get(
  "/auth/me",
  autenticar,
  async (req, res) => {
    try {
      const resultado = await pool.query(
        `
          SELECT
            id,
            nombre,
            usuario,
            rol,
            activo,
            ultimo_login
          FROM usuarios
          WHERE id = $1
          LIMIT 1
        `,
        [req.usuario.id]
      );

      if (
        resultado.rowCount === 0 ||
        !resultado.rows[0].activo
      ) {
        return res.status(401).json({
          error:
            "La sesión ya no es válida.",
        });
      }

      res.json({
        ok: true,
        usuario: normalizarUsuarioFila(
          resultado.rows[0]
        ),
      });
    } catch (error) {
      console.error(
        "Error verificando sesión:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo verificar la sesión.",
      });
    }
  }
);
  // POST /api/login
  router.post("/login", async (req, res) => {
    try {
      const nombreUsuario = String(
        req.body.usuario || ""
      )
        .trim()
        .toLowerCase();

      const password = String(
        req.body.password || ""
      ).trim();

      if (!nombreUsuario || !password) {
        return res.status(400).json({
          error:
            "Usuario y contraseña son obligatorios.",
        });
      }

      const resultado = await pool.query(
        `
          SELECT
            id,
            nombre,
            usuario,
            password_hash,
            rol,
            activo,
            ultimo_login
          FROM usuarios
          WHERE usuario = $1
          LIMIT 1
        `,
        [nombreUsuario]
      );

      if (resultado.rowCount === 0) {
        return res.status(401).json({
          error:
            "Usuario o contraseña incorrectos.",
        });
      }

      const usuarioEncontrado =
        resultado.rows[0];

      if (!usuarioEncontrado.activo) {
        return res.status(403).json({
          error:
            "Este usuario se encuentra desactivado.",
        });
      }

      const passwordValido =
        await bcrypt.compare(
          password,
          usuarioEncontrado.password_hash
        );

      if (!passwordValido) {
        return res.status(401).json({
          error:
            "Usuario o contraseña incorrectos.",
        });
      }

      const loginActualizado =
        await pool.query(
          `
            UPDATE usuarios
            SET
              ultimo_login = NOW(),
              actualizado_en = NOW()
            WHERE id = $1
            RETURNING
              id,
              nombre,
              usuario,
              rol,
              activo,
              ultimo_login
          `,
          [usuarioEncontrado.id]
        );

     const usuarioRespuesta =
  normalizarUsuarioFila(
    loginActualizado.rows[0]
  );

const token =
  generarToken(usuarioRespuesta);

res.json({
  mensaje:
    "Inicio de sesión correcto.",
  token,
  usuario: usuarioRespuesta,
});
    } catch (error) {
      console.error(
        "Error iniciando sesión PostgreSQL:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo iniciar sesión.",
      });
    }
  });
}

module.exports = router;