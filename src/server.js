const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const productosPath = path.join(__dirname, "controllers", "productos.json");
const ventasPath = path.join(__dirname, "controllers", "ventas.json");
const proveedoresPath = path.join(__dirname, "controllers", "proveedores.json");
const comprasPath = path.join(__dirname, "controllers", "compras.json");
const recetasPath = path.join(__dirname, "controllers", "recetas.json");
const clientesPath = path.join(
  __dirname,
  "controllers",
  "clientes.json"
);
const insumosPath = path.join(__dirname, "controllers", "insumos.json");

let clientes = JSON.parse(
  fs.readFileSync(clientesPath, "utf8")
);
let productos = JSON.parse(fs.readFileSync(productosPath, "utf8"));
let ventas = JSON.parse(fs.readFileSync(ventasPath, "utf8"));
let proveedores = JSON.parse(fs.readFileSync(proveedoresPath, "utf8"));
let compras = JSON.parse(fs.readFileSync(comprasPath, "utf8"));
let recetas = JSON.parse(fs.readFileSync(recetasPath, "utf8"));
let stock = JSON.parse(fs.readFileSync(insumosPath, "utf8"));
app.put("/api/test/:id", (req, res) => {
  res.json({ ok: true, id: req.params.id, body: req.body });
});
app.get("/", (req, res) => {
  res.json({ sistema: "MasaOS", version: "1.0", estado: "Activo" });
});

app.get("/api/productos", (req, res) => {
  res.json(productos);
});

app.post("/api/productos", (req, res) => {
  const nuevoProducto = {
    id: productos.length ? Math.max(...productos.map((p) => Number(p.id))) + 1 : 1,
    nombre: req.body.nombre,
    categoria: req.body.categoria,
    precio: Number(req.body.precio),
    descripcion: req.body.descripcion || "",activo: true,
    imagen: req.body.imagen || "",
  };

  productos.push(nuevoProducto);
  fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2));

  res.json(nuevoProducto);
});

app.put("/api/productos/:id", (req, res) => {
    console.log("ENTRÓ AL PUT", req.params.id, req.body);
  const id = Number(req.params.id);
  const producto = productos.find((p) => Number(p.id) === id);
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  producto.nombre = req.body.nombre;
  producto.categoria = req.body.categoria;
  producto.precio = Number(req.body.precio);
  producto.descripcion = req.body.descripcion || "";
  producto.imagen = req.body.imagen || "";
  producto.activo = req.body.activo ?? true;

  fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2));

  res.json(producto);
});

app.delete("/api/productos/:id", (req, res) => {
  const id = Number(req.params.id);

  productos = productos.filter((p) => Number(p.id) !== id);
  fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2));

  res.json({ ok: true });
});

app.get("/api/ventas", (req, res) => {
  res.json(ventas);
});
app.get("/api/recetas", (req, res) => {
  res.json(recetas);
});
app.get("/api/costos-productos", (req, res) => {
  const resultado = recetas.map((receta) => {
    let costo = 0;

    receta.ingredientes.forEach((ingredienteReceta) => {
      const insumo = stock.find(
        (item) =>
          item.ingrediente.toLowerCase() ===
          ingredienteReceta.ingrediente.toLowerCase()
      );

      if (insumo) {
        costo +=
          Number(ingredienteReceta.cantidad) *
          Number(insumo.costoUnitario || 0);
      }
    });

    const producto = productos.find(
      (item) => Number(item.id) === Number(receta.productoId)
    );

    const precioVenta = producto ? Number(producto.precio) : 0;
    const ganancia = precioVenta - costo;

    const margen =
      precioVenta > 0 ? (ganancia / precioVenta) * 100 : 0;

    return {
      productoId: receta.productoId,
      producto: receta.producto,
      costo: Number(costo.toFixed(2)),
      venta: precioVenta,
      ganancia: Number(ganancia.toFixed(2)),
      margen: Number(margen.toFixed(1)),
    };
  });

  res.json(resultado);
});

app.get("/api/produccion-maxima", (req, res) => {
  const resultado = recetas.map((receta) => {
    const capacidades = receta.ingredientes.map((ingredienteReceta) => {
      const insumo = stock.find(
        (item) =>
          item.ingrediente.toLowerCase() ===
          ingredienteReceta.ingrediente.toLowerCase()
      );

      const cantidadNecesaria = Number(ingredienteReceta.cantidad || 0);
      const cantidadDisponible = Number(insumo?.cantidad || 0);

      if (!insumo || cantidadNecesaria <= 0) {
        return {
          ingrediente: ingredienteReceta.ingrediente,
          capacidad: 0,
          disponible: cantidadDisponible,
          necesario: cantidadNecesaria,
        };
      }

      return {
        ingrediente: ingredienteReceta.ingrediente,
        capacidad: Math.floor(cantidadDisponible / cantidadNecesaria),
        disponible: cantidadDisponible,
        necesario: cantidadNecesaria,
      };
    });

    const produccionMaxima =
      capacidades.length > 0
        ? Math.min(...capacidades.map((item) => item.capacidad))
        : 0;

    const ingredienteLimitante =
      capacidades.find((item) => item.capacidad === produccionMaxima)
        ?.ingrediente || "-";

    return {
      productoId: receta.productoId,
      producto: receta.producto,
      produccionMaxima,
      ingredienteLimitante,
      detalle: capacidades,
    };
  });

  res.json(resultado);
});
app.put("/api/recetas/:id", (req, res) => {
  const id = Number(req.params.id);

  const receta = recetas.find((item) => Number(item.id) === id);

  if (!receta) {
    return res.status(404).json({
      error: "Receta no encontrada",
    });
  }

  receta.producto = req.body.producto;
  receta.productoId = Number(req.body.productoId);
  receta.ingredientes = Array.isArray(req.body.ingredientes)
    ? req.body.ingredientes
    : [];

  fs.writeFileSync(recetasPath, JSON.stringify(recetas, null, 2));

  res.json(receta);
});

app.post("/api/ventas", (req, res) => {
    const productosVendidos = req.body.producto.split(",");

  for (const item of productosVendidos) {
    const partes = item.trim().split(" x");
    const nombreProducto = partes[0];
    const cantidadVendida = Number(partes[1] || 1);
    const receta = recetas.find(
  (item) =>
    item.producto.trim().toLowerCase() ===
    nombreProducto.trim().toLowerCase()
);
app.put("/api/ventas/:id/estado", (req, res) => {
  const id = Number(req.params.id);
  const estadosPermitidos = [
    "Nuevo",
    "Preparando",
    "Listo",
    "Entregado",
    "Cancelado",
  ];

  const nuevoEstado = String(req.body.estado || "").trim();

  if (!estadosPermitidos.includes(nuevoEstado)) {
    return res.status(400).json({
      error: "Estado de pedido no válido.",
    });
  }

  const venta = ventas.find(
    (item) => Number(item.id) === id
  );

  if (!venta) {
    return res.status(404).json({
      error: "Pedido no encontrado.",
    });
  }

  venta.estado = nuevoEstado;
  venta.fechaActualizacion = new Date().toISOString();

  fs.writeFileSync(
    ventasPath,
    JSON.stringify(ventas, null, 2)
  );

  res.json(venta);
});

const siguienteId = ventas.length
  ? Math.max(...ventas.map((venta) => Number(venta.id))) + 1
  : 1;

const ahora = new Date();

const nuevaVenta = {
  id: siguienteId,
  cliente: req.body.cliente || "Mostrador",
  telefono: req.body.telefono || "",
  direccion: req.body.direccion || "",
  producto: req.body.producto,
  cantidad: Number(req.body.cantidad),
  total: Number(req.body.total),
  formaPago: req.body.formaPago || "",
  montoRecibido: Number(req.body.montoRecibido || 0),
  vuelto: Number(req.body.vuelto || 0),

  fecha: ahora.toISOString().split("T")[0],
  fechaHora: ahora.toISOString(),

  estado: "Nuevo",
  observaciones: req.body.observaciones || "",
};

  ventas.push(nuevaVenta);
  const nombreCliente = String(req.body.cliente || "").trim();
const telefonoCliente = String(req.body.telefono || "").trim();
const direccionCliente = String(req.body.direccion || "").trim();

if (nombreCliente && nombreCliente.toLowerCase() !== "mostrador") {
  let clienteExistente = clientes.find((cliente) => {
    if (telefonoCliente && cliente.telefono) {
      return cliente.telefono === telefonoCliente;
    }

    return cliente.nombre.toLowerCase() === nombreCliente.toLowerCase();
  });

  if (clienteExistente) {
    clienteExistente.nombre = nombreCliente;
    clienteExistente.telefono = telefonoCliente || clienteExistente.telefono;
    clienteExistente.direccion =
      direccionCliente || clienteExistente.direccion;
    clienteExistente.cantidadPedidos =
      Number(clienteExistente.cantidadPedidos || 0) + 1;
    clienteExistente.totalGastado =
      Number(clienteExistente.totalGastado || 0) + Number(req.body.total);
    clienteExistente.ultimaCompra = nuevaVenta.fecha;
  } else {
    clientes.push({
      id: clientes.length
        ? Math.max(...clientes.map((cliente) => Number(cliente.id))) + 1
        : 1,
      nombre: nombreCliente,
      telefono: telefonoCliente,
      direccion: direccionCliente,
      cantidadPedidos: 1,
      totalGastado: Number(req.body.total),
      ultimaCompra: nuevaVenta.fecha,
    });
  }

  fs.writeFileSync(clientesPath, JSON.stringify(clientes, null, 2));
}

  productosVendidos.forEach((item) => {
  const partes = item.trim().split(" x");
  const nombreProducto = partes[0].trim();
  const cantidadVendida = Number(partes[1] || 1);

  const receta = recetas.find(
    (itemReceta) =>
      String(itemReceta.producto).trim().toLowerCase() ===
      nombreProducto.toLowerCase()
  );

  if (!receta) {
    console.warn(
      `No se encontró una receta para el producto: ${nombreProducto}`
    );
    return;
  }

  receta.ingredientes.forEach((ingredienteReceta) => {
    const itemStock = stock.find(
      (itemStockActual) =>
        String(itemStockActual.ingrediente).trim().toLowerCase() ===
        String(ingredienteReceta.ingrediente).trim().toLowerCase()
    );

    if (!itemStock) {
      console.warn(
        `No se encontró el insumo: ${ingredienteReceta.ingrediente}`
      );
      return;
    }

    const cantidadADescontar =
      Number(ingredienteReceta.cantidad) * cantidadVendida;

    itemStock.cantidad = Number(
      (
        Number(itemStock.cantidad) - cantidadADescontar
      ).toFixed(2)
    );
  });
});

  fs.writeFileSync(ventasPath, JSON.stringify(ventas, null, 2));
  fs.writeFileSync(insumosPath, JSON.stringify(stock, null, 2));
  res.json(nuevaVenta);
});

app.get("/api/stock", (req, res) => {
  res.json(stock);
});

app.get("/api/compras", (req, res) => {
  res.json(compras);
});

app.post("/api/compras", (req, res) => {
  const items = req.body.items || [];

  if (!req.body.proveedor || items.length === 0) {
    return res.status(400).json({
      error: "La compra debe tener proveedor y al menos un ingrediente",
    });
  }

  const totalCompra = items.reduce((total, item) => total + Number(item.precio), 0);

  const nuevaCompra = {
    id: compras.length + 1,
    proveedor: req.body.proveedor,
    tipoComprobante: req.body.tipoComprobante,
    numeroComprobante: req.body.numeroComprobante,
    items,
    total: totalCompra,
    fecha: new Date().toISOString().split("T")[0],
  };

  compras.push(nuevaCompra);

  items.forEach((item) => {
    const itemStock = stock.find((s) => s.ingrediente === item.ingrediente);

    if (itemStock) {
      itemStock.cantidad = Number(
        (itemStock.cantidad + Number(item.cantidad)).toFixed(2)
      );
    }
  });

  fs.writeFileSync(comprasPath, JSON.stringify(compras, null, 2));
  fs.writeFileSync(insumosPath, JSON.stringify(stock, null, 2));
  res.json(nuevaCompra);
});

app.get("/api/proveedores", (req, res) => {
  res.json(proveedores);
});
app.get("/api/clientes", (req, res) => {
  res.json(clientes);
});

app.get("/api/usuarios", (req, res) => {
  res.json([
    { id: 1, nombre: "Germán", rol: "administrador", activo: true },
    { id: 2, nombre: "Caja", rol: "caja", activo: true },
  ]);
});

app.get("/api/compras/reset", (req, res) => {
  compras = [];
  fs.writeFileSync(comprasPath, JSON.stringify(compras, null, 2));
  res.json({ ok: true, mensaje: "Compras limpiadas", compras });
});

console.log("===== SERVER NUEVO =====");

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`MasaOS corriendo en puerto ${PORT}`);
});