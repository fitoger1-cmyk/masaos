import { useState } from "react";
import {
  API_URL,
  SOCKET_URL,
} from "../config/api";


function Productos({
  productos = [],
  recargarProductos,
}) {
  const [productoEditando, setProductoEditando] =
    useState(null);

  const [subiendoImagen, setSubiendoImagen] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] = useState("");

  function editarProducto(producto) {
    setError("");

    setProductoEditando({
      ...producto,
      descripcion: producto.descripcion || "",
      imagen: producto.imagen || "",
      activo: producto.activo ?? true,
    });
  }

 function obtenerUrlImagen(imagen) {
  if (!imagen) {
    return "";
  }

  if (
    imagen.startsWith("http://") ||
    imagen.startsWith("https://") ||
    imagen.startsWith("blob:")
  ) {
    return imagen;
  }

  if (imagen.startsWith("/")) {
    return `${SOCKET_URL}${imagen}`;
  }

  return `${SOCKET_URL}/uploads/productos/${imagen}`;
}
  async function subirImagenProducto(archivo) {
    if (!archivo) {
      return;
    }

    try {
      setSubiendoImagen(true);
      setError("");

      const formData = new FormData();

      formData.append("imagen", archivo);

      const respuesta = await fetch(
        `${API_URL}/multimedia/producto`,
        {
          method: "POST",
          body: formData,
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            "No se pudo subir la imagen."
        );
      }

      if (!datos.url) {
        throw new Error(
          "El servidor no devolvió la URL de la imagen."
        );
      }

      setProductoEditando((anterior) => ({
        ...anterior,
        imagen: datos.url,
      }));
    } catch (errorSubida) {
      console.error(
        "Error subiendo imagen:",
        errorSubida
      );

      setError(
        errorSubida.message ||
          "Ocurrió un error al subir la imagen."
      );
    } finally {
      setSubiendoImagen(false);
    }
  }

  async function guardarProducto() {
    if (!productoEditando) {
      return;
    }

    const nombre =
      productoEditando.nombre?.trim();

    const categoria =
      productoEditando.categoria?.trim();

    if (!nombre || !categoria) {
      setError(
        "El nombre y la categoría son obligatorios."
      );

      return;
    }

    try {
      setGuardando(true);
      setError("");

      const metodo = productoEditando.id
        ? "PUT"
        : "POST";

      const url = productoEditando.id
        ? `${API_URL}/productos/${productoEditando.id}`
        : `${API_URL}/productos`;

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...productoEditando,
          nombre,
          categoria,
          descripcion:
            productoEditando.descripcion?.trim() ||
            "",
          imagen: productoEditando.imagen || "",
          precio:
            Number(productoEditando.precio) || 0,
          activo:
            productoEditando.activo ?? true,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            "No se pudo guardar el producto."
        );
      }

      if (recargarProductos) {
    await recargarProductos();
}

setProductoEditando(null);
          } catch (errorGuardado) {
      console.error(
        "Error guardando producto:",
        errorGuardado
      );

      setError(
        errorGuardado.message ||
          "Ocurrió un error al guardar."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarProducto(id) {
    const confirmar = window.confirm(
      "¿Eliminar este producto?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");

      const respuesta = await fetch(
        `${API_URL}/productos/${id}`,
        {
          method: "DELETE",
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            "No se pudo eliminar el producto."
        );
      }

      
    } catch (errorEliminacion) {
      console.error(
        "Error eliminando producto:",
        errorEliminacion
      );

      setError(
        errorEliminacion.message ||
          "Ocurrió un error al eliminar."
      );
    }
  }

  return (
    <section className="section">
      <h2>🍕 Productos</h2>

      {error && (
        <div className="mensaje-error">
          ⚠️ {error}
        </div>
      )}

      <button
        type="button"
        className="btnAgregar"
        onClick={() => {
          setError("");

          setProductoEditando({
            id: null,
            nombre: "",
            categoria: "Pizza",
            descripcion: "",
            imagen: "",
            precio: 0,
            activo: true,
          });
        }}
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

              <td>
                ${" "}
                {Number(
                  producto.precio || 0
                ).toLocaleString("es-AR")}
              </td>

              <td>
                {producto.imagen ? (
                  <img
                    src={obtenerUrlImagen(
                      producto.imagen
                    )}
                    alt={producto.nombre}
                    style={{
                      width: "75px",
                      height: "55px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  "-"
                )}
              </td>

              <td>
                {producto.descripcion || "-"}
              </td>

              <td>
                <button
                  type="button"
                  className="btnEditar"
                  onClick={() =>
                    editarProducto(producto)
                  }
                >
                  ✏️ Editar
                </button>

                <button
                  type="button"
                  className="btnEliminar"
                  onClick={() =>
                    eliminarProducto(producto.id)
                  }
                >
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
            <h3>
              {productoEditando.id
                ? "Editar producto"
                : "Nuevo producto"}
            </h3>

            {error && (
              <div className="mensaje-error">
                ⚠️ {error}
              </div>
            )}

            <label>Nombre</label>

            <input
              type="text"
              value={productoEditando.nombre}
              onChange={(evento) =>
                setProductoEditando({
                  ...productoEditando,
                  nombre: evento.target.value,
                })
              }
            />

            <label>Categoría</label>

            <select
              value={productoEditando.categoria}
              onChange={(evento) =>
                setProductoEditando({
                  ...productoEditando,
                  categoria: evento.target.value,
                })
              }
            >
              <option value="Pizza">
                Pizza
              </option>

              <option value="Focaccia">
                Focaccia
              </option>

              <option value="Postre">
                Postre
              </option>

              <option value="Bebida">
                Bebida
              </option>

              <option value="Adicional">
                Adicional
              </option>
            </select>

            <label>Descripción</label>

            <textarea
              rows="4"
              value={
                productoEditando.descripcion || ""
              }
              onChange={(evento) =>
                setProductoEditando({
                  ...productoEditando,
                  descripcion:
                    evento.target.value,
                })
              }
            />

            <label>Imagen del producto</label>

            {productoEditando.imagen && (
              <img
                src={obtenerUrlImagen(
                  productoEditando.imagen
                )}
                alt={
                  productoEditando.nombre ||
                  "Producto"
                }
                style={{
                  width: "100%",
                  maxWidth: "360px",
                  height: "220px",
                  objectFit: "cover",
                  display: "block",
                  margin: "10px auto",
                  borderRadius: "12px",
                }}
              />
            )}

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={subiendoImagen}
              onChange={(evento) =>
                subirImagenProducto(
                  evento.target.files?.[0]
                )
              }
            />

            {subiendoImagen && (
              <p>Subiendo imagen...</p>
            )}

            {productoEditando.imagen && (
              <input
                type="text"
                value={productoEditando.imagen}
                readOnly
                style={{
                  marginTop: "8px",
                }}
              />
            )}

            <label>Precio</label>

            <input
              type="number"
              min="0"
              step="1"
              value={productoEditando.precio}
              onChange={(evento) =>
                setProductoEditando({
                  ...productoEditando,
                  precio: evento.target.value,
                })
              }
            />

            <label>
              <input
                type="checkbox"
                checked={
                  productoEditando.activo ?? true
                }
                onChange={(evento) =>
                  setProductoEditando({
                    ...productoEditando,
                    activo:
                      evento.target.checked,
                  })
                }
              />

              Producto activo
            </label>

            <div className="modalBotones">
              <button
                type="button"
                onClick={() => {
                  setProductoEditando(null);
                  setError("");
                }}
                disabled={
                  guardando || subiendoImagen
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={guardarProducto}
                disabled={
                  guardando || subiendoImagen
                }
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Productos;