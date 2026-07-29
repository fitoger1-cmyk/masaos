import {
  useEffect,
  useState,
} from "react";

import {
  WebProvider,
} from "./context/WebContext";

import {
  useWeb,
} from "./hooks/useWeb";

import Home from "./pages/Home";
import Seguimiento from "./pages/Seguimiento";

import "./App.css";

import {
  CarritoProvider,
} from "./context/CarritoContext";

function ContenidoWeb() {
  const {
    cargando,
    error,
    nombreNegocio,
    estiloWeb,
  } = useWeb();

  const [pantalla, setPantalla] =
    useState("home");

  useEffect(() => {
  function abrirSeguimiento() {
    setPantalla("seguimiento");
  }

  const pagina =
    localStorage.getItem(
      "masaos_pantalla"
    );

  if (pagina === "seguimiento") {
    setPantalla("seguimiento");
  }

  window.addEventListener(
    "masaos:abrir-seguimiento",
    abrirSeguimiento
  );

  return () => {
    window.removeEventListener(
      "masaos:abrir-seguimiento",
      abrirSeguimiento
    );
  };
}, []);

  if (cargando) {
    return (
      <div className="web-loading">
        <div className="web-loading__spinner" />

        <strong>
          Cargando {nombreNegocio}...
        </strong>
      </div>
    );
  }

  return (
    <div
      className="web-app"
      style={estiloWeb}
    >
      {error && (
        <div className="web-error">
          ⚠️ {error}
        </div>
      )}

      {pantalla === "home" ? (
        <Home />
      ) : (
        <Seguimiento
          onVolver={() => {
            localStorage.removeItem(
              "masaos_pantalla"
            );

            setPantalla("home");
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <WebProvider>
      <CarritoProvider>
        <ContenidoWeb />
      </CarritoProvider>
    </WebProvider>
  );
}
export default App;