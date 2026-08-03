    import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import CatalogoProductos from "./Caja/CatalogoProductos";
import PedidoActual from "./Caja/PedidoActual";
import PedidosEnEspera from "./Caja/PedidosEnEspera";
import PedidosWeb from "./Caja/PedidosWeb";
import ProductoModal from "./Caja/ProductoModal";

import {
  API_URL,
  escaparHTML,
  formatearDinero,
  normalizarTexto,
} from "./Caja/formatos";

function Caja({
  productos = [],
  setVentas,
  setStock,
  setClientes,
}) {
  const [carrito, setCarrito] = useState([]);
  const [formaPago, setFormaPago] =
    useState("Efectivo");
  const [montoRecibido, setMontoRecibido] =
    useState("");
  const [ultimaVenta, setUltimaVenta] =
    useState(null);
    const [
  pedidoWebActual,
  setPedidoWebActual,
] = useState(null);
  const [cobrando, setCobrando] = useState(false);

  const [nombreCliente, setNombreCliente] =
    useState("");
  const [telefonoCliente, setTelefonoCliente] =
    useState("");
  const [direccionCliente, setDireccionCliente] =
    useState("");
  const [tipoPedido, setTipoPedido] =
    useState("Retiro");
  const [numeroMesa, setNumeroMesa] = useState("");
  const [observaciones, setObservaciones] =
    useState("");

  const [busqueda, setBusqueda] = useState("");
  const [
    categoriaSeleccionada,
    setCategoriaSeleccionada,
  ] = useState("Todas");

  const [descuentoTipo, setDescuentoTipo] =
    useState("Porcentaje");
  const [descuentoValor, setDescuentoValor] =
    useState("");

  const [pedidosEnEspera, setPedidosEnEspera] =
    useState([]);

  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null);

  const buscadorRef = useRef(null);

  const productosActivos = useMemo(
    () =>
      productos.filter(
        (producto) => producto.activo !== false
      ),
    [productos]
  );

  const categorias = useMemo(() => {
    const mapaCategorias = new Map();

    productosActivos.forEach((producto) => {
      const categoria =
        String(producto.categoria || "Otros").trim() ||
        "Otros";

      const clave = normalizarTexto(categoria);

      if (!mapaCategorias.has(clave)) {
        mapaCategorias.set(clave, categoria);
      }
    });

    return ["Todas", ...mapaCategorias.values()];
  }, [productosActivos]);

  const productosFiltrados = useMemo(() => {
    const textoBuscado = normalizarTexto(busqueda);
    const categoriaBuscada =
      normalizarTexto(categoriaSeleccionada);

    return productosActivos.filter((producto) => {
      const categoriaProducto = normalizarTexto(
        producto.categoria || "Otros"
      );

      const coincideCategoria =
        categoriaSeleccionada === "Todas" ||
        categoriaProducto === categoriaBuscada;

      const contenido = normalizarTexto(
        `${producto.nombre || ""} ${
          producto.descripcion || ""
        } ${producto.categoria || ""}`
      );

      return (
        coincideCategoria &&
        contenido.includes(textoBuscado)
      );
    });
  }, [
    productosActivos,
    busqueda,
    categoriaSeleccionada,
  ]);

  const subtotal = useMemo(
    () =>
      carrito.reduce(
        (total, producto) =>
          total +
          Number(producto.precio || 0) *
            Number(producto.cantidad || 0),
        0
      ),
    [carrito]
  );

  const descuento = useMemo(() => {
    const valor = Math.max(
      Number(descuentoValor || 0),
      0
    );

    if (descuentoTipo === "Porcentaje") {
      return Math.min(
        (subtotal * valor) / 100,
        subtotal
      );
    }

    return Math.min(valor, subtotal);
  }, [descuentoTipo, descuentoValor, subtotal]);

  const totalPedido = Math.max(
    subtotal - descuento,
    0
  );

  const vuelto =
    formaPago === "Efectivo"
      ? Math.max(
          Number(montoRecibido || 0) -
            totalPedido,
          0
        )
      : 0;

  const cantidadArticulos = carrito.reduce(
    (total, producto) =>
      total + Number(producto.cantidad || 0),
    0
  );

  function seleccionarProducto(producto) {
    setProductoSeleccionado(producto);
  }

  const cerrarProductoModal = useCallback(() => {
    setProductoSeleccionado(null);
  }, []);

  function agregarProductoConfigurado({
    producto,
    cantidad,
    observacion,
  }) {
    const carritoId = `${producto.id}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;

    setUltimaVenta(null);

    setCarrito((carritoActual) => [
      ...carritoActual,
      {
        carritoId,
        id: producto.id,
        nombre: producto.nombre,
        categoria: producto.categoria || "Otros",
        precio: Number(producto.precio || 0),
        imagen: producto.imagen || "",
        cantidad: Number(cantidad || 1),
        observacion: String(observacion || "").trim(),
      },
    ]);

    cerrarProductoModal();
  }

  function aumentarCantidad(carritoId) {
    setCarrito((actual) =>
      actual.map((producto) =>
        producto.carritoId === carritoId
          ? {
              ...producto,
              cantidad: producto.cantidad + 1,
            }
          : producto
      )
    );
  }

  function disminuirCantidad(carritoId) {
    setCarrito((actual) =>
      actual
        .map((producto) =>
          producto.carritoId === carritoId
            ? {
                ...producto,
                cantidad: producto.cantidad - 1,
              }
            : producto
        )
        .filter((producto) => producto.cantidad > 0)
    );
  }

  function quitarDelCarrito(carritoId) {
    setCarrito((actual) =>
      actual.filter(
        (producto) => producto.carritoId !== carritoId
      )
    );
  }

  function actualizarObservacionProducto(
    carritoId,
    nuevaObservacion
  ) {
    setCarrito((actual) =>
      actual.map((producto) =>
        producto.carritoId === carritoId
          ? {
              ...producto,
              observacion: nuevaObservacion,
            }
          : producto
      )
    );
  }
function importarPedidoWeb(pedido) {
  if (!pedido) {
    return;
  }

  if (carrito.length > 0) {
    const reemplazar = window.confirm(
      "Hay un pedido cargado en Caja. ¿Querés reemplazarlo por el pedido web?"
    );

    if (!reemplazar) {
      return;
    }
  }

  const productosRecibidos =
    Array.isArray(pedido.productos)
      ? pedido.productos
      : [];

  if (productosRecibidos.length === 0) {
    alert(
      "El pedido web no contiene productos válidos."
    );

    return;
  }

  const productosParaCaja =
    productosRecibidos.map(
      (producto, indice) => ({
        carritoId: `web-${
          pedido.id
        }-${
          producto.id ?? indice
        }-${Date.now()}`,

        id:
          producto.id ??
          indice + 1,

        nombre:
          producto.nombre ||
          `Producto ${indice + 1}`,

        categoria:
          producto.categoria ||
          "Otros",

        precio:
          Number(producto.precio) ||
          0,

        cantidad:
          Number(producto.cantidad) ||
          1,

        imagen:
          producto.imagen || "",

        observacion:
          producto.observaciones ||
          producto.observacion ||
          "",
      })
    );

  const cliente =
    pedido.cliente &&
    typeof pedido.cliente === "object"
      ? pedido.cliente
      : {
          nombre:
            pedido.cliente ||
            "Cliente web",

          telefono:
            pedido.telefono || "",
        };

  const entrega =
    pedido.entrega &&
    typeof pedido.entrega === "object"
      ? pedido.entrega
      : {
          tipo:
            pedido.tipoEntrega ||
            pedido.tipoPedido ||
            "Retiro",

          direccion:
            pedido.direccion || "",
        };

  const pago =
    pedido.pago &&
    typeof pedido.pago === "object"
      ? pedido.pago
      : {
          metodo:
            pedido.formaPago ||
            "Efectivo",

          pagaCon:
            pedido.montoRecibido ||
            "",
        };

  const tipoNormalizado =
    String(entrega.tipo || "")
      .toLowerCase() === "delivery"
      ? "Delivery"
      : "Retiro";

  const formaPagoNormalizada =
    String(pago.metodo || "")
      .toLowerCase() === "efectivo"
      ? "Efectivo"
      : String(pago.metodo || "")
          .toLowerCase() ===
        "mercado pago"
      ? "Mercado Pago"
      : String(pago.metodo || "")
          .toLowerCase() ===
        "transferencia"
      ? "Transferencia"
      : String(pago.metodo || "")
          .toLowerCase() ===
        "tarjeta"
      ? "Tarjeta"
      : "Efectivo";

  setCarrito(productosParaCaja);

  setNombreCliente(
    cliente.nombre ||
      "Cliente web"
  );

  setTelefonoCliente(
    cliente.telefono || ""
  );

  setTipoPedido(tipoNormalizado);

  setDireccionCliente(
    tipoNormalizado === "Delivery"
      ? entrega.direccion || ""
      : ""
  );

  setNumeroMesa("");

  setObservaciones(
    pedido.observaciones || ""
  );

  setFormaPago(
    formaPagoNormalizada
  );

  setMontoRecibido(
    formaPagoNormalizada === "Efectivo" &&
      pago.pagaCon
      ? String(pago.pagaCon)
      : ""
  );

  setDescuentoTipo("Porcentaje");
  setDescuentoValor("");
  setUltimaVenta(null);
  setPedidoWebActual(pedido);

  alert(
    `${
      pedido.numeroPedido ||
      `Pedido #${pedido.id}`
    } cargado correctamente en Caja.`
  );
}

  const limpiarPedido = useCallback(() => {
    setCarrito([]);
    setFormaPago("Efectivo");
    setMontoRecibido("");
    setNombreCliente("");
    setTelefonoCliente("");
    setDireccionCliente("");
    setTipoPedido("Retiro");
    setNumeroMesa("");
    setObservaciones("");
    setDescuentoTipo("Porcentaje");
    setDescuentoValor("");
    setPedidoWebActual(null);
  }, []);

  function nuevaVenta() {
    setUltimaVenta(null);
    limpiarPedido();
  }

  function cambiarTipoPedido(nuevoTipo) {
    setTipoPedido(nuevoTipo);

    if (nuevoTipo !== "Delivery") {
      setDireccionCliente("");
    }

    if (nuevoTipo !== "Mesa") {
      setNumeroMesa("");
    }
  }

  function cambiarFormaPago(nuevaForma) {
    setFormaPago(nuevaForma);
    setMontoRecibido("");
  }

  function validarPedido() {
    if (carrito.length === 0) {
      alert("No hay productos en el pedido.");
      return false;
    }

    if (
      tipoPedido === "Delivery" &&
      !direccionCliente.trim()
    ) {
      alert("Ingresá la dirección del delivery.");
      return false;
    }

    if (
      tipoPedido === "Mesa" &&
      !numeroMesa.trim()
    ) {
      alert("Ingresá el número de mesa.");
      return false;
    }

    if (
      formaPago === "Efectivo" &&
      Number(montoRecibido || 0) < totalPedido
    ) {
      alert("El monto recibido es menor al total.");
      return false;
    }

    return true;
  }

  function crearResumenProductos(items) {
    return items
      .map((producto) => {
        const detalle =
          `${producto.nombre} x${producto.cantidad}`;

        return producto.observacion?.trim()
          ? `${detalle} (${producto.observacion.trim()})`
          : detalle;
      })
      .join(", ");
  }

  async function actualizarDatosRelacionados() {
    try {
      const respuestaStock = await fetch(
        `${API_URL}/stock`
      );

      if (respuestaStock.ok) {
        const stockActualizado =
          await respuestaStock.json();

        if (
          Array.isArray(stockActualizado) &&
          typeof setStock === "function"
        ) {
          setStock(stockActualizado);
        }
      }
    } catch (error) {
      console.warn(
        "No se pudo actualizar el stock:",
        error
      );
    }

    if (typeof setClientes === "function") {
      try {
        const respuestaClientes = await fetch(
          `${API_URL}/clientes`
        );

        if (respuestaClientes.ok) {
          const clientesActualizados =
            await respuestaClientes.json();

          if (Array.isArray(clientesActualizados)) {
            setClientes(clientesActualizados);
          }
        }
      } catch (error) {
        console.warn(
          "No se pudieron actualizar los clientes:",
          error
        );
      }
    }
  }

  const cobrar = useCallback(async () => {
       if (cobrando || !validarPedido()) {
      return;
    }

    const productosDelTicket = carrito.map(
      (producto) => ({ ...producto })
    );

    const ventaParaGuardar = {
      cliente:
        nombreCliente.trim() || "Mostrador",
      telefono: telefonoCliente.trim(),
      tipoPedido,
      direccion:
        tipoPedido === "Delivery"
          ? direccionCliente.trim()
          : "",
      numeroMesa:
        tipoPedido === "Mesa"
          ? numeroMesa.trim()
          : "",
      observaciones: observaciones.trim(),
      producto: crearResumenProductos(
        productosDelTicket
      ),
      productos: productosDelTicket,
      subtotal,
      descuento,
      descuentoTipo,
      descuentoValor: Number(
        descuentoValor || 0
      ),
      total: totalPedido,
      formaPago,
      montoRecibido:
        formaPago === "Efectivo"
          ? Number(montoRecibido || 0)
          : totalPedido,
      vuelto,
      estado: "Nuevo",
    };

    try {
      setCobrando(true);

      const respuesta = await fetch(
        `${API_URL}/ventas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ventaParaGuardar),
        }
      );

      const textoRespuesta =
        await respuesta.text();

      let datos = {};

      try {
        datos = textoRespuesta
          ? JSON.parse(textoRespuesta)
          : {};
      } catch {
        datos = {};
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
            textoRespuesta ||
            "No se pudo registrar la venta."
        );
      }

      if (typeof setVentas === "function") {
        setVentas((ventasActuales) => [
          ...ventasActuales,
          datos,
        ]);
      }

      setUltimaVenta({
        ...ventaParaGuardar,
        ...datos,
        id: datos.id ?? ventaParaGuardar.id,
        fecha:
          datos.fecha || new Date().toISOString(),
        productos: productosDelTicket,
      });

      setCarrito([]);
      setMontoRecibido("");
      setDescuentoValor("");

      await actualizarDatosRelacionados();
if (pedidoWebActual?.id) {
  try {
    const respuestaPedido = await fetch(
      `${API_URL}/pedidos/${pedidoWebActual.id}/estado`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado: "Entregado",
        }),
      }
    );

    const datosPedido =
      await respuestaPedido.json();

    if (!respuestaPedido.ok) {
      throw new Error(
        datosPedido.error ||
          "No se pudo actualizar el pedido web."
      );
    }

    setPedidoWebActual(null);
  } catch (errorPedido) {
    console.error(
      "La venta se cobró, pero no se actualizó el pedido web:",
      errorPedido
    );

    alert(
      "La venta fue cobrada, pero el pedido web no pudo marcarse como entregado."
    );
  }
}
      alert("Venta cobrada correctamente.");
    } catch (error) {
      console.error(
        "Error registrando venta:",
        error
      );

      alert(
        error.message ||
          "Ocurrió un error al registrar la venta."
      );
    } finally {
      setCobrando(false);
    }
  }, [
    cobrando,
    carrito,
    nombreCliente,
    telefonoCliente,
    tipoPedido,
    direccionCliente,
    numeroMesa,
    observaciones,
    subtotal,
    descuento,
    descuentoTipo,
    descuentoValor,
    totalPedido,
    formaPago,
    montoRecibido,
    pedidoWebActual,
    vuelto,
    setVentas,
    setStock,
    setClientes,
  ]);
  function ponerPedidoEnEspera() {
    if (carrito.length === 0) {
      alert(
        "No hay productos para poner en espera."
      );
      return;
    }

    const pedido = {
      id: Date.now(),
      nombre:
        nombreCliente.trim() ||
        `Pedido ${pedidosEnEspera.length + 1}`,
      creado: new Date().toLocaleTimeString(
        "es-AR",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      carrito: carrito.map((producto) => ({
        ...producto,
      })),
      formaPago,
      montoRecibido,
      nombreCliente,
      telefonoCliente,
      direccionCliente,
      tipoPedido,
      numeroMesa,
      observaciones,
      descuentoTipo,
      descuentoValor,
    };

    setPedidosEnEspera((actuales) => [
      ...actuales,
      pedido,
    ]);

    limpiarPedido();
  }

  useEffect(() => {
    function manejarAtajos(evento) {
      if (evento.key === "F2") {
        evento.preventDefault();
        buscadorRef.current?.focus();
      }

      if (evento.key === "F5") {
        evento.preventDefault();
        cobrar();
      }

      if (evento.key === "Escape") {
        evento.preventDefault();

        if (
          carrito.length > 0 &&
          window.confirm(
            "¿Vaciar el pedido actual?"
          )
        ) {
          limpiarPedido();
        }
      }
    }

    window.addEventListener(
      "keydown",
      manejarAtajos
    );

    return () =>
      window.removeEventListener(
        "keydown",
        manejarAtajos
      );
  }, [carrito.length, cobrar, limpiarPedido]);

  

  function recuperarPedido(pedido) {
    if (carrito.length > 0) {
      const reemplazar = window.confirm(
        "Hay un pedido en curso. ¿Querés reemplazarlo?"
      );

      if (!reemplazar) {
        return;
      }
    }

    setCarrito(pedido.carrito);
    setFormaPago(pedido.formaPago);
    setMontoRecibido(pedido.montoRecibido);
    setNombreCliente(pedido.nombreCliente);
    setTelefonoCliente(pedido.telefonoCliente);
    setDireccionCliente(pedido.direccionCliente);
    setTipoPedido(pedido.tipoPedido);
    setNumeroMesa(pedido.numeroMesa);
    setObservaciones(pedido.observaciones);
    setDescuentoTipo(pedido.descuentoTipo);
    setDescuentoValor(pedido.descuentoValor);

    setPedidosEnEspera((actuales) =>
      actuales.filter(
        (item) => item.id !== pedido.id
      )
    );

    setUltimaVenta(null);
  }

  function eliminarPedidoEnEspera(idPedido) {
    if (
      !window.confirm(
        "¿Eliminar este pedido en espera?"
      )
    ) {
      return;
    }

    setPedidosEnEspera((actuales) =>
      actuales.filter(
        (pedido) => pedido.id !== idPedido
      )
    );
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
      alert(
        "El navegador bloqueó la ventana de impresión."
      );
      return;
    }

    const productosHTML = (
      ultimaVenta.productos || []
    )
      .map(
        (producto) => `
          <div class="fila-producto">
            <span>
              ${Number(producto.cantidad)}x
              ${escaparHTML(producto.nombre)}
            </span>
            <span>
              $${formatearDinero(
                Number(producto.precio) *
                  Number(producto.cantidad)
              )}
            </span>
          </div>

          <div class="precio-unitario">
            $${formatearDinero(
              producto.precio
            )} c/u
          </div>

          ${
            producto.observacion
              ? `
                <div class="observacion">
                  Obs.: ${escaparHTML(
                    producto.observacion
                  )}
                </div>
              `
              : ""
          }
        `
      )
      .join("");

    const fechaTicket = ultimaVenta.fecha
      ? new Date(
          ultimaVenta.fecha
        ).toLocaleString("es-AR")
      : new Date().toLocaleString("es-AR");

    ventanaTicket.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>
            Ticket ${escaparHTML(
              ultimaVenta.id || ""
            )}
          </title>

          <style>
            * { box-sizing: border-box; }
            body {
              width: 80mm;
              margin: 0;
              padding: 5mm;
              background: white;
              color: black;
              font-family: Arial, sans-serif;
              font-size: 13px;
            }
            .encabezado,
            .pie { text-align: center; }
            .encabezado h1 {
              margin: 0;
              font-size: 21px;
            }
            .separador {
              border-top: 1px dashed black;
              margin: 9px 0;
            }
            .dato { margin: 4px 0; }
            .fila-producto,
            .fila-total {
              display: flex;
              justify-content: space-between;
              gap: 10px;
            }
            .fila-producto {
              margin-top: 7px;
              font-weight: bold;
            }
            .precio-unitario,
            .observacion {
              font-size: 11px;
              margin-top: 2px;
            }
            .observacion {
              font-style: italic;
            }
            .fila-total {
              margin: 8px 0;
              font-size: 19px;
              font-weight: bold;
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
          <div class="encabezado">
            <h1>El Club de la Masa G</h1>
            <p>Pilar</p>
            <p>WhatsApp: 11 4048-0762</p>
          </div>

          <div class="separador"></div>

          <div class="dato">
            <strong>Ticket:</strong>
            ${escaparHTML(ultimaVenta.id || "-")}
          </div>

          <div class="dato">
            <strong>Fecha:</strong>
            ${escaparHTML(fechaTicket)}
          </div>

          <div class="dato">
            <strong>Cliente:</strong>
            ${escaparHTML(
              ultimaVenta.cliente || "Mostrador"
            )}
          </div>

          ${
            ultimaVenta.telefono
              ? `
                <div class="dato">
                  <strong>Teléfono:</strong>
                  ${escaparHTML(
                    ultimaVenta.telefono
                  )}
                </div>
              `
              : ""
          }

          ${
            ultimaVenta.direccion
              ? `
                <div class="dato">
                  <strong>Dirección:</strong>
                  ${escaparHTML(
                    ultimaVenta.direccion
                  )}
                </div>
              `
              : ""
          }

          ${
            ultimaVenta.numeroMesa
              ? `
                <div class="dato">
                  <strong>Mesa:</strong>
                  ${escaparHTML(
                    ultimaVenta.numeroMesa
                  )}
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
              $${formatearDinero(
                ultimaVenta.total
              )}
            </span>
          </div>

          <div class="dato">
            <strong>Forma de pago:</strong>
            ${escaparHTML(
              ultimaVenta.formaPago
            )}
          </div>

          ${
            ultimaVenta.formaPago === "Efectivo"
              ? `
                <div class="dato">
                  <strong>Recibido:</strong>
                  $${formatearDinero(
                    ultimaVenta.montoRecibido
                  )}
                </div>

                <div class="dato">
                  <strong>Vuelto:</strong>
                  $${formatearDinero(
                    ultimaVenta.vuelto
                  )}
                </div>
              `
              : ""
          }

          ${
            ultimaVenta.observaciones
              ? `
                <div class="separador"></div>
                <div class="dato">
                  <strong>Observaciones:</strong>
                  ${escaparHTML(
                    ultimaVenta.observaciones
                  )}
                </div>
              `
              : ""
          }

          <div class="separador"></div>

          <div class="pie">
            <h2>¡Gracias por tu compra!</h2>
            <p>El Club de la Masa G</p>
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
    <section className="section caja-pro">
      <div className="caja-pro-encabezado">
        <div>
          <h2>💵 Caja PRO</h2>
          <p>
            F2 buscar · F5 cobrar · ESC vaciar pedido
          </p>
        </div>

        <div className="caja-pro-resumen">
          <span>{cantidadArticulos} artículos</span>
          <strong>
            $ {formatearDinero(totalPedido)}
          </strong>
        </div>
      </div>

      <div className="caja-layout">
        <div className="caja-productos-panel">
          <PedidosWeb
  onImportar={importarPedidoWeb}
  pedidoSeleccionadoId={pedidoWebActual?.id}
/>
           
          <CatalogoProductos
            buscadorRef={buscadorRef}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            categorias={categorias}
            categoriaSeleccionada={
              categoriaSeleccionada
            }
            setCategoriaSeleccionada={
              setCategoriaSeleccionada
            }
            productosFiltrados={
              productosFiltrados
            }
            seleccionarProducto={seleccionarProducto}
          />

          <PedidosEnEspera
            pedidos={pedidosEnEspera}
            recuperarPedido={recuperarPedido}
            eliminarPedido={
              eliminarPedidoEnEspera
            }
          />
        </div>

        <PedidoActual
          carrito={carrito}
          nombreCliente={nombreCliente}
          setNombreCliente={setNombreCliente}
          telefonoCliente={telefonoCliente}
          setTelefonoCliente={setTelefonoCliente}
          direccionCliente={direccionCliente}
          setDireccionCliente={setDireccionCliente}
          tipoPedido={tipoPedido}
          cambiarTipoPedido={cambiarTipoPedido}
          numeroMesa={numeroMesa}
          setNumeroMesa={setNumeroMesa}
          observaciones={observaciones}
          setObservaciones={setObservaciones}
          aumentarCantidad={aumentarCantidad}
          disminuirCantidad={disminuirCantidad}
          quitarDelCarrito={quitarDelCarrito}
          actualizarObservacionProducto={
            actualizarObservacionProducto
          }
          descuentoTipo={descuentoTipo}
          setDescuentoTipo={setDescuentoTipo}
          descuentoValor={descuentoValor}
          setDescuentoValor={setDescuentoValor}
          subtotal={subtotal}
          descuento={descuento}
          totalPedido={totalPedido}
          formaPago={formaPago}
          cambiarFormaPago={cambiarFormaPago}
          montoRecibido={montoRecibido}
          setMontoRecibido={setMontoRecibido}
          vuelto={vuelto}
          ponerPedidoEnEspera={
            ponerPedidoEnEspera
          }
          cobrar={cobrar}
          cobrando={cobrando}
          ultimaVenta={ultimaVenta}
          imprimirTicket={imprimirTicket}
          nuevaVenta={nuevaVenta}
        />
      </div>

      {productoSeleccionado && (
        <ProductoModal
          producto={productoSeleccionado}
          onCerrar={cerrarProductoModal}
          onConfirmar={agregarProductoConfigurado}
        />
      )}
    </section>
  );
}

export default Caja;

    
