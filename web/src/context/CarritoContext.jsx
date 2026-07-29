import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const CarritoContext = createContext(null);

const CLAVE_STORAGE = "masaos_carrito";

function obtenerCarritoGuardado() {
  try {
    const carritoGuardado = localStorage.getItem(CLAVE_STORAGE);

    if (!carritoGuardado) {
      return [];
    }

    const datos = JSON.parse(carritoGuardado);

    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    console.error("No se pudo recuperar el carrito:", error);
    return [];
  }
}

function obtenerIdentificadorProducto(producto) {
  return String(
    producto.id ??
      producto._id ??
      producto.nombre ??
      producto.name
  );
}

function normalizarPrecio(precio) {
  const precioConvertido = Number(precio);

  return Number.isFinite(precioConvertido)
    ? precioConvertido
    : 0;
}

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(obtenerCarritoGuardado);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(
        CLAVE_STORAGE,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error("No se pudo guardar el carrito:", error);
    }
  }, [items]);

  function agregarProducto(producto) {
    console.log("Agregando al carrito:", producto);
    if (!producto) {
      return;
    }
    
    const productoId = obtenerIdentificadorProducto(producto);

    setItems((itemsActuales) => {
      const productoExistente = itemsActuales.find(
        (item) => item.carritoId === productoId
      );

      if (productoExistente) {
        return itemsActuales.map((item) =>
          item.carritoId === productoId
            ? {
                ...item,
                cantidad: item.cantidad + 1,
              }
            : item
        );
      }

      return [
        ...itemsActuales,
        {
          ...producto,
          carritoId: productoId,
          precio: normalizarPrecio(producto.precio),
          cantidad: 1,
        },
      ];
    });

    setCarritoAbierto(true);
  }

  function aumentarCantidad(carritoId) {
    setItems((itemsActuales) =>
      itemsActuales.map((item) =>
        item.carritoId === carritoId
          ? {
              ...item,
              cantidad: item.cantidad + 1,
            }
          : item
      )
    );
  }

  function disminuirCantidad(carritoId) {
    setItems((itemsActuales) =>
      itemsActuales
        .map((item) =>
          item.carritoId === carritoId
            ? {
                ...item,
                cantidad: item.cantidad - 1,
              }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  }

  function eliminarProducto(carritoId) {
    setItems((itemsActuales) =>
      itemsActuales.filter(
        (item) => item.carritoId !== carritoId
      )
    );
  }

  function vaciarCarrito() {
    setItems([]);
  }

  function abrirCarrito() {
    setCarritoAbierto(true);
  }

  function cerrarCarrito() {
    setCarritoAbierto(false);
  }

  function alternarCarrito() {
    setCarritoAbierto((estadoActual) => !estadoActual);
  }

  const cantidadTotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.cantidad,
      0
    );
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + normalizarPrecio(item.precio) * item.cantidad,
      0
    );
  }, [items]);

  const carritoVacio = items.length === 0;

  const valorContexto = {
    items,
    cantidadTotal,
    subtotal,
    carritoVacio,
    carritoAbierto,

    agregarProducto,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    vaciarCarrito,

    abrirCarrito,
    cerrarCarrito,
    alternarCarrito,
  };

  return (
    <CarritoContext.Provider value={valorContexto}>
      {children}
    </CarritoContext.Provider>
  );
}