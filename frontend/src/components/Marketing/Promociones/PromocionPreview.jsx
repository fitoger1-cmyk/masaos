import {
  calcularDescuento,
  formatearPrecio,
  obtenerTextoEtiqueta,
} from "./hooks";

import "./promociones.css";

function PromocionPreview({
  formulario,
}) {
  const descuento =
    calcularDescuento(
      formulario.precioAnterior,
      formulario.precioPromocional
    );

  return (
    <section className="promocion-preview">

      <h3>
        👀 Vista previa
      </h3>

      <article className="promocion-card">

        {formulario.imagen && (
          <img
            src={formulario.imagen}
            alt={formulario.nombre}
            className="promocion-card__imagen"
          />
        )}

        <div className="promocion-card__badges">

          {formulario.etiqueta && (
            <span className="promocion-card__badge">
              {obtenerTextoEtiqueta(
                formulario.etiqueta
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

          <h3>
            {formulario.nombre ||
              "Nombre de la promoción"}
          </h3>

          <p>
            {formulario.descripcion ||
              "La descripción aparecerá aquí."}
          </p>

          <div className="promocion-card__precios">

            <span className="precio-anterior">
              {formatearPrecio(
                formulario.precioAnterior
              )}
            </span>

            <span className="precio-actual">
              {formatearPrecio(
                formulario.precioPromocional
              )}
            </span>

          </div>

          <button
            className="promocion-preview__boton"
          >
            Pedir ahora
          </button>

        </div>

      </article>

    </section>
  );
}

export default PromocionPreview;