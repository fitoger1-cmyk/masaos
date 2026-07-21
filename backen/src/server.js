const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const crearPedidosRouter = require("./routes/pedidos");
const productosRouter = require("./routes/productos");
const crearVentasRouter = require("./routes/ventas");
const crearRepartidoresRouter = require("./routes/repartidores");
const crearMasaIARouter = require("./routes/masaia");

const app = express();

const origenesPermitidos = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://club-masa-web.vercel.app",
];

const configuracionCors = {
  origin(origen, callback) {
    // Permite solicitudes sin origen, como Postman o el navegador directo.
    if (!origen || origenesPermitidos.includes(origen)) {
      return callback(null, true);
    }

    console.log(`Origen bloqueado por CORS: ${origen}`);

    return callback(new Error("Origen no permitido por CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const servidorHttp = http.createServer(app);
const io = new Server(servidorHttp, {
  cors: configuracionCors,
});
io.on("connection", (socket) => {
  console.log(`Cliente conectado en tiempo real: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

app.use(cors(configuracionCors));
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
const repartidoresPath = path.join(
  __dirname,
  "controllers",
  "repartidores.json"
);
const insumosPath = path.join(__dirname, "controllers", "insumos.json");
const usuariosPath = path.join(
  __dirname,
  "controllers",
  "usuarios.json"
);
const pedidosPath = path.join(
  __dirname,
  "controllers",
  "pedidos.json"
);

let clientes = JSON.parse(
  fs.readFileSync(clientesPath, "utf8")
);
let productos = JSON.parse(fs.readFileSync(productosPath, "utf8"));
let ventas = JSON.parse(fs.readFileSync(ventasPath, "utf8"));
let proveedores = JSON.parse(fs.readFileSync(proveedoresPath, "utf8"));
let compras = JSON.parse(fs.readFileSync(comprasPath, "utf8"));
let recetas = JSON.parse(fs.readFileSync(recetasPath, "utf8"));
let stock = JSON.parse(fs.readFileSync(insumosPath, "utf8"));
let usuarios = JSON.parse(
  fs.readFileSync(usuariosPath, "utf8")
);
let repartidores = JSON.parse(
  fs.readFileSync(repartidoresPath, "utf8")
);
let pedidos = JSON.parse(
  fs.readFileSync(pedidosPath, "utf8")
);
app.use(
  "/api/pedidos",
  crearPedidosRouter({
    pedidos,
    setPedidos: (nuevosPedidos) => {
      pedidos = nuevosPedidos;
    },
    pedidosPath,
  })
);
app.use(
  "/api/ventas",
  crearVentasRouter({
    ventas,
    recetas,
    stock,
    clientes,
    ventasPath,
    insumosPath,
    clientesPath,
    io,
  })
);
app.use(
  "/api/repartidores",
  crearRepartidoresRouter({
    repartidores,
    repartidoresPath,
    io,
  })
);
app.use(
  "/api/masaia",
  crearMasaIARouter({
    ventas,
    productos,
    stock,
    clientes,
    recetas,
    compras,
    repartidores,
  })
);
app.get("/", (req, res) => {
  res.json({
    sistema: "MasaOS",
    version: "2.0",
    estado: "Activo",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    sistema: "MasaOS",
    tiempoReal: true,
    fechaHora: new Date().toISOString(),
  });
});
app.use("/api/productos", productosRouter);


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

// Obtener todos los usuarios
app.get("/api/usuarios", (req, res) => {
  const usuariosSinPassword = usuarios.map((usuario) => ({
    id: usuario.id,
    nombre: usuario.nombre,
    usuario: usuario.usuario,
    rol: usuario.rol,
    activo: usuario.activo,
    ultimoLogin: usuario.ultimoLogin || "",
  }));

  res.json(usuariosSinPassword);
});

// Crear un usuario
app.post("/api/usuarios", (req, res) => {
  const nombre = String(req.body.nombre || "").trim();
  const nombreUsuario = String(req.body.usuario || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "").trim();
  const rol = String(req.body.rol || "").trim().toLowerCase();

  if (!nombre || !nombreUsuario || !password || !rol) {
    return res.status(400).json({
      error:
        "Nombre, usuario, contraseña y rol son obligatorios.",
    });
  }

  const usuarioExistente = usuarios.find(
    (item) =>
      String(item.usuario).trim().toLowerCase() === nombreUsuario
  );

  if (usuarioExistente) {
    return res.status(400).json({
      error: "Ese nombre de usuario ya está registrado.",
    });
  }

  const siguienteId = usuarios.length
    ? Math.max(...usuarios.map((item) => Number(item.id))) + 1
    : 1;

  const nuevoUsuario = {
    id: siguienteId,
    nombre,
    usuario: nombreUsuario,
    password,
    rol,
    activo: true,
    ultimoLogin: "",
  };

  usuarios.push(nuevoUsuario);

  fs.writeFileSync(
    usuariosPath,
    JSON.stringify(usuarios, null, 2)
  );

  res.status(201).json({
    id: nuevoUsuario.id,
    nombre: nuevoUsuario.nombre,
    usuario: nuevoUsuario.usuario,
    rol: nuevoUsuario.rol,
    activo: nuevoUsuario.activo,
    ultimoLogin: nuevoUsuario.ultimoLogin,
  });
});

// Editar un usuario
app.put("/api/usuarios/:id", (req, res) => {
  const id = Number(req.params.id);

  const usuarioEncontrado = usuarios.find(
    (item) => Number(item.id) === id
  );

  if (!usuarioEncontrado) {
    return res.status(404).json({
      error: "Usuario no encontrado.",
    });
  }

  const nombre = String(req.body.nombre || "").trim();
  const nombreUsuario = String(req.body.usuario || "")
    .trim()
    .toLowerCase();
  const rol = String(req.body.rol || "").trim().toLowerCase();

  if (!nombre || !nombreUsuario || !rol) {
    return res.status(400).json({
      error: "Nombre, usuario y rol son obligatorios.",
    });
  }

  const usuarioDuplicado = usuarios.find(
    (item) =>
      Number(item.id) !== id &&
      String(item.usuario).trim().toLowerCase() === nombreUsuario
  );

  if (usuarioDuplicado) {
    return res.status(400).json({
      error: "Ese nombre de usuario ya está registrado.",
    });
  }

  usuarioEncontrado.nombre = nombre;
  usuarioEncontrado.usuario = nombreUsuario;
  usuarioEncontrado.rol = rol;

  if (req.body.password) {
    usuarioEncontrado.password = String(
      req.body.password
    ).trim();
  }

  fs.writeFileSync(
    usuariosPath,
    JSON.stringify(usuarios, null, 2)
  );

  res.json({
    id: usuarioEncontrado.id,
    nombre: usuarioEncontrado.nombre,
    usuario: usuarioEncontrado.usuario,
    rol: usuarioEncontrado.rol,
    activo: usuarioEncontrado.activo,
    ultimoLogin: usuarioEncontrado.ultimoLogin || "",
  });
});

// Activar o desactivar un usuario
app.patch("/api/usuarios/:id/estado", (req, res) => {
  const id = Number(req.params.id);

  const usuarioEncontrado = usuarios.find(
    (item) => Number(item.id) === id
  );

  if (!usuarioEncontrado) {
    return res.status(404).json({
      error: "Usuario no encontrado.",
    });
  }

  usuarioEncontrado.activo = !usuarioEncontrado.activo;

  fs.writeFileSync(
    usuariosPath,
    JSON.stringify(usuarios, null, 2)
  );

  res.json({
    id: usuarioEncontrado.id,
    nombre: usuarioEncontrado.nombre,
    usuario: usuarioEncontrado.usuario,
    rol: usuarioEncontrado.rol,
    activo: usuarioEncontrado.activo,
    ultimoLogin: usuarioEncontrado.ultimoLogin || "",
  });
});

app.get("/api/compras/reset", (req, res) => {
  compras = [];
  fs.writeFileSync(comprasPath, JSON.stringify(compras, null, 2));
  res.json({ ok: true, mensaje: "Compras limpiadas", compras });
});
// Iniciar sesión
app.post("/api/login", (req, res) => {
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
      error: "Usuario y contraseña son obligatorios.",
    });
  }

  const usuarioEncontrado = usuarios.find(
    (usuario) =>
      String(usuario.usuario || "")
        .trim()
        .toLowerCase() === nombreUsuario
  );

  if (!usuarioEncontrado) {
    return res.status(401).json({
      error: "Usuario o contraseña incorrectos.",
    });
  }

  if (!usuarioEncontrado.activo) {
    return res.status(403).json({
      error: "Este usuario se encuentra desactivado.",
    });
  }

  if (
    String(usuarioEncontrado.password) !== password
  ) {
    return res.status(401).json({
      error: "Usuario o contraseña incorrectos.",
    });
  }

  usuarioEncontrado.ultimoLogin =
    new Date().toISOString();

  fs.writeFileSync(
    usuariosPath,
    JSON.stringify(usuarios, null, 2)
  );

  res.json({
    mensaje: "Inicio de sesión correcto.",
    usuario: {
      id: usuarioEncontrado.id,
      nombre: usuarioEncontrado.nombre,
      usuario: usuarioEncontrado.usuario,
      rol: usuarioEncontrado.rol,
      activo: usuarioEncontrado.activo,
      ultimoLogin: usuarioEncontrado.ultimoLogin,
    },
  });
});
console.log("===== MasaOS v2 =====");

const PORT = process.env.PORT || 3000;

servidorHttp.listen(PORT, () => {
  console.log(`MasaOS corriendo en puerto ${PORT}`);
  console.log("Tiempo real activo con Socket.IO");
});