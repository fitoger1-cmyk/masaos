import { API_URL } from "../config/api";

export async function obtenerConfiguracion() {
  const respuesta = await fetch(
    `${API_URL}/configuracion`
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
    `${API_URL}/productos`
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