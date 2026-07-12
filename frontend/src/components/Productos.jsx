import { useState } from "react";

function Productos({ productos }) {
  const [productoEditando, setProductoEditando] = useState(null);

  function editarProducto(producto) {
    setProductoEditando({ ...producto });
  }

  async function guardarProducto() {
    const metodo = productoEditando.id ? "PUT" : "POST";
    const url = productoEditando.id
      ? `http://localhost:3000/api/productos/${productoEditando.id}`
      : "http://localhost:3000/api/productos";

    await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...productoEditando,
        precio: Number(productoEditando.precio),
      }),
    });

    setProductoEditando(null);
    window.location.reload();
  }

  async function eliminarProducto(id) {
    if (!window.confirm("¿Eliminar este producto?")) return;

    await fetch(`http://localhost:3000/api/productos/${id}`, {
      method: "DELETE",
    });

    window.location.reload();
  }

  return (
    <section className="section">
      <h2>🍕 Productos</h2>

      <button
        className="btnAgregar"
        onClick={() =>
          setProductoEditando({
            id: null,
            nombre: "",
            categoria: "Pizza",
            descripcion: "",
            imagen: "",
            precio: 0,
            activo: true,
          })
        }
      >
        ➕ Nuevo producto
      </button>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Imagen</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.id}</td>
              <td>{producto.nombre}</td>
              <td>{producto.categoria}</td>
              <td>$ {producto.precio}</td>
              <td>{producto.imagen || "-"}</td>
              <td>{producto.descripcion || "-"}</td>
              <td>
                <button className="btnEditar" onClick={() => editarProducto(producto)}>
                  ✏️ Editar
                </button>
                <button className="btnEliminar" onClick={() => eliminarProducto(producto.id)}>
                  🗑 Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {productoEditando && (
        <div className="modalFondo">
          <div className="modalCaja">
            <h3>{productoEditando.id ? "Editar producto" : "Nuevo producto"}</h3>

            <label>Nombre</label>
            <input
              value={productoEditando.nombre}
              onChange={(e) =>
                setProductoEditando({ ...productoEditando, nombre: e.target.value })
              }
            />

            <label>Categoría</label>
            <input
              value={productoEditando.categoria}
              onChange={(e) =>
                setProductoEditando({ ...productoEditando, categoria: e.target.value })
              }
            />

            <label>Descripción</label>
            <textarea
              value={productoEditando.descripcion || ""}
              onChange={(e) =>
                setProductoEditando({
                  ...productoEditando,
                  descripcion: e.target.value,
                })
              }
            />

            <label>Imagen</label>
            <input
              value={productoEditando.imagen || ""}
              placeholder="Ej: muzzarella.jpg"
              onChange={(e) =>
                setProductoEditando({
                  ...productoEditando,
                  imagen: e.target.value,
                })
              }
            />

            <label>Precio</label>
            <input
              type="number"
              value={productoEditando.precio}
              onChange={(e) =>
                setProductoEditando({ ...productoEditando, precio: e.target.value })
              }
            />

            <label>
              <input
                type="checkbox"
                checked={productoEditando.activo ?? true}
                onChange={(e) =>
                  setProductoEditando({
                    ...productoEditando,
                    activo: e.target.checked,
                  })
                }
              />
              Producto activo
            </label>

            <div className="modalBotones">
              <button onClick={() => setProductoEditando(null)}>Cancelar</button>
              <button type="button" onClick={guardarProducto}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Productos;