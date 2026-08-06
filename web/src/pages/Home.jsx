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

  secciones = {
    hero: true,
    promociones: true,
    productos: true,
    categorias: true,
    nosotros: true,
    footer: true,
  },

  productosDestacados,
  categorias,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  nombreNegocio,
  direccion,
  envio,
  logo,
  imagenNosotros,
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
   {secciones.hero && (
  <Hero
    titulo={tituloHero}
    subtitulo={subtituloHero}
    textoBoton={textoBotonHero}
    enlaceWhatsApp={enlaceWhatsApp}
    horarios={configuracion.horarios}
    envio={envio}
    estiloHero={estiloHero}
  />
)}

{secciones.promociones && (
  <Promociones />
)}

{secciones.categorias && (
  <Categorias
    categorias={categorias}
    onSeleccionar={setCategoriaSeleccionada}
  />
)}

{secciones.productos && (
  <ProductosDestacados
    productos={productosDestacados}
    categoriaSeleccionada={categoriaSeleccionada}
    limpiarCategoria={() => setCategoriaSeleccionada("")}
    onAgregarProducto={agregarProducto}
  />
)}

{secciones.nosotros && (
  <Nosotros
    imagen={imagenNosotros}
  />
)}
      </main>

      {secciones.footer && (
  <Footer
    nombreNegocio={nombreNegocio}
    direccion={direccion}
  />
)}

      <BotonCarrito />

      <DrawerCarrito />
    </>
  );
}

export default Home;
