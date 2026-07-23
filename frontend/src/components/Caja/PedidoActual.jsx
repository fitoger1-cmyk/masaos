    import CarritoItem from "./CarritoItem";
import VentaFinal from "./VentaFinal";
import { formatearDinero } from "./formatos";

function PedidoActual({
  carrito,
  nombreCliente,
  setNombreCliente,
  telefonoCliente,
  setTelefonoCliente,
  direccionCliente,
  setDireccionCliente,
  tipoPedido,
  cambiarTipoPedido,
  numeroMesa,
  setNumeroMesa,
  observaciones,
  setObservaciones,
  aumentarCantidad,
  disminuirCantidad,
  quitarDelCarrito,
  actualizarObservacionProducto,
  descuentoTipo,
  setDescuentoTipo,
  descuentoValor,
  setDescuentoValor,
  subtotal,
  descuento,
  totalPedido,
  formaPago,
  cambiarFormaPago,
  montoRecibido,
  setMontoRecibido,
  vuelto,
  ponerPedidoEnEspera,
  cobrar,
  cobrando,
  ultimaVenta,
  imprimirTicket,
  nuevaVenta,
}) {
  return (
    <div className="ticket caja-ticket-pro">
      <h3>🛒 Pedido actual</h3>

      <label>Nombre del cliente</label>
      <input
        value={nombreCliente}
        onChange={(evento) =>
          setNombreCliente(evento.target.value)
        }
        placeholder="Mostrador o nombre"
      />

      <label>Tipo de pedido</label>
      <select
        value={tipoPedido}
        onChange={(evento) =>
          cambiarTipoPedido(evento.target.value)
        }
      >
        <option value="Retiro">🏠 Retira en local</option>
        <option value="Delivery">🚚 Delivery</option>
        <option value="Mesa">🍽 Mesa</option>
      </select>

      {tipoPedido !== "Mesa" && (
        <>
          <label>Teléfono</label>
          <input
            value={telefonoCliente}
            onChange={(evento) =>
              setTelefonoCliente(evento.target.value)
            }
            placeholder="Ejemplo: 11 4048-0762"
          />
        </>
      )}

      {tipoPedido === "Delivery" && (
        <>
          <label>Dirección</label>
          <input
            value={direccionCliente}
            onChange={(evento) =>
              setDireccionCliente(evento.target.value)
            }
            placeholder="Dirección para delivery"
          />
        </>
      )}

      {tipoPedido === "Mesa" && (
        <>
          <label>Número de mesa</label>
          <input
            value={numeroMesa}
            onChange={(evento) =>
              setNumeroMesa(evento.target.value)
            }
            placeholder="Ejemplo: 8"
          />
        </>
      )}

      <div className="caja-carrito-lista">
        {carrito.length === 0 ? (
          <p>No hay productos agregados.</p>
        ) : (
          carrito.map((producto) => (
            <CarritoItem
              key={producto.carritoId}
              producto={producto}
              aumentarCantidad={aumentarCantidad}
              disminuirCantidad={disminuirCantidad}
              quitarDelCarrito={quitarDelCarrito}
              actualizarObservacion={
                actualizarObservacionProducto
              }
            />
          ))
        )}
      </div>

      <label>Observaciones generales</label>
      <textarea
        value={observaciones}
        onChange={(evento) =>
          setObservaciones(evento.target.value)
        }
        placeholder="Cortar en 8, tocar timbre, entregar después de las 21..."
        rows={3}
      />

      <div className="caja-descuento">
        <label>Descuento</label>

        <div>
          <select
            value={descuentoTipo}
            onChange={(evento) =>
              setDescuentoTipo(evento.target.value)
            }
          >
            <option value="Porcentaje">
              Porcentaje (%)
            </option>
            <option value="Importe">Importe ($)</option>
          </select>

          <input
            type="number"
            min="0"
            value={descuentoValor}
            onChange={(evento) =>
              setDescuentoValor(evento.target.value)
            }
            placeholder="0"
          />
        </div>
      </div>

      <div className="caja-totales">
        <p>
          <span>Subtotal</span>
          <strong>$ {formatearDinero(subtotal)}</strong>
        </p>

        {descuento > 0 && (
          <p>
            <span>Descuento</span>
            <strong>
              - $ {formatearDinero(descuento)}
            </strong>
          </p>
        )}

        <h2>
          <span>Total</span>
          <strong>
            $ {formatearDinero(totalPedido)}
          </strong>
        </h2>
      </div>

      <label>Forma de pago</label>
      <select
        value={formaPago}
        onChange={(evento) =>
          cambiarFormaPago(evento.target.value)
        }
      >
        <option value="Efectivo">💵 Efectivo</option>
        <option value="Mercado Pago">
          📱 Mercado Pago
        </option>
        <option value="Tarjeta">💳 Tarjeta</option>
        <option value="Transferencia">
          🏦 Transferencia
        </option>
      </select>

      {formaPago === "Efectivo" && (
        <div className="caja-efectivo">
          <label>Monto recibido</label>
          <input
            type="number"
            min="0"
            value={montoRecibido}
            onChange={(evento) =>
              setMontoRecibido(evento.target.value)
            }
            placeholder="Ejemplo: 30000"
          />

          <p>
            Vuelto:{" "}
            <strong>$ {formatearDinero(vuelto)}</strong>
          </p>
        </div>
      )}

      <div className="caja-acciones">
        <button
          type="button"
          className="boton-secundario"
          onClick={ponerPedidoEnEspera}
          disabled={carrito.length === 0 || cobrando}
        >
          ⏸ Espera
        </button>

        <button
          type="button"
          className="boton-cobrar"
          onClick={cobrar}
          disabled={carrito.length === 0 || cobrando}
        >
          {cobrando ? "Procesando..." : "💵 Cobrar (F5)"}
        </button>
      </div>

      <VentaFinal
        venta={ultimaVenta}
        imprimirTicket={imprimirTicket}
        nuevaVenta={nuevaVenta}
      />
    </div>
  );
}

export default PedidoActual;

    
