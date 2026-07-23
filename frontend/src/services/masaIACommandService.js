const API_URL = "http://localhost:3000/api";

export async function preguntarMasaIA(pregunta) {
  const respuesta = await fetch(`${API_URL}/masaia/preguntar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pregunta,
    }),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo consultar MasaIA");
  }

  return await respuesta.json();
}