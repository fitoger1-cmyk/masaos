import { useEffect, useState } from "react";

import SeguimientoPedido from "../components/Seguimiento/SeguimientoPedido";

function Seguimiento({ onVolver }) {
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(
        "masaos_ultimo_pedido"
      );

      if (guardado) {
        setPedido(JSON.parse(guardado));
      }
    } catch (error) {
      console.error(
        "No se pudo recuperar el pedido:",
        error
      );
    }
  }, []);

  if (!pedido) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div>
          <h1>No hay pedidos para seguir</h1>

          <p>
            Todavía no realizaste ningún
            pedido desde este dispositivo.
          </p>

          <button
            onClick={onVolver}
            style={{
              marginTop: "20px",
            }}
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  return (
    <SeguimientoPedido
      pedidoInicial={pedido}
      onCerrar={onVolver}
    />
  );
}

export default Seguimiento;