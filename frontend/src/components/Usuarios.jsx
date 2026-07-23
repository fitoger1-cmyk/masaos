import { useState } from "react";
import { API_URL } from "../config/api";

function Usuarios({ usuarios, setUsuarios }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    usuario: "",
    password: "",
    rol: "cajero",
  });

  function cambiarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setError("");

    setFormulario({
      nombre: "",
      usuario: "",
      password: "",
      rol: "cajero",
    });
  }

  async function guardarUsuario(evento) {
    evento.preventDefault();

    setGuardando(true);
    setError("");

    try {
      const respuesta = await fetch(
        `${API_URL}/usuarios`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formulario),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error || "No se pudo crear el usuario."
        );
      }

      setUsuarios((anteriores) => [...anteriores, datos]);
      cerrarFormulario();
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2>👥 Usuarios</h2>
          <p>Administración de usuarios y permisos del sistema.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setMostrarFormulario(true)}
        >
          + Nuevo usuario
        </button>
      </div>

      {mostrarFormulario && (
        <div className="form-card">
          <h3>Nuevo usuario</h3>

          <form onSubmit={guardarUsuario}>
            <label>
              Nombre
              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={cambiarCampo}
                required
              />
            </label>

            <label>
              Usuario
              <input
                type="text"
                name="usuario"
                value={formulario.usuario}
                onChange={cambiarCampo}
                required
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                name="password"
                value={formulario.password}
                onChange={cambiarCampo}
                required
              />
            </label>

            <label>
              Rol
              <select
                name="rol"
                value={formulario.rol}
                onChange={cambiarCampo}
              >
                <option value="administrador">
                  Administrador
                </option>

                <option value="cajero">
                  Cajero
                </option>

                <option value="cocina">
                  Cocina
                </option>

                <option value="delivery">
                  Delivery
                </option>
              </select>
            </label>

            {error && <p className="error-message">{error}</p>}

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>

              <button
                type="button"
                className="small-button"
                onClick={cerrarFormulario}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {usuarios.length === 0 ? (
        <p>No hay usuarios cargados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.usuario}</td>
                <td>{usuario.rol}</td>
                <td>
                  {usuario.activo ? "Activo" : "Inactivo"}
                </td>
                <td>
                  <button className="small-button">
                    Editar
                  </button>

                  <button className="small-button danger-button">
                    {usuario.activo
                      ? "Desactivar"
                      : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default Usuarios;