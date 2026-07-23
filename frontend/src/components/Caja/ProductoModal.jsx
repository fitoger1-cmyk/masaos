    import { useEffect, useMemo, useState } from "react";
import { formatearDinero } from "./formatos";

const OPCIONES_RAPIDAS = [
  "Sin aceitunas",
  "Bien cocida",
  "Cortar en 8",
];

function ProductoModal({
  producto,
  onCerrar,
  onConfirmar,
}) {
  const [cantidad, setCantidad] = useState(1);
  const [observacion, setObservacion] = useState("");
  const [opciones, setOpciones] = useState([]);

  useEffect(() => {
    function cerrarConEscape(evento) {
      if (evento.key === "Escape") {
        onCerrar();
      }
    }

    window.addEventListener("keydown", cerrarConEscape);

    return () =>
      window.removeEventListener(
        "keydown",
        cerrarConEscape
      );
  }, [onCerrar]);

  const observacionFinal = useMemo(() => {
    return [...opciones, observacion.trim()]
      .filter(Boolean)
      .join(" · ");
  }, [opciones, observacion]);

  function alternarOpcion(opcion) {
    setOpciones((actuales) =>
      actuales.includes(opcion)
        ? actuales.filter((item) => item !== opcion)
        : [...actuales, opcion]
    );
  }

  function confirmar() {
    onConfirmar({
      producto,
      cantidad,
      observacion: observacionFinal,
    });
  }

  return (
    <div
      className="producto-modal-fondo"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          onCerrar();
        }
      }}
    >
      <div
        className="producto-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="producto-modal-titulo"
      >
        <button
          type="button"
          className="producto-modal-cerrar"
          onClick={onCerrar}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="producto-modal-encabezado">
          <div className="producto-modal-icono">🍕</div>

          <div>
            <span>{producto.categoria || "Producto"}</span>
            <h2 id="producto-modal-titulo">
              {producto.nombre}
            </h2>
            <strong>
              $ {formatearDinero(producto.precio)}
            </strong>
          </div>
        </div>

        <div className="producto-modal-seccion">
          <label>Cantidad</label>

          <div className="producto-modal-cantidad">
            <button
              type="button"
              onClick={() =>
                setCantidad((actual) =>
                  Math.max(actual - 1, 1)
                )
              }
            >
              −
            </button>

            <strong>{cantidad}</strong>

            <button
              type="button"
              onClick={() =>
                setCantidad((actual) => actual + 1)
              }
            >
              +
            </button>
          </div>
        </div>

        <div className="producto-modal-seccion">
          <label>Opciones rápidas</label>

          <div className="producto-modal-opciones">
            {OPCIONES_RAPIDAS.map((opcion) => (
              <button
                type="button"
                key={opcion}
                className={
                  opciones.includes(opcion)
                    ? "seleccionada"
                    : ""
                }
                onClick={() => alternarOpcion(opcion)}
              >
                {opciones.includes(opcion) ? "✓ " : ""}
                {opcion}
              </button>
            ))}
          </div>
        </div>

        <div className="producto-modal-seccion">
          <label htmlFor="observacion-producto">
            Observación especial
          </label>

          <textarea
            id="observacion-producto"
            value={observacion}
            onChange={(evento) =>
              setObservacion(evento.target.value)
            }
            placeholder="Ejemplo: sin cebolla, mitad queso..."
            rows={3}
            autoFocus
          />
        </div>

        {observacionFinal && (
          <div className="producto-modal-resumen">
            <strong>Se enviará a Cocina:</strong>
            <p>{observacionFinal}</p>
          </div>
        )}

        <div className="producto-modal-total">
          <span>Total del producto</span>
          <strong>
            $ {formatearDinero(
              Number(producto.precio) * cantidad
            )}
          </strong>
        </div>

        <div className="producto-modal-acciones">
          <button
            type="button"
            className="producto-modal-cancelar"
            onClick={onCerrar}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="producto-modal-agregar"
            onClick={confirmar}
          >
            🛒 Agregar al pedido
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductoModal;

    
