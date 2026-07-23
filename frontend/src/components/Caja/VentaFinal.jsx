    import { formatearDinero } from "./formatos";

function VentaFinal({
  venta,
  imprimirTicket,
  nuevaVenta,
}) {
  if (!venta) {
    return null;
  }

  return (
    <div className="ticket-final">
      <h3>✅ Venta realizada</h3>

      <p>Cliente: {venta.cliente}</p>

      {venta.telefono && (
        <p>Teléfono: {venta.telefono}</p>
      )}

      {venta.direccion && (
        <p>Dirección: {venta.direccion}</p>
      )}

      {venta.numeroMesa && (
        <p>Mesa: {venta.numeroMesa}</p>
      )}

      <p>
        Total: $ {formatearDinero(venta.total)}
      </p>

      <p>Pago: {venta.formaPago}</p>

      {venta.formaPago === "Efectivo" && (
        <>
          <p>
            Recibido: $ {formatearDinero(
              venta.montoRecibido
            )}
          </p>

          <p>
            Vuelto: $ {formatearDinero(venta.vuelto)}
          </p>
        </>
      )}

      <button type="button" onClick={imprimirTicket}>
        🖨️ Imprimir ticket
      </button>

      <button type="button" onClick={nuevaVenta}>
        Nueva venta
      </button>
    </div>
  );
}

export default VentaFinal;

    
