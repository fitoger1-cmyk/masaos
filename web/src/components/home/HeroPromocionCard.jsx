import "./HeroPromocionCard.css";

function calcularDescuento(anterior, actual) {
  const precioAnterior = Number(anterior || 0);
  const precioActual = Number(actual || 0);

  if (
    precioAnterior <= 0 ||
    precioActual <= 0 ||
    precioActual >= precioAnterior
  ) {
    return 0;
  }

  return Math.round(
    ((precioAnterior - precioActual) /
      precioAnterior) *
      100
  );
}

function HeroPromocionCard({
  promocion,
}) {
  if (!promocion) return null;

  const descuento =
    calcularDescuento(
      promocion.precioAnterior,
      promocion.precioPromocional
    );

  const ahorro =
    Number(promocion.precioAnterior) -
    Number(promocion.precioPromocional);

  return (
    <article className="hero-promo card fade-in">

      {promocion.imagen && (
        <img
          src={promocion.imagen}
          alt={promocion.nombre}
          className="hero-promo__imagen"
        />
      )}

      <div className="hero-promo__contenido">

        <span className="hero-promo__badge">
          🔥 PROMOCIÓN DEL DÍA
        </span>

        <h2>{promocion.nombre}</h2>

        <p>
          {promocion.descripcion}
        </p>

        <div className="hero-promo__precios">

          {Number(
            promocion.precioAnterior
          ) > 0 && (
            <span className="hero-promo__anterior">
              $
              {Number(
                promocion.precioAnterior
              ).toLocaleString("es-AR")}
            </span>
          )}

          <strong>
            $
            {Number(
              promocion.precioPromocional
            ).toLocaleString("es-AR")}
          </strong>

        </div>

        {descuento > 0 && (
          <p className="hero-promo__ahorro">
            💥 Ahorrás $
            {ahorro.toLocaleString("es-AR")}
          </p>
        )}

        <button className="btn btn--primary">
          Aprovechar oferta
        </button>

      </div>

      {descuento > 0 && (
        <span className="hero-promo__descuento">
          -{descuento}%
        </span>
      )}

    </article>
  );
}

export default HeroPromocionCard;