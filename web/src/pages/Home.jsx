import Navbar from
  "../components/layout/Navbar";

import Footer from
  "../components/layout/Footer";

import Hero from
  "../components/home/Hero";

import Promociones from
  "../components/home/Promociones";

import ProductosDestacados from
  "../components/home/ProductosDestacados";

import Categorias from
  "../components/home/Categorias";

import Nosotros from
  "../components/home/Nosotros";

import BotonCarrito from
  "../components/carrito/BotonCarrito";

import DrawerCarrito from
  "../components/carrito/DrawerCarrito";

import {
  useWeb,
} from "../hooks/useWeb";

import {
  useCarrito,
} from "../hooks/useCarrito";

function Home() {
  const {
    configuracion,
    productosDestacados,
    categorias,

    nombreNegocio,
    direccion,
    envio,

    logo,
    banner,

    enlaceWhatsApp,

    tituloHero,
    subtituloHero,
    textoBotonHero,

    estiloHero,
  } = useWeb();

  const {
    agregarProducto,
  } = useCarrito();

  return (
    <>
      <Navbar
        nombreNegocio={nombreNegocio}
        logo={logo}
      />

      <main>
        <Hero
          titulo={tituloHero}
          subtitulo={subtituloHero}
          textoBoton={textoBotonHero}
          enlaceWhatsApp={enlaceWhatsApp}
          horarios={configuracion.horarios}
          envio={envio}
          estiloHero={estiloHero}
        />

        <Promociones />

        <ProductosDestacados
          productos={productosDestacados}
          onAgregarProducto={agregarProducto}
        />

        <Categorias
          categorias={categorias}
        />

        <Nosotros
          banner={banner}
          enlaceWhatsApp={enlaceWhatsApp}
        />
      </main>

      <Footer
        nombreNegocio={nombreNegocio}
        direccion={direccion}
      />

      <BotonCarrito />

      <DrawerCarrito />
    </>
  );
}

export default Home;