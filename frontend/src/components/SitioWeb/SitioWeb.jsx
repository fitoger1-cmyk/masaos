import { useEffect, useState } from "react";

import { apiFetch } from "../../services/api";

import GeneralManager from "./GeneralManager";
import LogoManager from "./LogoManager";
import BannerManager from "./BannerManager";
import PromocionesManager from "./PromocionesManager";
import ThemeManager from "./ThemeManager";
import HomeBuilder from "./HomeBuilder";
import NosotrosManager from "./NosotrosManager";

import "./sitioWeb.css";

const configuracionInicial = {
  nombre: "",
  telefono: "",
  direccion: "",
  textoPrincipal: "",
  textoSecundario: "",
  mensajeWhatsApp: "",

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
  opiniones: false,
  footer: true,
},
    

  bannerConfig: {
    imagen: "",
    titulo: "",
    subtitulo: "",
    textoBoton: "Ver menú",
    destino: "menu",
    urlPersonalizada: "",
    opacidad: 0.55,
    activo: true,
  },
};


function SitioWeb() {
  const [configuracion, setConfiguracion] = useState(configuracionInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  async function cargarConfiguracion() {
  try {
    setCargando(true);
    setError("");

    const respuesta = await apiFetch("/configuracion");

if (!respuesta.ok) {
  throw new Error(
    `No se pudo cargar la configuración. Código: ${respuesta.status}`
  );
}

const datos = await respuesta.json();


   
    const negocioCargado = {
      ...configuracionInicial.negocio,
      ...(datos.negocio || {}),

      nombre:
        datos.negocio?.nombre ||
        datos.nombre ||
        "",

      telefono:
        datos.negocio?.telefono ||
        datos.telefono ||
        "",

      direccion:
        datos.negocio?.direccion ||
        datos.direccion ||
        "",

      envio:
        datos.negocio?.envio ||
        datos.envio ||
        "",
    };

    const webCargada = {
      ...configuracionInicial.web,
      ...(datos.web || {}),

      logo:
        datos.web?.logo ||
        datos.logo ||
        "",

      colorPrincipal:
        datos.web?.colorPrincipal ||
        datos.colorPrincipal ||
        configuracionInicial.web.colorPrincipal,

      colorSecundario:
        datos.web?.colorSecundario ||
        datos.colorSecundario ||
        configuracionInicial.web.colorSecundario,

      activo:
        datos.web?.activo ??
        datos.activo ??
        true,
    };
    const seccionesCargadas = {
  ...configuracionInicial.secciones,
  ...(datos.secciones || {}),
};

    const bannerCargado = {
      ...configuracionInicial.bannerConfig,
      ...(datos.bannerConfig || {}),

      imagen:
        datos.bannerConfig?.imagen ||
        datos.banner ||
        "",

      titulo:
        datos.bannerConfig?.titulo ||
        datos.textoPrincipal ||
        "",

      subtitulo:
        datos.bannerConfig?.subtitulo ||
        datos.textoSecundario ||
        "",

      textoBoton:
        datos.bannerConfig?.textoBoton ||
        "Ver menú",

      destino:
        datos.bannerConfig?.destino ||
        "menu",

      urlPersonalizada:
        datos.bannerConfig
          ?.urlPersonalizada ||
        "",

      opacidad:
        Number(
          datos.bannerConfig?.opacidad ??
          0.55
        ),

      activo:
        datos.bannerConfig?.activo ??
        true,
    };

    setConfiguracion({
      ...configuracionInicial,
      ...datos,

      secciones: seccionesCargadas,
      negocio: negocioCargado,
      web: webCargada,
      bannerConfig: bannerCargado,

      // Compatibilidad con componentes antiguos
      nombre:
        datos.nombre ||
        negocioCargado.nombre,

      telefono:
        datos.telefono ||
        negocioCargado.telefono,

      direccion:
        datos.direccion ||
        negocioCargado.direccion,

      logo:
        datos.logo ||
        webCargada.logo,

      banner:
        datos.banner ||
        bannerCargado.imagen,
    });
  } catch (err) {
    console.error(
      "Error cargando configuración:",
      err
    );

    setError(
      err.message ||
      "No se pudo cargar la configuración del sitio web."
    );
  } finally {
    setCargando(false);
  }
}

  function actualizarConfiguracion(cambios) {
    setConfiguracion((anterior) => ({
      ...anterior,
      ...cambios,
    }));
  }

  function actualizarNegocio(cambios) {
    setConfiguracion((anterior) => ({
      ...anterior,
      negocio: {
        ...anterior.negocio,
        ...cambios,
      },
    }));
  }

  function actualizarWeb(cambios) {
    setConfiguracion((anterior) => ({
      ...anterior,
      web: {
        ...anterior.web,
        ...cambios,
      },
    }));
  }
  function actualizarSecciones(cambios) {
  setConfiguracion((anterior) => {
    const nueva = {
      ...anterior,
      secciones: {
        ...anterior.secciones,
        ...cambios,
      },
    };

    

    return nueva;
  });
}
  function actualizarBanner(cambios) {
    setConfiguracion((anterior) => ({
      ...anterior,
      bannerConfig: {
        ...anterior.bannerConfig,
        ...cambios,
      },
    }));
  }

  function actualizarImagenNosotros(imagenNosotros) {
    setConfiguracion((anterior) => ({
      ...anterior,
      imagenNosotros,
    }));
  }

  async function guardarConfiguracion() {
  try {
    setGuardando(true);
    setMensaje("");
    setError("");

    const configuracionGuardar = {
      ...configuracion,

      secciones: {
        ...configuracionInicial.secciones,
        ...(configuracion.secciones || {}),
      },
    };
   

    const respuesta = await apiFetch(
      "/configuracion",
      {
        method: "PUT",
        body: JSON.stringify(
          configuracionGuardar
        ),
      }
    );

    if (!respuesta.ok) {
      const detalle = await respuesta
        .json()
        .catch(() => ({}));

      throw new Error(
        detalle.error ||
          detalle.mensaje ||
          `No se pudo guardar. Código: ${respuesta.status}`
      );
    }

    const datosGuardados =
      await respuesta.json();

    

    setConfiguracion((anterior) => ({
      ...anterior,
      ...datosGuardados,

      negocio: {
        ...anterior.negocio,
        ...(datosGuardados.negocio || {}),
      },

      web: {
        ...anterior.web,
        ...(datosGuardados.web || {}),
      },

      secciones: {
        ...configuracionInicial.secciones,
        ...(datosGuardados.secciones || {}),
      },

      bannerConfig: {
        ...anterior.bannerConfig,
        ...(datosGuardados.bannerConfig || {}),
      },
    }));

    setMensaje(
      "Configuración guardada correctamente."
    );
  } catch (err) {
    console.error(
      "Error guardando configuración:",
      err
    );

    setError(
      err.message ||
        "No se pudo guardar la configuración."
    );
  } finally {
    setGuardando(false);
  }
}

  if (cargando) {
    return (
      <section className="sitio-web">
        <p>Cargando configuración del sitio web...</p>
      </section>
    );
  }

  return (
    <section className="sitio-web">
      <header className="sitio-web__encabezado">
        <div>
          <p className="sitio-web__etiqueta">
            Web Manager PRO
          </p>

          <h1>Administración del sitio web</h1>

          <p>
            Editá la información pública de tu negocio
            sin tocar el código de la página.
          </p>
        </div>

        <button
  type="button"
  onClick={() => guardarConfiguracion()}
  disabled={guardando}
>
          {guardando
            ? "Guardando..."
            : "Guardar cambios"}
        </button>
      </header>

      {mensaje && (
        <div className="sitio-web__mensaje sitio-web__mensaje--exito">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="sitio-web__mensaje sitio-web__mensaje--error">
          {error}
        </div>
      )}

      <div className="sitio-web__contenido">
        <GeneralManager
          configuracion={configuracion}
          actualizarConfiguracion={
            actualizarConfiguracion
          }
          actualizarNegocio={actualizarNegocio}
        />

        <LogoManager
          configuracion={configuracion}
          actualizarConfiguracion={
            actualizarConfiguracion
          }
          actualizarWeb={actualizarWeb}
        />

       <BannerManager
  configuracion={configuracion}
  bannerConfig={configuracion.bannerConfig}
  actualizarBanner={actualizarBanner}
  guardarConfiguracion={guardarConfiguracion}
  colorPrincipal={
    configuracion.web?.colorPrincipal ||
    "#b71c1c"
  }
  colorSecundario={
    configuracion.web?.colorSecundario ||
    "#f5f5f5"
  }
/> 
        <NosotrosManager
          imagenNosotros={configuracion.imagenNosotros}
          actualizarImagenNosotros={actualizarImagenNosotros}
        />
        <PromocionesManager />

<ThemeManager
  configuracion={configuracion}
  actualizarWeb={actualizarWeb}
/>
<HomeBuilder
  secciones={configuracion.secciones}
  actualizarSecciones={
    actualizarSecciones
  }
/>

      </div>
    </section>
  );
}

export default SitioWeb;
