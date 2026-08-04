import { API_URL } from "../config/api";

export async function obtenerConfiguracion() {
  const respuesta = await fetch(
    `${API_URL}/configuracion?t=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      "No se pudo cargar la configuración."
    );
  }

  return respuesta.json();
}
export async function obtenerProductos() {
  const respuesta = await fetch(
    `${API_URL}/productos?t=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      "No se pudieron cargar los productos."
    );
  }

  const datos = await respuesta.json();

  return Array.isArray(datos)
    ? datos
    : [];
}
export async function obtenerPromociones() {
  const respuesta = await fetch(
    `${API_URL}/promociones?t=${Date.now()}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      "No se pudieron cargar las promociones."
    );
  }

  const datos = await respuesta.json();

  return Array.isArray(datos)
    ? datos
    : [];
}