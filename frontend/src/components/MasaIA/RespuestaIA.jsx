    function RespuestaIA({ respuesta, fecha }) {
  if (!respuesta) return null;
  const datos = Array.isArray(respuesta.datos) ? respuesta.datos : [];

  return (
    <div className="chat-masaia-burbuja chat-masaia-burbuja-ia">
      <small>
        {fecha
          ? new Date(fecha).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""}
      </small>
      <strong>{respuesta.titulo || "MasaIA"}</strong>
      <p>{respuesta.mensaje || "Sin respuesta disponible."}</p>

      {datos.length > 0 && (
        <div className="chat-masaia-datos">
          {datos.map((item, indice) => (
            <div key={`${item.etiqueta}-${indice}`}>
              <span>{item.etiqueta}</span>
              <strong>{String(item.valor ?? "—")}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RespuestaIA;

    
