import { useState } from "react";

function Caja({ productos, setVentas, setStock, setClientes }) {
  const [carrito, setCarrito] = useState([]);
  const [formaPago, setFormaPago] = useState("Efectivo");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [ultimaVenta, setUltimaVenta] = useState(null);
  const [cobrando, setCobrando] = useState(false);

  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [direccionCliente, setDireccionCliente] = useState("");

  const totalPedido = carrito.reduce(
    (total, producto) =>
      total + Number(producto.precio) * Number(producto.cantidad),
    0
  );

  const vuelto =
    formaPago === "Efectivo"
      ? Math.max(Number(montoRecibido || 0) - totalPedido, 0)
      : 0;

  function agregarAlCarrito(producto) {
    setCarrito((carritoActual) => {
      const productoExistente = carritoActual.find(
        (item) => item.id === producto.id
      );

      if (productoExistente) {
        return carritoActual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [
        ...carritoActual,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          cantidad: 1,
        },
      ];
    });
  }

  function aumentarCantidad(idProducto) {
    setCarrito((carritoActual) =>
      carritoActual.map((producto) =>
        producto.id === idProducto
          ? { ...producto, cantidad: producto.cantidad + 1 }
          : producto
      )
    );
  }

  function disminuirCantidad(idProducto) {
    setCarrito((carritoActual) =>
      carritoActual
        .map((producto) =>
          producto.id === idProducto
            ? { ...producto, cantidad: producto.cantidad - 1 }
            : producto
        )
        .filter((producto) => producto.cantidad > 0)
    );
  }

  function quitarDelCarrito(idProducto) {
    setCarrito((carritoActual) =>
      carritoActual.filter((producto) => producto.id !== idProducto)
    );
  }

  async function cobrar() {
    if (carrito.length === 0) {
      alert("No hay productos en el pedido.");
      return;
    }

    if (
      formaPago === "Efectivo" &&
      Number(montoRecibido || 0) < totalPedido
    ) {
      alert("El monto recibido es menor al total.");
      return;
    }

    const productosVendidos = carrito
      .map((producto) => `${producto.nombre} x${producto.cantidad}`)
      .join(", ");

    const ventaParaGuardar = {
      cliente: nombreCliente.trim() || "Mostrador",
      telefono: telefonoCliente.trim(),
      direccion: direccionCliente.trim(),
      producto: productosVendidos,
      cantidad: carrito.reduce(
        (total, producto) => total + producto.cantidad,
        0
      ),
      total: totalPedido,
      formaPago,
      montoRecibido:
        formaPago === "Efectivo" ? Number(montoRecibido || 0) : totalPedido,
      vuelto,
    };

    try {
      setCobrando(true);

      const respuesta = await fetch("http://localhost:3000/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ventaParaGuardar),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || "No se pudo registrar la venta.");
      }

      const productosDelTicket = carrito.map((producto) => ({
        ...producto,
      }));

      setVentas((ventasActuales) => [...ventasActuales, datos]);

      setUltimaVenta({
        ...ventaParaGuardar,
        id: datos.id,
        fecha: datos.fecha || new Date().toISOString().split("T")[0],
        productos: productosDelTicket,
      });

      setCarrito([]);
      setMontoRecibido("");

      const respuestaStock = await fetch("http://localhost:3000/api/stock");
      const stockActualizado = await respuestaStock.json();

      if (Array.isArray(stockActualizado)) {
        setStock(stockActualizado);
      }

      if (setClientes) {
        const respuestaClientes = await fetch(
          "http://localhost:3000/api/clientes"
        );
        const clientesActualizados = await respuestaClientes.json();

        if (Array.isArray(clientesActualizados)) {
          setClientes(clientesActualizados);
        }
      }

      alert("Venta cobrada correctamente.");
    } catch (error) {
      console.error("Error registrando venta:", error);
      alert(error.message);
    } finally {
      setCobrando(false);
    }
  }

  function nuevaVenta() {
    setUltimaVenta(null);
    setCarrito([]);
    setFormaPago("Efectivo");
    setMontoRecibido("");
    setNombreCliente("");
    setTelefonoCliente("");
    setDireccionCliente("");
  }

  function imprimirTicket() {
    if (!ultimaVenta) {
      alert("No hay una venta para imprimir.");
      return;
    }

    const ventanaTicket = window.open(
      "",
      "_blank",
      "width=420,height=700"
    );

    if (!ventanaTicket) {
      alert("El navegador bloqueó la ventana de impresión.");
      return;
    }

    const productosHTML = (ultimaVenta.productos || [])
      .map(
        (producto) => `
          <div class="fila-producto">
            <div>
              ${producto.cantidad}x ${producto.nombre}
            </div>

            <div>
              $${(
                Number(producto.precio) * Number(producto.cantidad)
              ).toLocaleString("es-AR")}
            </div>
          </div>

          <div class="precio-unitario">
            $${Number(producto.precio).toLocaleString("es-AR")} c/u
          </div>
        `
      )
      .join("");

    const fechaTicket = new Date().toLocaleString("es-AR");

    ventanaTicket.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />

          <title>Ticket ${ultimaVenta.id || ""}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              width: 80mm;
              margin: 0;
              padding: 5mm;
              background: white;
              color: black;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 13px;
            }

            .ticket {
              width: 100%;
            }

            .encabezado {
              text-align: center;
            }

            .encabezado h1 {
              margin: 0;
              font-size: 21px;
            }

            .encabezado p {
              margin: 3px 0;
            }

            .separador {
              border-top: 1px dashed black;
              margin: 9px 0;
            }

            .dato {
              margin: 4px 0;
            }

            .fila-producto {
              display: flex;
              justify-content: space-between;
              gap: 10px;
              margin-top: 7px;
              font-weight: bold;
            }

            .precio-unitario {
              margin-top: 2px;
              font-size: 11px;
            }

            .fila-total {
              display: flex;
              justify-content: space-between;
              gap: 10px;
              font-size: 19px;
              font-weight: bold;
              margin: 8px 0;
            }

            .pie {
              text-align: center;
              margin-top: 12px;
            }

            .pie h2 {
              margin: 4px 0;
              font-size: 16px;
            }

            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }

              body {
                width: 80mm;
                padding: 4mm;
              }
            }
          </style>
        </head>

        <body>
          <div class="ticket">
            <div class="encabezado">
              <h1>El Club de la Masa G</h1>
              <p>Pilar</p>
              <p>WhatsApp: 11 4048-0762</p>
            </div>

            <div class="separador"></div>

            <div class="dato">
              <strong>Ticket:</strong> ${ultimaVenta.id || "-"}
            </div>

            <div class="dato">
              <strong>Fecha:</strong> ${fechaTicket}
            </div>

            <div class="dato">
              <strong>Cliente:</strong>
              ${ultimaVenta.cliente || "Mostrador"}
            </div>

            ${
              ultimaVenta.telefono
                ? `
                  <div class="dato">
                    <strong>Teléfono:</strong>
                    ${ultimaVenta.telefono}
                  </div>
                `
                : ""
            }

            ${
              ultimaVenta.direccion
                ? `
                  <div class="dato">
                    <strong>Dirección:</strong>
                    ${ultimaVenta.direccion}
                  </div>
                `
                : ""
            }

            <div class="separador"></div>

            ${productosHTML}

            <div class="separador"></div>

            <div class="fila-total">
              <span>TOTAL</span>
              <span>
                $${Number(ultimaVenta.total).toLocaleString("es-AR")}
              </span>
            </div>

            <div class="dato">
              <strong>Forma de pago:</strong>
              ${ultimaVenta.formaPago}
            </div>

            ${
              ultimaVenta.formaPago === "Efectivo"
                ? `
                  <div class="dato">
                    <strong>Recibido:</strong>
                    $${Number(
                      ultimaVenta.montoRecibido
                    ).toLocaleString("es-AR")}
                  </div>

                  <div class="dato">
                    <strong>Vuelto:</strong>
                    $${Number(ultimaVenta.vuelto).toLocaleString("es-AR")}
                  </div>
                `
                : ""
            }

            <div class="separador"></div>

            <div class="pie">
              <h2>¡Gracias por tu compra!</h2>
              <p>El Club de la Masa G</p>
            </div>
          </div>

          <script>
            window.onload = function () {
              window.print();
            };

            window.onafterprint = function () {
              window.close();
            };
          </script>
        </body>
      </html>
    `);

    ventanaTicket.document.close();
  }

  return (
    <section className="section">
      <h2>💵 Caja</h2>

      <div className="caja-layout">
        <div>
          <h3>Productos disponibles</h3>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {productos
                .filter((producto) => producto.activo !== false)
                .map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.nombre}</td>

                    <td>
                      ${" "}
                      {Number(producto.precio).toLocaleString("es-AR")}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => agregarAlCarrito(producto)}
                      >
                        Agregar
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="ticket">
          <h3>🛒 Pedido</h3>

          <label>Nombre del cliente</label>
          <input
            value={nombreCliente}
            onChange={(event) => setNombreCliente(event.target.value)}
            placeholder="Mostrador o nombre"
          />

          <label>Teléfono</label>
          <input
            value={telefonoCliente}
            onChange={(event) => setTelefonoCliente(event.target.value)}
            placeholder="Ejemplo: 11 4048-0762"
          />

          <label>Dirección</label>
          <input
            value={direccionCliente}
            onChange={(event) => setDireccionCliente(event.target.value)}
            placeholder="Dirección para delivery"
          />

          {carrito.length === 0 && (
            <p>No hay productos agregados.</p>
          )}

          {carrito.map((producto) => (
            <div className="ticket-item" key={producto.id}>
              <div>
                <strong>{producto.nombre}</strong>

                <p>
                  ${Number(producto.precio).toLocaleString("es-AR")} x{" "}
                  {producto.cantidad}
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() => disminuirCantidad(producto.id)}
                  >
                    ➖
                  </button>

                  <span style={{ margin: "0 10px" }}>
                    {producto.cantidad}
                  </span>

                  <button
                    type="button"
                    onClick={() => aumentarCantidad(producto.id)}
                  >
                    ➕
                  </button>
                </div>
              </div>

              <strong>
                ${" "}
                {(
                  Number(producto.precio) *
                  Number(producto.cantidad)
                ).toLocaleString("es-AR")}
              </strong>

              <button
                type="button"
                onClick={() => quitarDelCarrito(producto.id)}
              >
                ❌
              </button>
            </div>
          ))}

          <hr />

          <h2>
            Total: $ {totalPedido.toLocaleString("es-AR")}
          </h2>

          <label>Forma de pago</label>

          <select
            value={formaPago}
            onChange={(event) => setFormaPago(event.target.value)}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Mercado Pago">Mercado Pago</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>

          {formaPago === "Efectivo" && (
            <>
              <label>Monto recibido</label>

              <input
                type="number"
                value={montoRecibido}
                onChange={(event) =>
                  setMontoRecibido(event.target.value)
                }
                placeholder="Ejemplo: 30000"
              />

              <p>
                Vuelto: $ {vuelto.toLocaleString("es-AR")}
              </p>
            </>
          )}

          <button
            type="button"
            onClick={cobrar}
            disabled={carrito.length === 0 || cobrando}
          >
            {cobrando ? "Procesando..." : "Cobrar"}
          </button>

          {ultimaVenta && (
            <div className="ticket-final">
              <h3>✅ Venta realizada</h3>

              <p>Cliente: {ultimaVenta.cliente}</p>

              {ultimaVenta.telefono && (
                <p>Teléfono: {ultimaVenta.telefono}</p>
              )}

              {ultimaVenta.direccion && (
                <p>Dirección: {ultimaVenta.direccion}</p>
              )}

              <p>
                Total: ${" "}
                {Number(ultimaVenta.total).toLocaleString("es-AR")}
              </p>

              <p>Pago: {ultimaVenta.formaPago}</p>

              {ultimaVenta.formaPago === "Efectivo" && (
                <>
                  <p>
                    Recibido: ${" "}
                    {Number(
                      ultimaVenta.montoRecibido
                    ).toLocaleString("es-AR")}
                  </p>

                  <p>
                    Vuelto: ${" "}
                    {Number(
                      ultimaVenta.vuelto
                    ).toLocaleString("es-AR")}
                  </p>
                </>
              )}

              <button type="button" onClick={imprimirTicket}>
                🖨️ Imprimir boleto
              </button>

              <button type="button" onClick={nuevaVenta}>
                Nueva venta
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Caja;