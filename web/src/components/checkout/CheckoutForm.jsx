function CheckoutForm({
  datos,
  errores,
  onChange,
}) {
  const esDelivery =
    datos.tipoEntrega === "delivery";

  return (
    <div className="checkout-form">
      <section className="checkout-bloque">
        <div className="checkout-bloque__titulo">
          <span>1</span>

          <div>
            <h3>Datos del cliente</h3>
            <p>
              Necesitamos estos datos para
              confirmar tu pedido.
            </p>
          </div>
        </div>

        <div className="checkout-grid">
          <label className="checkout-campo">
            <span>Nombre y apellido</span>

            <input
              type="text"
              name="nombre"
              value={datos.nombre}
              onChange={onChange}
              placeholder="Ejemplo: Germán Pérez"
              autoComplete="name"
            />

            {errores.nombre && (
              <small>
                {errores.nombre}
              </small>
            )}
          </label>

          <label className="checkout-campo">
            <span>Celular</span>

            <input
              type="tel"
              name="telefono"
              value={datos.telefono}
              onChange={onChange}
              placeholder="11 4048 0762"
              autoComplete="tel"
            />

            {errores.telefono && (
              <small>
                {errores.telefono}
              </small>
            )}
          </label>
        </div>
      </section>

      <section className="checkout-bloque">
        <div className="checkout-bloque__titulo">
          <span>2</span>

          <div>
            <h3>Entrega del pedido</h3>
            <p>
              Elegí cómo querés recibir tu
              compra.
            </p>
          </div>
        </div>

        <div className="checkout-opciones">
          <label
            className={`checkout-opcion ${
              datos.tipoEntrega ===
              "delivery"
                ? "checkout-opcion--activa"
                : ""
            }`}
          >
            <input
              type="radio"
              name="tipoEntrega"
              value="delivery"
              checked={
                datos.tipoEntrega ===
                "delivery"
              }
              onChange={onChange}
            />

            <span className="checkout-opcion__icono">
              🛵
            </span>

            <div>
              <strong>Delivery</strong>
              <small>
                Recibí el pedido en tu
                domicilio.
              </small>
            </div>
          </label>

          <label
            className={`checkout-opcion ${
              datos.tipoEntrega === "retiro"
                ? "checkout-opcion--activa"
                : ""
            }`}
          >
            <input
              type="radio"
              name="tipoEntrega"
              value="retiro"
              checked={
                datos.tipoEntrega ===
                "retiro"
              }
              onChange={onChange}
            />

            <span className="checkout-opcion__icono">
              🏪
            </span>

            <div>
              <strong>
                Retiro en el local
              </strong>

              <small>
                Te avisaremos cuando esté
                listo.
              </small>
            </div>
          </label>
        </div>

        {esDelivery && (
          <div className="checkout-grid checkout-grid--direccion">
            <label className="checkout-campo checkout-campo--completo">
              <span>Dirección</span>

              <input
                type="text"
                name="direccion"
                value={datos.direccion}
                onChange={onChange}
                placeholder="Calle, altura, piso o departamento"
                autoComplete="street-address"
              />

              {errores.direccion && (
                <small>
                  {errores.direccion}
                </small>
              )}
            </label>

            <label className="checkout-campo">
              <span>Barrio o localidad</span>

              <input
                type="text"
                name="localidad"
                value={datos.localidad}
                onChange={onChange}
                placeholder="Ejemplo: Pilar Centro"
              />
            </label>

            <label className="checkout-campo">
              <span>Referencia</span>

              <input
                type="text"
                name="referencia"
                value={datos.referencia}
                onChange={onChange}
                placeholder="Portón negro, entre calles..."
              />
            </label>
          </div>
        )}
      </section>

      <section className="checkout-bloque">
        <div className="checkout-bloque__titulo">
          <span>3</span>

          <div>
            <h3>Forma de pago</h3>
            <p>
              Seleccioná cómo vas a pagar.
            </p>
          </div>
        </div>

        <div className="checkout-opciones checkout-opciones--pago">
          {[
            {
              valor: "efectivo",
              icono: "💵",
              titulo: "Efectivo",
            },
            {
              valor: "transferencia",
              icono: "🏦",
              titulo: "Transferencia",
            },
            {
              valor: "mercado_pago",
              icono: "💳",
              titulo: "Mercado Pago",
            },
          ].map((opcion) => (
            <label
              key={opcion.valor}
              className={`checkout-opcion ${
                datos.formaPago ===
                opcion.valor
                  ? "checkout-opcion--activa"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="formaPago"
                value={opcion.valor}
                checked={
                  datos.formaPago ===
                  opcion.valor
                }
                onChange={onChange}
              />

              <span className="checkout-opcion__icono">
                {opcion.icono}
              </span>

              <strong>
                {opcion.titulo}
              </strong>
            </label>
          ))}
        </div>

        {datos.formaPago ===
          "efectivo" && (
          <label className="checkout-campo checkout-campo--cambio">
            <span>
              ¿Con cuánto vas a pagar?
            </span>

            <input
              type="number"
              min="0"
              name="pagaCon"
              value={datos.pagaCon}
              onChange={onChange}
              placeholder="Opcional"
            />
          </label>
        )}
      </section>

      <section className="checkout-bloque">
        <div className="checkout-bloque__titulo">
          <span>4</span>

          <div>
            <h3>Observaciones</h3>
            <p>
              Podés agregar indicaciones
              especiales.
            </p>
          </div>
        </div>

        <label className="checkout-campo">
          <textarea
            name="observaciones"
            value={datos.observaciones}
            onChange={onChange}
            rows="4"
            maxLength="300"
            placeholder="Ejemplo: sin aceitunas, tocar timbre, llamar al llegar..."
          />

          <span className="checkout-contador">
            {datos.observaciones.length}/300
          </span>
        </label>
      </section>
    </div>
  );
}

export default CheckoutForm;