import { useEffect, useState } from "react";

function Navbar({
  nombreNegocio,
  logo,
}) {
  const [logoConError, setLogoConError] = useState(false);

  useEffect(() => {
    setLogoConError(false);
  }, [logo]);

  return (
    <header className="navbar">
      <div className="navbar__contenido">
        <a
          href="#inicio"
          className="marca"
        >
          <div className="marca__logo">
            {logo && !logoConError ? (
              <img
                src={logo}
                alt={`Logo de ${nombreNegocio}`}
                onError={() => setLogoConError(true)}
              />
            ) : (
              <span>🍕</span>
            )}
          </div>

          <div>
            <strong>{nombreNegocio}</strong>
            <span>Pizzas artesanales</span>
          </div>
        </a>

        <nav className="navbar__menu">
          <a href="#menu">Menú</a>

          <a href="#promociones">
            Promociones
          </a>

          <a href="#nosotros">
            Nosotros
          </a>
        </nav>

        <a
          className="boton boton--navbar"
          href="#menu"
        >
          Pedir ahora
        </a>
      </div>
    </header>
  );
}

export default Navbar;
