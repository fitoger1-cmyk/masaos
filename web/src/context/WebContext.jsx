import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  obtenerConfiguracion,
  obtenerCategorias,
  obtenerProductos,
} from "../services/api";

export const WebContext =
  createContext(null);

const configuracionInicial = {
  nombre: "El Club de la Masa G",
  telefono: "1140480762",
  direccion: "Pilar, Buenos Aires",
  envio: "Sin cargo",

  textoPrincipal:
    "Las mejores pizzas de Pilar",

  textoSecundario:
    "Pizzas artesanales, focaccias y postres.",

  mensajeWhatsApp:
    "Hola, quiero hacer un pedido.",

  logo: "",
  banner: "",
  imagenNosotros: "",

  negocio: {
    nombre: "",
    telefono: "",
    direccion: "",
    envio: "",
  },

  web: {
    logo: "",
    colorPrincipal: "#b71c1c",
    colorSecundario: "#f5f5f5",
    activo: true,
  },
  secciones: {
  hero: true,
  promociones: true,
  productos: true,
  categorias: true,
  nosotros: true,
  footer: true,
},

  bannerConfig: {
    imagen: "",
    titulo:
      "Las mejores pizzas de Pilar",

    subtitulo:
      "Pizzas artesanales, focaccias y postres.",

    textoBoton: "Ver menú",
    destino: "menu",
    urlPersonalizada: "",
    opacidad: 0.55,
    activo: true,
  },

  horarios: {
    mediodia: "11:00 - 16:00",
    noche: "19:00 - 23:00",
  },
};

function normalizarTelefono(
  telefono = ""
) {
  return String(telefono).replace(
    /\D/g,
    ""
  );
}

function normalizarCategoria(
  categoria = ""
) {
  return String(categoria)
    .trim()
    .toLowerCase();
}

function combinarConfiguracion(
  datos = {}
) {
  
  return {
    ...configuracionInicial,
    ...datos,

    negocio: {
      ...configuracionInicial.negocio,
      ...(datos.negocio || {}),
    },
    secciones: {
  ...configuracionInicial.secciones,
  ...(datos.secciones || {}),
},

    web: {
      ...configuracionInicial.web,
      ...(datos.web || {}),
    },

    bannerConfig: {
      ...configuracionInicial.bannerConfig,
      ...(datos.bannerConfig || {}),
    },

    horarios: {
      ...configuracionInicial.horarios,
      ...(datos.horarios || {}),
    },
  };
}

export function WebProvider({
  children,
}) {
  const [
    configuracion,
    setConfiguracion,
  ] = useState(configuracionInicial);

  const [
    productos,
    setProductos,
  ] = useState([]);

  const [categoriasConfiguradas, setCategoriasConfiguradas] =
    useState([]);

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState("");

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  async function cargarWeb() {
    try {
      setCargando(true);
      setError("");

      const [
        configuracionRecibida,
        productosRecibidos,
        categoriasRecibidas,
      ] = await Promise.all([
        obtenerConfiguracion(),
        obtenerProductos(),
        obtenerCategorias(),
      ]);

      setConfiguracion(
        combinarConfiguracion(
          configuracionRecibida
        )
      );

      setProductos(
        productosRecibidos.filter(
          (producto) =>
            producto.activo !== false
        )
      );

      setCategoriasConfiguradas(
        categoriasRecibidas.filter(
          (categoria) => categoria.activo !== false
        )
      );
    } catch (err) {
      console.error(
        "Error cargando la Web 3.0:",
        err
      );

      setError(
        err.message ||
          "No se pudo cargar la página."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarWeb();
  }, []);

  const nombreNegocio =
    configuracion.negocio?.nombre ||
    configuracion.nombre ||
    "El Club de la Masa G";

  const telefono =
    configuracion.negocio?.telefono ||
    configuracion.telefono ||
    "1140480762";

  const direccion =
    configuracion.negocio?.direccion ||
    configuracion.direccion ||
    "Pilar, Buenos Aires";

  const envio =
    configuracion.negocio?.envio ||
    configuracion.envio ||
    "Sin cargo";

  const logo =
    configuracion.web?.logo ||
    configuracion.logo ||
    "";

  const banner =
    configuracion.bannerConfig?.imagen ||
    configuracion.banner ||
    "";

  const colorPrincipal =
    configuracion.web?.colorPrincipal ||
    "#b71c1c";

  const colorSecundario =
    configuracion.web
      ?.colorSecundario ||
    "#f5f5f5";

  const tituloHero =
    configuracion.bannerConfig?.titulo ||
    configuracion.textoPrincipal ||
    "Las mejores pizzas de Pilar";

  const subtituloHero =
    configuracion.bannerConfig
      ?.subtitulo ||
    configuracion.textoSecundario ||
    "Pizzas artesanales, focaccias y postres.";

  const textoBotonHero =
    configuracion.bannerConfig
      ?.textoBoton ||
    "Ver menú";

  const telefonoWhatsApp =
    normalizarTelefono(telefono);

  const mensajeWhatsApp =
    configuracion.mensajeWhatsApp ||
    "Hola, quiero hacer un pedido.";

  const enlaceWhatsApp =
    telefonoWhatsApp
      ? `https://wa.me/54${telefonoWhatsApp}?text=${encodeURIComponent(
          mensajeWhatsApp
        )}`
      : "#";

  const productosDestacados =
    useMemo(() => {
      if (!categoriaSeleccionada) {
        return productos.slice(0, 6);
      }

      return productos.filter(
        (producto) =>
          normalizarCategoria(producto.categoria) ===
          normalizarCategoria(categoriaSeleccionada)
      );
    }, [productos, categoriaSeleccionada]);

  const categorias =
    useMemo(() => {
      const categoriasUnicas = [];

      categoriasConfiguradas.forEach((categoriaConfigurada) => {
        const productoCategoria = productos.find(
          (producto) =>
            normalizarCategoria(producto.categoria) ===
            normalizarCategoria(categoriaConfigurada.nombre)
        );

        if (!productoCategoria) return;

        categoriasUnicas.push({
          ...categoriaConfigurada,
          imagen:
            categoriaConfigurada.imagen ||
            productoCategoria.imagen ||
            "",
        });
      });

      productos.forEach(
        (producto) => {
          const categoria = String(
            producto.categoria || ""
          ).trim();

          if (!categoria) {
            return;
          }

          const yaExiste =
            categoriasUnicas.find(
              (categoriaGuardada) =>
                normalizarCategoria(
                  categoriaGuardada.nombre
                ) ===
                normalizarCategoria(
                  categoria
                )
            );

          if (!yaExiste) {
            categoriasUnicas.push({
              nombre: categoria,
              imagen: producto.imagen || "",
            });
          } else if (
            producto.imagen &&
            !yaExiste.imagen
          ) {
            yaExiste.imagen = producto.imagen;
          }
        }
      );

      return categoriasUnicas;
    }, [productos, categoriasConfiguradas]);

  const estiloWeb = {
    "--color-principal":
      colorPrincipal,

    "--color-secundario":
      colorSecundario,
  };

  const opacidadBannerRecibida = Number(
    configuracion.bannerConfig?.opacidad ?? 0.55
  );

  const opacidadBanner = Number.isFinite(
    opacidadBannerRecibida
  )
    ? Math.min(Math.max(opacidadBannerRecibida, 0), 1)
    : 0.55;

  const estiloHero = banner
    ? {
        backgroundImage: `url("${banner}")`,
        "--opacidad-banner": opacidadBanner,
      }
    : undefined;

  const valorContexto = {
    configuracion,

     secciones: {
  ...configuracionInicial.secciones,
  ...(configuracion.secciones || {}),
},
    productos,
    productosDestacados,
    categorias,
    categoriaSeleccionada,
    setCategoriaSeleccionada,

    cargando,
    error,

    nombreNegocio,
    telefono,
    direccion,
    envio,
    logo,
    banner,
    imagenNosotros:
      configuracion.imagenNosotros || "",

    colorPrincipal,
    colorSecundario,

    tituloHero,
    subtituloHero,
    textoBotonHero,

    enlaceWhatsApp,
    estiloWeb,
    estiloHero,

    recargarWeb: cargarWeb,
  };
  

  return (
  <WebContext.Provider
    value={valorContexto}
  >
    {children}
  </WebContext.Provider>
);
}
