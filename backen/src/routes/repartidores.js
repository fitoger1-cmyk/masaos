const express = require("express");
const fs = require("fs");

function normalizarTexto(valor = "") {
  return String(valor).trim();
}

function normalizarClave(valor = "") {
  return normalizarTexto(valor).toLowerCase();
}

function guardarRepartidores(repartidoresPath, repartidores) {
  fs.writeFileSync(
    repartidoresPath,
    JSON.stringify(repartidores, null, 2),
    "utf8"
  );
}

function obtenerSiguienteId(repartidores) {
  const idsValidos = repartidores
    .map((repartidor) => Number(repartidor.id))
    .filter(Number.isFinite);

  return idsValidos.length > 0
    ? Math.max(...idsValidos) + 1
    : 1;
}

function crearRepartidoresRouter({
  repartidores,
  repartidoresPath,
  io,
}) {
  const router = express.Router();

  const estadosPermitidos = [
    "Disponible",
    "En reparto",
    "Fuera de servicio",
  ];

  const vehiculosPermitidos = [
    "Moto",
    "Auto",
    "Bicicleta",
    "A pie",
    "Otro",
  ];

  /*
   * LISTAR TODOS LOS REPARTIDORES
   */
  router.get("/", (req, res) => {
    const mostrarInactivos =
      normalizarClave(req.query.incluirInactivos) === "true";

    const resultado = mostrarInactivos
      ? repartidores
      : repartidores.filter(
          (repartidor) => repartidor.activo !== false
        );

    res.json(resultado);
  });

  /*
   * OBTENER UN REPARTIDOR
   */
  router.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({
        error: "El ID del repartidor no es válido.",
      });
    }

    const repartidor = repartidores.find(
      (item) => Number(item.id) === id
    );

    if (!repartidor) {
      return res.status(404).json({
        error: "Repartidor no encontrado.",
      });
    }

    res.json(repartidor);
  });

  /*
   * CREAR REPARTIDOR
   */
  router.post("/", (req, res) => {
    try {
      const nombre = normalizarTexto(req.body.nombre);
      const telefono = normalizarTexto(req.body.telefono);
      const vehiculo =
        normalizarTexto(req.body.vehiculo) || "Moto";
      const patente = normalizarTexto(req.body.patente);
      const observaciones = normalizarTexto(
        req.body.observaciones
      );

      if (!nombre) {
        return res.status(400).json({
          error: "El nombre del repartidor es obligatorio.",
        });
      }

      if (!vehiculosPermitidos.includes(vehiculo)) {
        return res.status(400).json({
          error: "El tipo de vehículo no es válido.",
        });
      }

      const repartidorDuplicado = repartidores.find(
        (repartidor) =>
          normalizarClave(repartidor.nombre) ===
          normalizarClave(nombre)
      );

      if (repartidorDuplicado) {
        return res.status(400).json({
          error: "Ya existe un repartidor con ese nombre.",
        });
      }

      const ahora = new Date().toISOString();

      const nuevoRepartidor = {
        id: obtenerSiguienteId(repartidores),
        nombre,
        telefono,
        vehiculo,
        patente,
        estado: "Disponible",
        activo: true,
        entregas: 0,
        tiempoPromedio: 0,
        observaciones,
        fechaCreacion: ahora,
        fechaActualizacion: ahora,
      };

      repartidores.push(nuevoRepartidor);

      guardarRepartidores(
        repartidoresPath,
        repartidores
      );

      if (io) {
        io.emit(
          "repartidor:nuevo",
          nuevoRepartidor
        );

        io.emit(
          "repartidores:actualizados",
          repartidores
        );
      }

      res.status(201).json(nuevoRepartidor);
    } catch (error) {
      console.error(
        "Error creando repartidor:",
        error
      );

      res.status(500).json({
        error: "No se pudo crear el repartidor.",
      });
    }
  });

  /*
   * EDITAR REPARTIDOR
   */
  router.put("/:id", (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isFinite(id)) {
        return res.status(400).json({
          error: "El ID del repartidor no es válido.",
        });
      }

      const repartidor = repartidores.find(
        (item) => Number(item.id) === id
      );

      if (!repartidor) {
        return res.status(404).json({
          error: "Repartidor no encontrado.",
        });
      }

      const nombre =
        req.body.nombre !== undefined
          ? normalizarTexto(req.body.nombre)
          : repartidor.nombre;

      const telefono =
        req.body.telefono !== undefined
          ? normalizarTexto(req.body.telefono)
          : repartidor.telefono;

      const vehiculo =
        req.body.vehiculo !== undefined
          ? normalizarTexto(req.body.vehiculo)
          : repartidor.vehiculo;

      const patente =
        req.body.patente !== undefined
          ? normalizarTexto(req.body.patente)
          : repartidor.patente;

      const observaciones =
        req.body.observaciones !== undefined
          ? normalizarTexto(req.body.observaciones)
          : repartidor.observaciones;

      if (!nombre) {
        return res.status(400).json({
          error: "El nombre del repartidor es obligatorio.",
        });
      }

      if (!vehiculosPermitidos.includes(vehiculo)) {
        return res.status(400).json({
          error: "El tipo de vehículo no es válido.",
        });
      }

      const repartidorDuplicado = repartidores.find(
        (item) =>
          Number(item.id) !== id &&
          normalizarClave(item.nombre) ===
            normalizarClave(nombre)
      );

      if (repartidorDuplicado) {
        return res.status(400).json({
          error: "Ya existe otro repartidor con ese nombre.",
        });
      }

      repartidor.nombre = nombre;
      repartidor.telefono = telefono;
      repartidor.vehiculo = vehiculo;
      repartidor.patente = patente;
      repartidor.observaciones = observaciones;
      repartidor.fechaActualizacion =
        new Date().toISOString();

      guardarRepartidores(
        repartidoresPath,
        repartidores
      );

      if (io) {
        io.emit(
          "repartidor:actualizado",
          repartidor
        );

        io.emit(
          "repartidores:actualizados",
          repartidores
        );
      }

      res.json(repartidor);
    } catch (error) {
      console.error(
        "Error editando repartidor:",
        error
      );

      res.status(500).json({
        error: "No se pudo editar el repartidor.",
      });
    }
  });

  /*
   * CAMBIAR ESTADO OPERATIVO
   */
  router.patch("/:id/estado", (req, res) => {
    try {
      const id = Number(req.params.id);
      const nuevoEstado = normalizarTexto(
        req.body.estado
      );

      if (!Number.isFinite(id)) {
        return res.status(400).json({
          error: "El ID del repartidor no es válido.",
        });
      }

      if (!estadosPermitidos.includes(nuevoEstado)) {
        return res.status(400).json({
          error: "El estado del repartidor no es válido.",
        });
      }

      const repartidor = repartidores.find(
        (item) => Number(item.id) === id
      );

      if (!repartidor) {
        return res.status(404).json({
          error: "Repartidor no encontrado.",
        });
      }

      if (repartidor.activo === false) {
        return res.status(400).json({
          error:
            "No se puede cambiar el estado de un repartidor inactivo.",
        });
      }

      repartidor.estado = nuevoEstado;
      repartidor.fechaActualizacion =
        new Date().toISOString();

      guardarRepartidores(
        repartidoresPath,
        repartidores
      );

      if (io) {
        io.emit(
          "repartidor:estado",
          repartidor
        );

        io.emit(
          "repartidores:actualizados",
          repartidores
        );
      }

      res.json(repartidor);
    } catch (error) {
      console.error(
        "Error cambiando estado del repartidor:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo cambiar el estado del repartidor.",
      });
    }
  });

  /*
   * ACTIVAR O DESACTIVAR
   */
  router.patch("/:id/activo", (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isFinite(id)) {
        return res.status(400).json({
          error: "El ID del repartidor no es válido.",
        });
      }

      const repartidor = repartidores.find(
        (item) => Number(item.id) === id
      );

      if (!repartidor) {
        return res.status(404).json({
          error: "Repartidor no encontrado.",
        });
      }

      repartidor.activo =
        req.body.activo !== undefined
          ? Boolean(req.body.activo)
          : !repartidor.activo;

      if (repartidor.activo) {
        repartidor.estado = "Disponible";
      } else {
        repartidor.estado = "Fuera de servicio";
      }

      repartidor.fechaActualizacion =
        new Date().toISOString();

      guardarRepartidores(
        repartidoresPath,
        repartidores
      );

      if (io) {
        io.emit(
          "repartidor:activo",
          repartidor
        );

        io.emit(
          "repartidores:actualizados",
          repartidores
        );
      }

      res.json(repartidor);
    } catch (error) {
      console.error(
        "Error activando o desactivando repartidor:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo actualizar el estado del repartidor.",
      });
    }
  });

  /*
   * REGISTRAR ENTREGA
   *
   * Esta ruta se utilizará automáticamente
   * cuando un pedido se marque como entregado.
   */
  router.patch("/:id/entrega", (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isFinite(id)) {
        return res.status(400).json({
          error: "El ID del repartidor no es válido.",
        });
      }

      const repartidor = repartidores.find(
        (item) => Number(item.id) === id
      );

      if (!repartidor) {
        return res.status(404).json({
          error: "Repartidor no encontrado.",
        });
      }

      const tiempoEntrega = Math.max(
        Number(req.body.tiempoEntrega || 0),
        0
      );

      const entregasAnteriores = Number(
        repartidor.entregas || 0
      );

      const promedioAnterior = Number(
        repartidor.tiempoPromedio || 0
      );

      repartidor.entregas =
        entregasAnteriores + 1;

      if (tiempoEntrega > 0) {
        const totalMinutosAnteriores =
          promedioAnterior * entregasAnteriores;

        repartidor.tiempoPromedio = Number(
          (
            (totalMinutosAnteriores +
              tiempoEntrega) /
            repartidor.entregas
          ).toFixed(1)
        );
      }

      repartidor.estado = "Disponible";
      repartidor.ultimaEntrega =
        new Date().toISOString();
      repartidor.fechaActualizacion =
        new Date().toISOString();

      guardarRepartidores(
        repartidoresPath,
        repartidores
      );

      if (io) {
        io.emit(
          "repartidor:entrega",
          repartidor
        );

        io.emit(
          "repartidores:actualizados",
          repartidores
        );
      }

      res.json(repartidor);
    } catch (error) {
      console.error(
        "Error registrando entrega:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo registrar la entrega del repartidor.",
      });
    }
  });

  return router;
}

module.exports = crearRepartidoresRouter;