export function calcularDescuento(
  precioAnterior,
  precioPromocional
) {
  const anterior = Number(precioAnterior);
  const promo = Number(precioPromocional);

  if (
    !anterior ||
    !promo ||
    promo >= anterior
  ) {
    return 0;
  }

  return Math.round(
    ((anterior - promo) / anterior) * 100
  );
}

export function formatearPrecio(valor) {
  const numero = Number(valor);

  if (isNaN(numero)) {
    return "$0";
  }

  return numero.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

export function obtenerTextoEtiqueta(
  etiqueta
) {
  switch (etiqueta) {
    case "nuevo":
      return "⭐ Nuevo";

    case "oferta":
      return "🔥 Oferta";

    case "mas-vendido":
      return "🥇 Más vendido";

    case "limitado":
      return "🎉 Limitado";

    case "2x1":
      return "💥 2x1";

    case "envio-gratis":
      return "🚚 Envío gratis";

    default:
      return "";
  }
}

export function diasRestantes(
  fechaFin
) {
  if (!fechaFin) return null;

  const hoy = new Date();
  const fin = new Date(fechaFin);

  const diferencia =
    fin.getTime() - hoy.getTime();

  const dias = Math.ceil(
    diferencia / (1000 * 60 * 60 * 24)
  );

  return dias;
}