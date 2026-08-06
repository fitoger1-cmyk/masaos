import {
  calcularDescuento,
  formatearPrecio,
  obtenerTextoEtiqueta,
  diasRestantes,
} from "./hooks";

import "./promociones.css";

function PromocionCard({
  promocion,
  onEditar,
  onEliminar,
  onCambiarEstado,
}) {
  const descuento = calcularDescuento(
    promocion.precioAnterior,
    promocion.precioPromocional
  );

  const dias = diasRestantes(promocion.fin);

  return (
    <article className="promocion-card">

      {promocion.imagen && (
        <img
          src={promocion.imagen}
          alt={promocion.nombre}
          className="promocion-card__imagen"
        />
      )}

      <div className="promocion-card__badges">

        {promocion.etiqueta && (
          <span className="promocion-card__badge">
            {obtenerTextoEtiqueta(
              promocion.etiqueta
            )}
          </span>
        )}

        {descuento > 0 && (
          <span className="promocion-card__descuento">
            -{descuento}%
          </span>
        )}

      </div>

      <div className="promocion-card__contenido">

        <h3>{promocion.nombre}</h3>

        <p>
          {promocion.descripcion}
        </p>

        <div className="promocion-card__precios">

          <span className="precio-anterior">
            {formatearPrecio(
              promocion.precioAnterior
            )}
          </span>

          <span className="precio-actual">
            {formatearPrecio(
              promocion.precioPromocional
            )}
          </span>

        </div>

        {dias !== null && (
          <p className="promocion-card__contador">

            {dias > 0
              ? `Finaliza en ${dias} días`
              : "Finaliza hoy"}

          </p>
        )}

        <div className="promocion-card__estado">

          {promocion.activa
            ? "🟢 Activa"
            : "🔴 Inactiva"}

        </div>

        <div className="promocion-card__acciones">

          <button
            onClick={() =>
              onEditar(promocion)
            }
          >
            ✏️ Editar
          </button>

          <button
            onClick={() =>
              onCambiarEstado(
                promocion
              )
            }
          >
            {promocion.activa
              ? "⏸ Desactivar"
              : "▶ Activar"}
          </button>

          <button
            onClick={() =>
              onEliminar(
                promocion.id
              )
            }
          >
            🗑 Eliminar
          </button>

        </div>

      </div>

    </article>
  );
}

export default PromocionCard;