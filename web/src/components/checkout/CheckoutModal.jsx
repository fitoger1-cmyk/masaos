import {
  useEffect,
  useState,
} from "react";

import {
  useCarrito,
} from "../../hooks/useCarrito";

import CheckoutForm from "./CheckoutForm";
import ResumenPedido from "./ResumenPedido";

import "./checkout.css";

import { construirPedido } from "../../services/pedidoService";
import { generarLinkWhatsApp } from "../../utils/whatsapp";
import {
  crearPreferenciaPago,
} from "../../services/pago/mercadoPagoService";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const datosIniciales = {
  nombre: "",
  telefono: "",

  tipoEntrega: "delivery",

  direccion: "",
  localidad: "",
  referencia: "",

  formaPago: "efectivo",
  pagaCon: "",

  observaciones: "",
};

function CheckoutModal({
  abierto,
  onCerrar,
}) {
  const {
    items,
    subtotal,
    cantidadTotal,
    vaciarCarrito,
  } = useCarrito();

  const [datos, setDatos] =
    useState(datosIniciales);

  const [errores, setErrores] =
    useState({});

  const [enviando, setEnviando] =
    useState(false);

  const [errorEnvio, setErrorEnvio] =
    useState("");

  const [pedidoConfirmado, setPedidoConfirmado] =
    useState(null);

  useEffect(() => {
    function cerrarConEscape(evento) {
      if (
        evento.key === "Escape" &&
        abierto &&
        !enviando
      ) {
        onCerrar();
      }
    }

    window.addEventListener(
      "keydown",
      cerrarConEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        cerrarConEscape
      );
    };
  }, [
    abierto,
    onCerrar,
    enviando,
  ]);

  useEffect(() => {
    if (abierto) {
      document.body.classList.add(
        "checkout-activo"
      );
    } else {
      document.body.classList.remove(
        "checkout-activo"
      );
    }

    return () => {
      document.body.classList.remove(
        "checkout-activo"
      );
    };
  }, [abierto]);

  useEffect(() => {
    if (abierto) {
      setErrorEnvio("");
      setPedidoConfirmado(null);
    }
  }, [abierto]);

  function manejarCambio(evento) {
    const {
      name,
      value,
    } = evento.target;

    setDatos((datosActuales) => ({
      ...datosActuales,
      [name]: value,
    }));

    setErrores((erroresActuales) => ({
      ...erroresActuales,
      [name]: "",
    }));

    setErrorEnvio("");
  }

  function validarFormulario() {
    const nuevosErrores = {};

    if (!datos.nombre.trim()) {
      nuevosErrores.nombre =
        "Ingresá tu nombre.";
    }

    const telefonoLimpio =
      datos.telefono.replace(/\D/g, "");

    if (telefonoLimpio.length < 8) {
      nuevosErrores.telefono =
        "Ingresá un celular válido.";
    }

    if (
      datos.tipoEntrega ===
        "delivery" &&
      !datos.direccion.trim()
    ) {
      nuevosErrores.direccion =
        "Ingresá la dirección de entrega.";
    }

    if (items.length === 0) {
      nuevosErrores.carrito =
        "El carrito está vacío.";
    }

    setErrores(nuevosErrores);

    return (
      Object.keys(nuevosErrores)
        .length === 0
    );
  }

  
  async function confirmarPedido(
    evento
  ) {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setEnviando(true);
    setErrorEnvio("");

    const pedido = construirPedido({
  datos,
  items,
  subtotal,
  cantidadTotal,
});

    console.log(
      "Enviando pedido a MasaOS:",
      pedido
    );

    try {
      const respuesta = await fetch(
        `${API_URL}/pedidos`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(pedido),
        }
      );

      let resultado = null;

      try {
        resultado =
          await respuesta.json();
      } catch {
        resultado = null;
      }

      if (!respuesta.ok) {
        throw new Error(
          resultado?.error ||
            resultado?.mensaje ||
            "No se pudo registrar el pedido."
        );
      }

      const pedidoGuardado =
        resultado?.pedido ||
        resultado;

             console.log(
        "Pedido registrado:",
        pedidoGuardado
      );

      setPedidoConfirmado(
  pedidoGuardado
);

localStorage.setItem(
  "masaos_ultimo_pedido",
  JSON.stringify(
    pedidoGuardado
  )
);

vaciarCarrito();
const linkWhatsApp = generarLinkWhatsApp({
  numeroPedido:
    pedidoGuardado.numeroPedido ||
    pedidoGuardado.id,

  cliente: datos.nombre,

  telefono: datos.telefono,

  direccion:
    datos.tipoEntrega === "delivery"
      ? datos.direccion
      : "Retira en el local",

  metodoPago: datos.formaPago,

  observaciones:
    datos.observaciones,

  items: items.map((item) => ({
    nombre: item.nombre,
    cantidad: item.cantidad,
    tamaño:
      item.tamaño ||
      item.tamano ||
      "",
    precio: item.precio,
  })),

  subtotal,

  envio: 0,

  total: subtotal,
});


      setDatos(datosIniciales);
      setErrores({});
 if (datos.formaPago === "mercado_pago") {
         const preferencia =
           await crearPreferenciaPago(
            pedidoGuardado
           );

       window.location.href =
       preferencia.init_point ||
       preferencia.sandbox_init_point;

      return;
    }
    } catch (error) {
      console.error(
        "Error enviando pedido:",
        error
      );

      setErrorEnvio(
        error.message ||
          "No se pudo conectar con MasaOS. Revisá que el backend esté encendido."
      );
    } finally {
      setEnviando(false);
    }
  }

function cerrarCheckout() {
  if (enviando) {
    return;
  }

  setPedidoConfirmado(null);
  setErrorEnvio("");
  onCerrar();
}

  function abrirSeguimiento() {
  if (!pedidoConfirmado) {
    return;
  }

  localStorage.setItem(
    "masaos_ultimo_pedido",
    JSON.stringify(
      pedidoConfirmado
    )
  );

  localStorage.setItem(
    "masaos_pantalla",
    "seguimiento"
  );

  onCerrar();

  window.dispatchEvent(
    new CustomEvent(
      "masaos:abrir-seguimiento"
    )
  );
}

  if (!abierto) {
    return null;
  }

  if (pedidoConfirmado) {
    return (
      <div
        className="checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-confirmado-titulo"
      >
        <div
          className="checkout-modal__overlay"
          onClick={cerrarCheckout}
        />

        <div className="checkout-modal__panel">
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                marginBottom: "16px",
              }}
            >
              ✅
            </div>

            <span>
              Pedido recibido
            </span>

            <h2
              id="checkout-confirmado-titulo"
            >
              ¡Gracias por tu compra!
            </h2>

            <p>
              Tu pedido fue enviado
              correctamente a MasaOS.
            </p>

            <p
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginTop: "20px",
              }}
            >
              Pedido{" "}
              {pedidoConfirmado.numeroPedido ||
                `#${pedidoConfirmado.id}`}
            </p>

            <p>
              Estado:{" "}
              <strong>
                {pedidoConfirmado.estado ||
                  "Nuevo"}
              </strong>
            </p>

            <button
  type="button"
  className="checkout-confirmar"
  onClick={abrirSeguimiento}
  style={{
    marginTop: "24px",
  }}
>
  Seguir mi pedido
</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="checkout-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-titulo"
    >
      <div
        className="checkout-modal__overlay"
        onClick={cerrarCheckout}
      />

      <div className="checkout-modal__panel">
        <header className="checkout-modal__header">
          <div>
            <span>
              Último paso
            </span>

            <h2 id="checkout-titulo">
              Finalizar pedido
            </h2>

            <p>
              Revisá tus datos antes de
              confirmar.
            </p>
          </div>

          <button
            type="button"
            onClick={cerrarCheckout}
            aria-label="Cerrar checkout"
            disabled={enviando}
          >
            ×
          </button>
        </header>

        <form
          className="checkout-modal__contenido"
          onSubmit={confirmarPedido}
        >
          <div className="checkout-modal__formulario">
            <CheckoutForm
              datos={datos}
              errores={errores}
              onChange={manejarCambio}
            />

            {errores.carrito && (
              <p
                role="alert"
                style={{
                  color: "#b42318",
                  fontWeight: "600",
                }}
              >
                {errores.carrito}
              </p>
            )}

            {errorEnvio && (
              <div
                role="alert"
                style={{
                  background: "#fff0f0",
                  border:
                    "1px solid #f3b4b4",
                  borderRadius: "10px",
                  color: "#a40000",
                  marginTop: "16px",
                  padding: "12px",
                }}
              >
                <strong>
                  No pudimos enviar el
                  pedido.
                </strong>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                  }}
                >
                  {errorEnvio}
                </p>
              </div>
            )}
          </div>

          <div className="checkout-modal__resumen">
            <ResumenPedido
              items={items}
              subtotal={subtotal}
              tipoEntrega={
                datos.tipoEntrega
              }
            />

            <button
              type="submit"
              className="checkout-confirmar"
              disabled={
                enviando ||
                items.length === 0
              }
            >
              {enviando
                ? "Enviando pedido..."
                : "Confirmar pedido"}
            </button>

            <button
              type="button"
              className="checkout-volver"
              onClick={cerrarCheckout}
              disabled={enviando}
            >
              Volver al carrito
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckoutModal;