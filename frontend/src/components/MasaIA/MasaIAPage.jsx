    import { useEffect, useState } from "react";
import ChatMasaIA from "./ChatMasaIA";
import { obtenerDashboardMasaIA } from "./masaIAApi";

function MasaIAPage({ usuarioLogueado }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarDatos() {
    try {
      setCargando(true);
      setDatos(await obtenerDashboardMasaIA());
      setError("");
    } catch (e) {
      setError(e.message || "No se pudo cargar MasaIA.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <section>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ marginBottom: 6 }}>🤖 MasaIA Enterprise</h1>
        <p style={{ color: "#64748b" }}>
          {usuarioLogueado?.nombre || "Administrador"}, el motor inteligente está conectado.
        </p>
        {cargando && <p>Analizando...</p>}
        {error && <p style={{ color: "#b91c1c" }}>⚠️ {error}</p>}
        {datos && (
          <div style={{ padding: 14, borderRadius: 14, background: "#fff" }}>
            Ventas hoy: <strong>{datos.resumen?.cantidadVentasHoy || 0}</strong> · Salud: <strong>{datos.saludNegocio?.puntaje || 0}/100</strong>
          </div>
        )}
      </div>

      <ChatMasaIA />
    </section>
  );
}

export default MasaIAPage;

    
