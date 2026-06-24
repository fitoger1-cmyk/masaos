const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let productos = [
  { id: 1, nombre: "Muzzarella Grande", categoria: "Pizza", precio: 12000, activo: true },
  { id: 2, nombre: "Napolitana Grande", categoria: "Pizza", precio: 17000, activo: true },
  { id: 3, nombre: "Bacon Grande", categoria: "Pizza", precio: 20000, activo: true }
];

app.get("/", (req, res) => {
  res.json({ sistema: "MasaOS", version: "1.0", estado: "Activo" });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, sistema: "MasaOS", fecha: new Date() });
});

app.get("/api/productos", (req, res) => {
  res.json(productos);
});

app.post("/api/productos", (req, res) => {
  const nuevoProducto = {
    id: productos.length + 1,
    nombre: req.body.nombre,
    categoria: req.body.categoria,
    precio: Number(req.body.precio),
    activo: true
  };

  productos.push(nuevoProducto);
  res.json(nuevoProducto);
});

app.get("/api/ventas", (req, res) => {
  res.json([
    { id: 1, cliente: "Juan", total: 17000, fecha: "2026-06-23" },
    { id: 2, cliente: "María", total: 12000, fecha: "2026-06-23" }
  ]);
});

app.get("/api/usuarios", (req, res) => {
  res.json([
    { id: 1, nombre: "Germán", rol: "administrador", activo: true },
    { id: 2, nombre: "Caja", rol: "caja", activo: true }
  ]);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`MasaOS corriendo en puerto ${PORT}`);
});