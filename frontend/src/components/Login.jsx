import { useState } from "react";
import { API_URL } from "../config/api";

function Login({ onLogin }) {
  const [formulario, setFormulario] = useState({
    usuario: "",
    password: "",
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  function cambiarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function iniciarSesion(evento) {
    evento.preventDefault();

    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch(
        `${API_URL}/login`,
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
          datos.error || "No se pudo iniciar sesión."
        );
      }

      onLogin(
  datos.usuario,
  datos.token
);
    } catch (errorLogin) {
      setError(errorLogin.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🍕</div>

        <h1>MasaOS</h1>

        <p>Ingresá para continuar</p>

        <form onSubmit={iniciarSesion}>
          <label>
            Usuario
            <input
              type="text"
              name="usuario"
              value={formulario.usuario}
              onChange={cambiarCampo}
              autoComplete="username"
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
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={cargando}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;