import Badge from "../ui/Badge";
import Card from "../ui/Card";

function obtenerVariantePrioridad(prioridad = "") {
  const valor = String(prioridad).toLowerCase();

  if (
    valor.includes("alta") ||
    valor.includes("critica") ||
    valor.includes("crítica")
  ) {
    return "danger";
  }

  if (
    valor.includes("media") ||
    valor.includes("warning") ||
    valor.includes("advertencia")
  ) {
    return "warning";
  }

  if (
    valor.includes("baja") ||
    valor.includes("normal")
  ) {
    return "success";
  }

  return "primary";
}

function obtenerIconoPrioridad(prioridad = "") {
  const variante = obtenerVariantePrioridad(prioridad);

  if (variante === "danger") {
    return "🚨";
  }

  if (variante === "warning") {
    return "⚠️";
  }

  if (variante === "success") {
    return "✅";
  }

  return "🧠";
}

function normalizarRecomendacion(recomendacion, indice) {
  if (typeof recomendacion === "string") {
    return {
      id: `recomendacion-${indice}`,
      titulo: recomendacion,
      descripcion: "",
      prioridad: "media",
      accion: "",
    };
  }

  return {
    id:
      recomendacion?.id ||
      `recomendacion-${indice}`,

    titulo:
      recomendacion?.titulo ||
      recomendacion?.nombre ||
      recomendacion?.mensaje ||
      recomendacion?.recomendacion ||
      "Recomendación operativa",

    descripcion:
      recomendacion?.descripcion ||
      recomendacion?.detalle ||
      recomendacion?.motivo ||
      "",

    prioridad:
      recomendacion?.prioridad ||
      recomendacion?.nivel ||
      "media",

    accion:
      recomendacion?.accion ||
      recomendacion?.accionSugerida ||
      recomendacion?.sugerencia ||
      "",
  };
}

function CentroDecisiones({
  recomendaciones = [],
  metricas = {},
}) {
  const recomendacionesNormalizadas =
    Array.isArray(recomendaciones)
      ? recomendaciones
          .map(normalizarRecomendacion)
          .slice(0, 5)
      : [];

  const stockCritico =
    Array.isArray(metricas?.stockCritico)
      ? metricas.stockCritico.length
      : 0;

  const pedidosActivos =
    Array.isArray(metricas?.pedidosActivos)
      ? metricas.pedidosActivos.length
      : 0;

  const ventasHoy =
    Array.isArray(metricas?.ventasHoy)
      ? metricas.ventasHoy.length
      : 0;

  const estadoGeneral =
    stockCritico > 2
      ? {
          texto: "Requiere atención",
          variante: "danger",
          descripcion:
            "Hay varios insumos con stock crítico.",
        }
      : pedidosActivos > 5
        ? {
            texto: "Operación exigida",
            variante: "warning",
            descripcion:
              "La cocina tiene una carga elevada de pedidos.",
          }
        : {
            texto: "Operación estable",
            variante: "success",
            descripcion:
              "No se detectan problemas operativos importantes.",
          };

  return (
    <Card className="centro-decisiones">
      <div className="centro-decisiones-header">
        <div>
          <span className="centro-decisiones-etiqueta">
            MASAIA
          </span>

          <h3>Centro de decisiones</h3>

          <p>
            Acciones sugeridas según ventas, pedidos,
            stock y operación actual.
          </p>
        </div>

        <Badge variante={estadoGeneral.variante}>
          {estadoGeneral.texto}
        </Badge>
      </div>

      <div className="centro-decisiones-resumen">
        <div className="centro-decisiones-indicador">
          <span>Ventas registradas</span>
          <strong>{ventasHoy}</strong>
          <small>Durante el día de hoy</small>
        </div>

        <div className="centro-decisiones-indicador">
          <span>Pedidos activos</span>
          <strong>{pedidosActivos}</strong>
          <small>En preparación o pendientes</small>
        </div>

        <div className="centro-decisiones-indicador">
          <span>Stock crítico</span>
          <strong>{stockCritico}</strong>
          <small>Insumos que requieren atención</small>
        </div>
      </div>

      <div className="centro-decisiones-estado">
        <span className="centro-decisiones-estado-icono">
          {estadoGeneral.variante === "danger"
            ? "🚨"
            : estadoGeneral.variante === "warning"
              ? "⚠️"
              : "✅"}
        </span>

        <div>
          <strong>{estadoGeneral.texto}</strong>
          <p>{estadoGeneral.descripcion}</p>
        </div>
      </div>

      <div className="centro-decisiones-lista-header">
        <div>
          <span>PLAN DE ACCIÓN</span>
          <h4>Prioridades recomendadas</h4>
        </div>

        <strong>
          {recomendacionesNormalizadas.length}
        </strong>
      </div>

      {recomendacionesNormalizadas.length === 0 ? (
        <div className="centro-decisiones-vacio">
          <span>✨</span>

          <div>
            <strong>No hay acciones urgentes</strong>
            <p>
              MasaIA no detectó prioridades para mostrar
              en este momento.
            </p>
          </div>
        </div>
      ) : (
        <div className="centro-decisiones-lista">
          {recomendacionesNormalizadas.map(
            (recomendacion, indice) => (
              <article
                className="centro-decisiones-item"
                key={recomendacion.id}
              >
                <div className="centro-decisiones-numero">
                  {indice + 1}
                </div>

                <div className="centro-decisiones-contenido">
                  <div className="centro-decisiones-item-top">
                    <strong>
                      {obtenerIconoPrioridad(
                        recomendacion.prioridad
                      )}{" "}
                      {recomendacion.titulo}
                    </strong>

                    <Badge
                      variante={obtenerVariantePrioridad(
                        recomendacion.prioridad
                      )}
                    >
                      {recomendacion.prioridad}
                    </Badge>
                  </div>

                  {recomendacion.descripcion && (
                    <p>
                      {recomendacion.descripcion}
                    </p>
                  )}

                  {recomendacion.accion && (
                    <div className="centro-decisiones-accion">
                      <span>Acción sugerida</span>
                      <strong>
                        {recomendacion.accion}
                      </strong>
                    </div>
                  )}
                </div>
              </article>
            )
          )}
        </div>
      )}
    </Card>
  );
}

export default CentroDecisiones;