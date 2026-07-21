const express = require("express");
const fs = require("fs");

function normalizarTexto(valor = "") {
  return String(valor).trim();
}

function normalizarClave(valor = "") {
  return normalizarTexto(valor).toLowerCase();
}

function obtenerProductosVendidos(body) {
  if (Array.isArray(body.productos) && body.productos.length > 0) {
    return body.productos
      .map((producto, indice) => ({
        id:
          producto.id ??
          producto.productoId ??
          `producto-${indice}`,

        carritoId:
          producto.carritoId ??
          `linea-${Date.now()}-${indice}`,

        nombre: normalizarTexto(producto.nombre),

        cantidad: Math.max(
          Number(producto.cantidad || 1),
          1
        ),

        precio: Number(producto.precio || 0),

        observacion: normalizarTexto(
          producto.observacion
        ),
      }))
      .filter((producto) => producto.nombre);
  }

  const textoProductos = normalizarTexto(body.producto);

  if (!textoProductos) {
    return [];
  }

  return textoProductos
    .split(",")
    .map((texto, indice) => {
      const item = texto.trim();

      const coincidencia = item.match(
        /^(.*?)\s+x(\d+)(?:\s+\((.*)\))?$/i
      );

      if (coincidencia) {
        return {
          id: `producto-${indice}`,

          carritoId:
            `linea-${Date.now()}-${indice}`,

          nombre: coincidencia[1].trim(),

          cantidad: Math.max(
            Number(coincidencia[2] || 1),
            1
          ),

          precio: 0,

          observacion: normalizarTexto(
            coincidencia[3]
          ),
        };
      }

      return {
        id: `producto-${indice}`,

        carritoId:
          `linea-${Date.now()}-${indice}`,

        nombre: item,

        cantidad: 1,

        precio: 0,

        observacion: "",
      };
    })
    .filter((producto) => producto.nombre);
}

function crearTextoProductos(productos) {
  return productos
    .map((producto) => {
      const base =
        `${producto.nombre} x${producto.cantidad}`;

      return producto.observacion
        ? `${base} (${producto.observacion})`
        : base;
    })
    .join(", ");
}

function buscarReceta(recetas, nombreProducto) {
  return recetas.find(
    (receta) =>
      normalizarClave(receta.producto) ===
      normalizarClave(nombreProducto)
  );
}

function buscarInsumo(stock, ingrediente) {
  return stock.find(
    (item) =>
      normalizarClave(item.ingrediente) ===
      normalizarClave(ingrediente)
  );
}

function guardarVentas(ventasPath, ventas) {
  fs.writeFileSync(
    ventasPath,
    JSON.stringify(ventas, null, 2),
    "utf8"
  );
}

function crearVentasRouter({
  ventas,
  recetas,
  stock,
  clientes,
  ventasPath,
  insumosPath,
  clientesPath,
  io,
}) {
  const router = express.Router();

  const estadosPermitidos = [
    "Nuevo",
    "Preparando",
    "En preparación",
    "Listo",
    "En reparto",
    "En camino",
    "Entregado",
    "Cancelado",
  ];

  /*
   * LISTAR TODAS LAS VENTAS
   */
  router.get("/", (req, res) => {
    res.json(ventas);
  });

  /*
   * REGISTRAR UNA NUEVA VENTA
   */
  router.post("/", (req, res) => {
    try {
      const productosVendidos =
        obtenerProductosVendidos(req.body);

      if (productosVendidos.length === 0) {
        return res.status(400).json({
          error:
            "La venta debe contener al menos un producto.",
        });
      }

      /*
       * VALIDAR STOCK
       */
      for (const producto of productosVendidos) {
        const receta = buscarReceta(
          recetas,
          producto.nombre
        );

        if (!receta) {
          console.warn(
            `No se encontró una receta para: ${producto.nombre}`
          );

          continue;
        }

        for (
          const ingredienteReceta
          of receta.ingredientes
        ) {
          const itemStock = buscarInsumo(
            stock,
            ingredienteReceta.ingrediente
          );

          const cantidadNecesaria =
            Number(ingredienteReceta.cantidad) *
            Number(producto.cantidad);

          if (!itemStock) {
            return res.status(400).json({
              error:
                `No existe el insumo ${ingredienteReceta.ingrediente} en el stock.`,
            });
          }

          if (
            Number(itemStock.cantidad) <
            cantidadNecesaria
          ) {
            return res.status(400).json({
              error:
                `Stock insuficiente de ${ingredienteReceta.ingrediente}.`,
            });
          }
        }
      }

      const idsValidos = ventas
        .map((venta) => Number(venta.id))
        .filter(Number.isFinite);

      const siguienteId =
        idsValidos.length > 0
          ? Math.max(...idsValidos) + 1
          : 1;

      const ahora = new Date();

      const nuevaVenta = {
        id: siguienteId,

        cliente:
          normalizarTexto(req.body.cliente) ||
          "Mostrador",

        telefono: normalizarTexto(
          req.body.telefono
        ),

        direccion: normalizarTexto(
          req.body.direccion
        ),

        tipoPedido:
          normalizarTexto(req.body.tipoPedido) ||
          "Retiro",

        numeroMesa: normalizarTexto(
          req.body.numeroMesa
        ),

        producto:
          crearTextoProductos(productosVendidos),

        productos: productosVendidos,

        cantidad: productosVendidos.reduce(
          (total, producto) =>
            total + Number(producto.cantidad),
          0
        ),

        subtotal: Number(
          req.body.subtotal ??
          req.body.total ??
          0
        ),

        descuento: Number(
          req.body.descuento || 0
        ),

        descuentoTipo: normalizarTexto(
          req.body.descuentoTipo
        ),

        descuentoValor: Number(
          req.body.descuentoValor || 0
        ),

        total: Number(req.body.total || 0),

        formaPago: normalizarTexto(
          req.body.formaPago
        ),

        montoRecibido: Number(
          req.body.montoRecibido || 0
        ),

        vuelto: Number(req.body.vuelto || 0),

        fecha:
          ahora.toISOString().split("T")[0],

        fechaHora: ahora.toISOString(),

        estado: "Nuevo",

        observaciones: normalizarTexto(
          req.body.observaciones
        ),

        repartidor: "",

        repartidorId: "",

        fechaAsignacionRepartidor: "",

        horaSalida: "",

        horaEntrega: "",

        fechaActualizacion:
          ahora.toISOString(),
      };

      ventas.push(nuevaVenta);

      /*
       * REGISTRAR O ACTUALIZAR CLIENTE
       */
      const nombreCliente =
        nuevaVenta.cliente.trim();

      const telefonoCliente =
        nuevaVenta.telefono.trim();

      const direccionCliente =
        nuevaVenta.direccion.trim();

      if (
        nombreCliente &&
        nombreCliente.toLowerCase() !== "mostrador"
      ) {
        const clienteExistente =
          clientes.find((cliente) => {
            if (
              telefonoCliente &&
              cliente.telefono
            ) {
              return (
                normalizarTexto(
                  cliente.telefono
                ) === telefonoCliente
              );
            }

            return (
              normalizarClave(cliente.nombre) ===
              normalizarClave(nombreCliente)
            );
          });

        if (clienteExistente) {
          clienteExistente.nombre =
            nombreCliente;

          clienteExistente.telefono =
            telefonoCliente ||
            clienteExistente.telefono;

          clienteExistente.direccion =
            direccionCliente ||
            clienteExistente.direccion;

          clienteExistente.cantidadPedidos =
            Number(
              clienteExistente.cantidadPedidos ||
              0
            ) + 1;

          clienteExistente.totalGastado =
            Number(
              clienteExistente.totalGastado ||
              0
            ) + nuevaVenta.total;

          clienteExistente.ultimaCompra =
            nuevaVenta.fecha;
        } else {
          const idsClientes = clientes
            .map((cliente) =>
              Number(cliente.id)
            )
            .filter(Number.isFinite);

          const siguienteClienteId =
            idsClientes.length > 0
              ? Math.max(...idsClientes) + 1
              : 1;

          clientes.push({
            id: siguienteClienteId,

            nombre: nombreCliente,

            telefono: telefonoCliente,

            direccion: direccionCliente,

            cantidadPedidos: 1,

            totalGastado:
              nuevaVenta.total,

            ultimaCompra:
              nuevaVenta.fecha,
          });
        }

        fs.writeFileSync(
          clientesPath,
          JSON.stringify(clientes, null, 2),
          "utf8"
        );
      }

      /*
       * DESCONTAR STOCK
       */
      for (const producto of productosVendidos) {
        const receta = buscarReceta(
          recetas,
          producto.nombre
        );

        if (!receta) {
          continue;
        }

        for (
          const ingredienteReceta
          of receta.ingredientes
        ) {
          const itemStock = buscarInsumo(
            stock,
            ingredienteReceta.ingrediente
          );

          if (!itemStock) {
            continue;
          }

          const cantidadADescontar =
            Number(ingredienteReceta.cantidad) *
            Number(producto.cantidad);

          itemStock.cantidad = Number(
            (
              Number(itemStock.cantidad) -
              cantidadADescontar
            ).toFixed(2)
          );
        }
      }

      guardarVentas(ventasPath, ventas);

      fs.writeFileSync(
        insumosPath,
        JSON.stringify(stock, null, 2),
        "utf8"
      );

     if (io) {
  io.emit("venta:nueva", nuevaVenta);
  io.emit("stock:actualizado", stock);

  // Actualizar todo el Dashboard
  io.emit("dashboard:update");
}

      res.status(201).json(nuevaVenta);
    } catch (error) {
      console.error(
        "Error registrando venta:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo registrar la venta.",
      });
    }
  });

  /*
   * ACTUALIZAR PEDIDO COMPLETO
   *
   * Esta ruta es utilizada por Delivery PRO:
   *
   * PUT /api/ventas/:id
   */
  router.put("/:id", (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isFinite(id)) {
        return res.status(400).json({
          error:
            "El ID de la venta no es válido.",
        });
      }

      const venta = ventas.find(
        (item) =>
          Number(item.id) === id
      );

      if (!venta) {
        return res.status(404).json({
          error: "Venta no encontrada.",
        });
      }

      /*
       * VALIDAR ESTADO SOLAMENTE SI
       * SE ENVIÓ UNO NUEVO
       */
      if (
        req.body.estado !== undefined
      ) {
        const nuevoEstado =
          normalizarTexto(req.body.estado);

        if (
          !estadosPermitidos.includes(
            nuevoEstado
          )
        ) {
          return res.status(400).json({
            error:
              "Estado de pedido no válido.",
          });
        }

        venta.estado = nuevoEstado;
      }

      /*
       * REPARTIDOR
       */
      if (
        req.body.repartidor !== undefined
      ) {
        venta.repartidor =
          normalizarTexto(
            req.body.repartidor
          );
      }

      if (
        req.body.repartidorId !== undefined
      ) {
        venta.repartidorId =
          normalizarTexto(
            req.body.repartidorId
          );
      }

      /*
       * FECHA DE ASIGNACIÓN
       */
      if (
        req.body
          .fechaAsignacionRepartidor !==
        undefined
      ) {
        venta.fechaAsignacionRepartidor =
          normalizarTexto(
            req.body
              .fechaAsignacionRepartidor
          );
      }

      /*
       * HORA DE SALIDA
       */
      if (
        req.body.horaSalida !== undefined
      ) {
        venta.horaSalida =
          normalizarTexto(
            req.body.horaSalida
          );
      }

      /*
       * HORA DE ENTREGA
       */
      if (
        req.body.horaEntrega !== undefined
      ) {
        venta.horaEntrega =
          normalizarTexto(
            req.body.horaEntrega
          );
      }

      /*
       * CAMPOS OPCIONALES QUE PODREMOS
       * USAR MÁS ADELANTE
       */
      if (
        req.body.etaMinutos !== undefined
      ) {
        venta.etaMinutos = Math.max(
          Number(req.body.etaMinutos || 0),
          0
        );
      }

      if (
        req.body.distanciaKm !== undefined
      ) {
        venta.distanciaKm = Math.max(
          Number(req.body.distanciaKm || 0),
          0
        );
      }

      if (
        req.body.observacionesDelivery !==
        undefined
      ) {
        venta.observacionesDelivery =
          normalizarTexto(
            req.body
              .observacionesDelivery
          );
      }

      venta.fechaActualizacion =
        new Date().toISOString();

      guardarVentas(ventasPath, ventas);

      if (io) {
  io.emit("venta:estado", venta);

  io.emit(
    "delivery:actualizado",
    venta
  );

  io.emit("dashboard:update");
}

      res.json(venta);
    } catch (error) {
      console.error(
        "Error actualizando venta:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo actualizar el pedido.",
      });
    }
  });

  /*
   * ACTUALIZAR SOLAMENTE EL ESTADO
   *
   * Esta ruta continúa disponible para Cocina:
   *
   * PUT /api/ventas/:id/estado
   */
  router.put("/:id/estado", (req, res) => {
    try {
      const id = Number(req.params.id);

      const nuevoEstado =
        normalizarTexto(req.body.estado);

      if (
        !estadosPermitidos.includes(
          nuevoEstado
        )
      ) {
        return res.status(400).json({
          error:
            "Estado de pedido no válido.",
        });
      }

      const venta = ventas.find(
        (item) =>
          Number(item.id) === id
      );

      if (!venta) {
        return res.status(404).json({
          error: "Venta no encontrada.",
        });
      }

      venta.estado = nuevoEstado;

      venta.fechaActualizacion =
        new Date().toISOString();

      /*
       * REGISTRAR MOMENTOS IMPORTANTES
       * AUTOMÁTICAMENTE
       */
      if (
        nuevoEstado === "Preparando" ||
        nuevoEstado === "En preparación"
      ) {
        venta.horaInicioPreparacion =
          venta.horaInicioPreparacion ||
          new Date().toISOString();
      }

      if (nuevoEstado === "Listo") {
        venta.horaListo =
          venta.horaListo ||
          new Date().toISOString();
      }

      if (
        nuevoEstado === "En reparto" ||
        nuevoEstado === "En camino"
      ) {
        venta.horaSalida =
          venta.horaSalida ||
          new Date().toISOString();
      }

      if (
        nuevoEstado === "Entregado"
      ) {
        venta.horaEntrega =
          venta.horaEntrega ||
          new Date().toISOString();
      }

      guardarVentas(ventasPath, ventas);

      if (io) {
  io.emit("venta:estado", venta);

  io.emit(
    "delivery:actualizado",
    venta
  );

  io.emit("dashboard:update");
}

      res.json(venta);
    } catch (error) {
      console.error(
        "Error actualizando estado:",
        error
      );

      res.status(500).json({
        error:
          "No se pudo actualizar el estado del pedido.",
      });
    }
  });

  return router;
}

module.exports = crearVentasRouter;