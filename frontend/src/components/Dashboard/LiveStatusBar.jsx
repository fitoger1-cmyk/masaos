import { useEffect, useState } from "react";

function Estado({ titulo, activo }) {
  return (
    <div className="live-status-item">
      <span
        className={
          activo
            ? "live-status-dot online"
            : "live-status-dot offline"
        }
      />

      <span>{titulo}</span>
    </div>
  );
}

function LiveStatusBar({
  socketConectado,
}) {
  const [hora, setHora] = useState("");

  useEffect(() => {
    const actualizar = () => {
      setHora(
        new Date().toLocaleTimeString("es-AR")
      );
    };

    actualizar();

    const timer = setInterval(
      actualizar,
      1000
    );

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="live-status-bar">

      <div className="live-status-left">

        <Estado
          titulo="Backend"
          activo
        />

        <Estado
          titulo="Tiempo real"
          activo={socketConectado}
        />

        <Estado
          titulo="Caja"
          activo
        />

        <Estado
          titulo="Cocina"
          activo
        />

        <Estado
          titulo="MasaIA"
          activo
        />

      </div>

      <div className="live-status-right">

        🕒 {hora}

      </div>

    </section>
  );
}

export default LiveStatusBar;