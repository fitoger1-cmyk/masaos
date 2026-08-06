import { API_URL } from "../config/api";

export async function apiFetch(
  endpoint,
  opciones = {}
) {
  const token =
    localStorage.getItem("masaos_token");

  const esFormData =
    opciones.body instanceof FormData;

  const headers = {
    ...(esFormData
      ? {}
      : {
          "Content-Type":
            "application/json",
        }),
    ...(opciones.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const respuesta = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...opciones,
      headers,
    }
  );

  if (respuesta.status === 401) {
    localStorage.removeItem(
      "masaos_token"
    );

    localStorage.removeItem(
      "masaos_usuario"
    );

    window.location.reload();

    throw new Error(
      "La sesión expiró."
    );
  }

  return respuesta;
}
export async function obtenerDashboard() {
  const respuesta = await fetch(
    `${API_URL}/dashboard`
  );

  if (!respuesta.ok) {
    throw new Error(
      "No se pudo cargar el dashboard."
    );
  }

  return respuesta.json();
}