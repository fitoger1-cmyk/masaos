const jwt = require("jsonwebtoken");

function obtenerSecretoJWT() {
  const secreto = process.env.JWT_SECRET;

  if (!secreto) {
    throw new Error(
      "Falta configurar la variable de entorno JWT_SECRET."
    );
  }

  return secreto;
}

function generarToken(usuario) {
  return jwt.sign(
    {
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      rol: usuario.rol,
    },
    obtenerSecretoJWT(),
    {
      subject: String(usuario.id),
      issuer: "masaos-enterprise-api",
      audience: "masaos-enterprise-panel",
      expiresIn: "8h",
    }
  );
}

function autenticar(req, res, next) {
  const autorizacion =
    req.headers.authorization || "";

  const [tipo, token] =
    autorizacion.split(" ");

  if (
    tipo !== "Bearer" ||
    !token
  ) {
    return res.status(401).json({
      error:
        "Se requiere una sesión válida.",
    });
  }

  try {
    const contenido = jwt.verify(
      token,
      obtenerSecretoJWT(),
      {
        issuer: "masaos-enterprise-api",
        audience: "masaos-enterprise-panel",
      }
    );

    req.usuario = {
      id: Number(contenido.sub),
      nombre: contenido.nombre,
      usuario: contenido.usuario,
      rol: contenido.rol,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error:
        "La sesión venció o no es válida.",
    });
  }
}

function autorizarRoles(...rolesPermitidos) {
  return function verificarRol(
    req,
    res,
    next
  ) {
    if (
      !req.usuario ||
      !rolesPermitidos.includes(
        req.usuario.rol
      )
    ) {
      return res.status(403).json({
        error:
          "No tenés permisos para realizar esta acción.",
      });
    }

    next();
  };
}

module.exports = {
  generarToken,
  autenticar,
  autorizarRoles,
};