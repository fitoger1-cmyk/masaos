const API_URL =
  "http://localhost:3000/api/masaia";

async function leerRespuesta(respuesta) {
  const contenido = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      contenido.error ||
        "Ocurrió un error en MasaIA."
    );
  }

  return contenido;
}

export async function obtenerDashboardMasaIA() {
  const respuesta = await fetch(
    `${API_URL}/dashboard`
  );

  return leerRespuesta(respuesta);
}

export async function preguntarMasaIAApi(
  pregunta
) {
  const respuesta = await fetch(
    `${API_URL}/preguntar`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        pregunta,
      }),
    }
  );

  const contenido =
    await leerRespuesta(respuesta);

  return contenido.respuesta;
}