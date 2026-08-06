import { useEffect, useState } from "react";

import HeroPromocionCard from "./HeroPromocionCard";

import {
  obtenerPromociones,
} from "../../services/api";

import "./HeroPremium.css";

function obtenerEstadoNegocio(
  horarios = {},
  diasAbiertos = {}
) {
  const ahora = new Date();

  const dias = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];

  const diaActual = dias[ahora.getDay()];

  if (diasAbiertos?.[diaActual] === false) {
    return {
      abierto: false,
      titulo: "Cerrado hoy",
      detalle: "Consultá nuestros horarios",
    };
  }

  const minutosActuales =
    ahora.getHours() * 60 +
    ahora.getMinutes();

  function convertirAMinutos(rango = "") {
    const partes = String(rango)
      .split("-")
      .map((parte) => parte.trim());

    if (partes.length !== 2) {
      return null;
    }

    function convertirHora(hora) {
      const [horas, minutos] = hora
        .split(":")
        .map(Number);

      if (
        !Number.isFinite(horas) ||
        !Number.isFinite(minutos)
      ) {
        return null;
      }

      return horas * 60 + minutos;
    }

    const inicio = convertirHora(partes[0]);
    const fin = convertirHora(partes[1]);

    if (inicio === null || fin === null) {
      return null;
    }

    return {
      inicio,
      fin,
    };
  }

  const turnoMediodia =
    convertirAMinutos(
      horarios.mediodia
    );

  const turnoNoche =
    convertirAMinutos(
      horarios.noche
    );

  const abiertoMediodia =
    turnoMediodia &&
    minutosActuales >=
      turnoMediodia.inicio &&
    minutosActuales <=
      turnoMediodia.fin;

  const abiertoNoche =
    turnoNoche &&
    minutosActuales >=
      turnoNoche.inicio &&
    minutosActuales <=
      turnoNoche.fin;

  if (abiertoMediodia || abiertoNoche) {
    return {
      abierto: true,
      titulo: "Abierto ahora",
      detalle: "Tomando pedidos",
    };
  }

  const proximosTurnos = [
    turnoMediodia,
    turnoNoche,
  ]
    .filter(Boolean)
    .filter(
      (turno) =>
        turno.inicio >
        minutosActuales
    )
    .sort(
      (a, b) =>
        a.inicio - b.inicio
    );

  if (proximosTurnos.length > 0) {
    const proximo =
      proximosTurnos[0];

    const horas = String(
      Math.floor(
        proximo.inicio / 60
      )
    ).padStart(2, "0");

    const minutos = String(
      proximo.inicio % 60
    ).padStart(2, "0");

    return {
      abierto: false,
      titulo: "Cerrado ahora",
      detalle:
        `Abrimos a las ${horas}:${minutos}`,
    };
  }

  return {
    abierto: false,
    titulo: "Cerrado ahora",
    detalle:
      "Abrimos nuevamente mañana",
  };
}

function HeroPremium({
  nombreNegocio,
  titulo,
  subtitulo,
  enlaceWhatsApp,
  envio,
  horarios,
  diasAbiertos,
  estiloHero,
}) {
     const [
    promocionDestacada,
    setPromocionDestacada,
  ] = useState(null);

    const estadoNegocio =
  obtenerEstadoNegocio(
    horarios,
    diasAbiertos
  );
  useEffect(() => {
  cargarPromocion();
}, []);
function calcularPorcentajeDescuento(
  precioAnterior,
  precioPromocional
) {
  const anterior =
    Number(precioAnterior || 0);

  const promocional =
    Number(precioPromocional || 0);

  if (
    anterior <= 0 ||
    promocional <= 0 ||
    promocional >= anterior
  ) {
    return 0;
  }

  return Math.round(
    ((anterior - promocional) /
      anterior) *
      100
  );
}
async function cargarPromocion() {
  try {
    const promociones =
      await obtenerPromociones();

    const ahora = new Date();

    const promocionesVigentes =
      promociones.filter((promocion) => {
        if (
          promocion.activa === false ||
          promocion.mostrarInicio === false
        ) {
          return false;
        }

        if (promocion.inicio) {
          const inicio = new Date(
            `${promocion.inicio}T00:00:00`
          );

          if (ahora < inicio) {
            return false;
          }
        }

        if (promocion.fin) {
          const fin = new Date(
            `${promocion.fin}T23:59:59`
          );

          if (ahora > fin) {
            return false;
          }
        }

        return true;
      });

    const destacada =
      promocionesVigentes.sort(
        (promocionA, promocionB) => {
          const descuentoA =
            calcularPorcentajeDescuento(
              promocionA.precioAnterior,
              promocionA.precioPromocional
            );

          const descuentoB =
            calcularPorcentajeDescuento(
              promocionB.precioAnterior,
              promocionB.precioPromocional
            );

          return descuentoB - descuentoA;
        }
      )[0];
console.log("TODAS LAS PROMOCIONES");
console.log(promociones);

console.log("PROMOCIONES VIGENTES");
console.log(promocionesVigentes);

console.log("DESTACADA");
console.log(destacada);
    setPromocionDestacada(
      destacada || null
    );
  } catch (error) {
    console.error(
      "Error cargando promoción destacada:",
      error
    );

    setPromocionDestacada(null);
  }
}
  return (
    <section
      className="hero-premium"
      style={estiloHero}
    >
      <div className="hero-premium__overlay" />

      <div className="container hero-premium__contenido">
        <div className="hero-premium__principal fade-in">
          <span className="hero-premium__marca">
            🍕 {nombreNegocio}
          </span>

          <h1>
            {titulo ||
              "Las mejores pizzas de Pilar"}
          </h1>

          <p className="hero-premium__subtitulo">
            {subtitulo ||
              "Pizzas artesanales, focaccias y postres."}
          </p>

          <div className="hero-premium__datos">
            <div className="hero-premium__dato">
  <span>
    {estadoNegocio.abierto
      ? "🟢"
      : "🔴"}
  </span>

  <div>
    <strong>
      {estadoNegocio.titulo}
    </strong>

    <small>
      {estadoNegocio.detalle}
    </small>
  </div>
</div>

            <div className="hero-premium__dato">
              <span>🚚</span>

              <div>
                <strong>
                  {(envio || "Sin cargo") === "Sin cargo"
                    ? "Envíos sin cargo"
                    : envio}
                </strong>
                <small>En Pilar</small>
              </div>
            </div>

            <div className="hero-premium__dato">
              <span>🕐</span>

              <div>
                <strong>
                  {horarios?.noche ||
                    "19:00 - 23:00"}
                </strong>
                <small>Horario nocturno</small>
              </div>
            </div>
          </div>

          <div className="hero-premium__acciones">
            <a
              href={enlaceWhatsApp}
              target="_blank"
              rel="noreferrer"
              className="btn btn--primary"
            >
              WhatsApp para consultas
            </a>

            <a
              href="#menu"
              className="btn btn--secondary"
            >
              Ver menú
            </a>
          </div>
        </div>

        {promocionDestacada && (
  <aside className="hero-premium__destacado">
    <HeroPromocionCard
      promocion={promocionDestacada}
    />
  </aside>
)}
      </div>
    </section>
  );
}

export default HeroPremium;
