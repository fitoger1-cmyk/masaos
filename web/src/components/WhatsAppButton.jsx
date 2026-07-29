import { generarLinkWhatsApp } from "../utils/whatsapp";

function WhatsAppButton({
  pedido,
  texto = "Enviar pedido por WhatsApp",
  className = "",
}) {
  function enviarPedido() {
    const url = generarLinkWhatsApp(pedido);

    window.open(url, "_blank");
  }

  return (
    <button
      className={className}
      onClick={enviarPedido}
      type="button"
    >
      📲 {texto}
    </button>
  );
}

export default WhatsAppButton;