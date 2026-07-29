const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

/**
 * Crea una preferencia de pago en el backend.
 *
 * @param {object} pedido Pedido registrado en MasaOS.
 * @returns {Promise<object>} Preferencia creada por Mercado Pago.
 */
export async function crearPreferenciaPago(pedido) {
  if (!pedido) {
    throw new Error(
      "No se recibió el pedido para crear el pago."
    );
  }

  const respuesta = await fetch(
    `${API_URL}/mercadopago/preferencia`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pedido),
    }
  );

  const contenido = await respuesta.text();

  let datos;

  try {
    datos = contenido
      ? JSON.parse(contenido)
      : {};
  } catch {
    throw new Error(
      "El servidor devolvió una respuesta inválida."
    );
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.error ||
        datos.mensaje ||
        "No se pudo crear la preferencia de pago."
    );
  }

  if (!datos.init_point && !datos.sandbox_init_point) {
    throw new Error(
      "Mercado Pago no devolvió un enlace de pago."
    );
  }
console.log(
  "Respuesta completa Mercado Pago:",
  datos
);
  return datos;
}

/**
 * Comprueba que la ruta del backend responda.
 */
export async function probarConexionMercadoPago() {
  const pedidoPrueba = {
    numeroPedido: `PRUEBA-${Date.now()}`,
    productos: [
      {
        nombre: "Producto de prueba MasaOS",
        cantidad: 1,
        precio: 100,
      },
    ],
  };

  return crearPreferenciaPago(pedidoPrueba);
}