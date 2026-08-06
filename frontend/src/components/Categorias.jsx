import { useState } from "react";
import { apiFetch } from "../services/api";

const categoriaVacia = {
  id: null,
  nombre: "",
  descripcion: "",
  imagen: "",
  icono: "",
  orden: 0,
  activo: true,
};

function Categorias({ categorias = [], recargarCategorias }) {
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    const nombre = editando?.nombre?.trim();
    if (!nombre) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      const respuesta = await apiFetch(
        editando.id ? `/categorias/${editando.id}` : "/categorias",
        {
          method: editando.id ? "PUT" : "POST",
          body: JSON.stringify({ ...editando, nombre }),
        }
      );
      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datos.error || "No se pudo guardar la categoría.");
      await recargarCategorias?.();
      setEditando(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function subirImagen(archivo) {
    if (!archivo) return;
    try {
      setSubiendo(true);
      setError("");
      const formData = new FormData();
      formData.append("imagen", archivo);
      const respuesta = await apiFetch("/multimedia/categoria", {
        method: "POST",
        body: formData,
      });
      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok || !datos.url) throw new Error(datos.error || "No se pudo subir la imagen.");
      setEditando((anterior) => ({ ...anterior, imagen: datos.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  }

  async function eliminar(categoria) {
    if (!window.confirm(`¿Eliminar la categoría ${categoria.nombre}?`)) return;
    try {
      setError("");
      const respuesta = await apiFetch(`/categorias/${categoria.id}`, { method: "DELETE" });
      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datos.error || "No se pudo eliminar la categoría.");
      await recargarCategorias?.();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="section categorias-admin">
      <div className="categorias-admin__header">
        <div>
          <p className="categorias-admin__eyebrow">Catálogo dinámico</p>
          <h2>🗂️ Categorías</h2>
          <p>Creá nuevas líneas de productos sin modificar el código.</p>
        </div>
        <button className="btnAgregar" type="button" onClick={() => setEditando({ ...categoriaVacia, orden: categorias.length + 1 })}>
          ➕ Nueva categoría
        </button>
      </div>

      {error && <div className="mensaje-error">⚠️ {error}</div>}

      <div className="categorias-admin__grid">
        {categorias.map((categoria) => (
          <article className={`categorias-admin__card ${categoria.activo ? "" : "categorias-admin__card--inactiva"}`} key={categoria.id}>
            <div className="categorias-admin__imagen">
              {categoria.imagen ? <img src={categoria.imagen} alt={categoria.nombre} /> : <span>{categoria.icono || "Sin imagen"}</span>}
            </div>
            <div className="categorias-admin__contenido">
              <small>Orden {categoria.orden}</small>
              <h3>{categoria.icono} {categoria.nombre}</h3>
              <p>{categoria.descripcion || "Sin descripción"}</p>
              <strong>{categoria.activo ? "Activa" : "Inactiva"}</strong>
              <div className="categorias-admin__acciones">
                <button type="button" className="btnEditar" onClick={() => setEditando({ ...categoria })}>✏️ Editar</button>
                <button type="button" className="btnEliminar" onClick={() => eliminar(categoria)}>🗑 Eliminar</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editando && (
        <div className="modalFondo">
          <div className="modalCaja categorias-admin__modal">
            <h3>{editando.id ? "Editar categoría" : "Nueva categoría"}</h3>
            {error && <div className="mensaje-error">⚠️ {error}</div>}
            <label>Nombre</label>
            <input value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} placeholder="Ejemplo: Empanadas" />
            <label>Descripción</label>
            <textarea rows="3" value={editando.descripcion} onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })} />
            <div className="categorias-admin__campos-cortos">
              <label>Ícono<input value={editando.icono} onChange={(e) => setEditando({ ...editando, icono: e.target.value })} /></label>
              <label>Orden<input type="number" min="1" value={editando.orden} onChange={(e) => setEditando({ ...editando, orden: Number(e.target.value) })} /></label>
            </div>
            <label>Imagen</label>
            {editando.imagen && <img className="categorias-admin__preview" src={editando.imagen} alt="Vista previa" />}
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={subiendo} onChange={(e) => subirImagen(e.target.files?.[0])} />
            <input value={editando.imagen} onChange={(e) => setEditando({ ...editando, imagen: e.target.value })} placeholder="URL de imagen (opcional)" />
            <label className="categorias-admin__check"><input type="checkbox" checked={editando.activo} onChange={(e) => setEditando({ ...editando, activo: e.target.checked })} /> Categoría activa</label>
            <div className="modalBotones">
              <button type="button" onClick={() => setEditando(null)} disabled={guardando || subiendo}>Cancelar</button>
              <button type="button" onClick={guardar} disabled={guardando || subiendo}>{guardando ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Categorias;
