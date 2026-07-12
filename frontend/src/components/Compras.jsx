import { useState } from "react";

function Compras({ stock, setStock }) {
  const [proveedor, setProveedor] = useState("");
  const [tipoComprobante, setTipoComprobante] = useState("Factura");
  const [numeroComprobante, setNumeroComprobante] = useState("");

  const [ingrediente, setIngrediente] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");

  const [items, setItems] = useState([]);

  const totalCompra = items.reduce(
    (total, item) => total + Number(item.precio),
    0
  );

  const agregarIngrediente = () => {
    if (!ingrediente || !cantidad || !precio) {
      alert("Completá ingrediente, cantidad y precio");
      return;
    }

    setItems((actuales) => [
      ...actuales,
      {
        ingrediente,
        cantidad: Number(cantidad),
        precio: Number(precio),
      },
    ]);

    setIngrediente("");
    setCantidad("");
    setPrecio("");
  };

  const quitarItem = (indexItem) => {
    setItems((actuales) =>
      actuales.filter((_, index) => index !== indexItem)
    );
  };

  const guardarCompra = () => {
    if (!proveedor || !numeroComprobante || items.length === 0) {
      alert("Completá proveedor, número y al menos un ingrediente");
      return;
    }

    fetch("http://localhost:3000/api/compras", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        proveedor,
        tipoComprobante,
        numeroComprobante,
        items,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || "No se pudo guardar la compra");
          });
        }

        return res.json();
      })
      .then(() => fetch("http://localhost:3000/api/stock"))
      .then((res) => res.json())
      .then((stockActualizado) => {
        setStock(stockActualizado);

        setProveedor("");
        setTipoComprobante("Factura");
        setNumeroComprobante("");
        setItems([]);

        alert("Compra guardada correctamente");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <section className="section">
      <h2>📦 Compras / Factura de proveedor</h2>

      <div className="ticket">
        <label>Tipo de comprobante</label>
        <select
          value={tipoComprobante}
          onChange={(e) => setTipoComprobante(e.target.value)}
        >
          <option value="Factura">Factura</option>
          <option value="Remito">Remito</option>
        </select>

        <label>Número de comprobante</label>
        <input
          type="text"
          value={numeroComprobante}
          onChange={(e) => setNumeroComprobante(e.target.value)}
          placeholder="Ej: 0003-00001254"
        />

        <label>Proveedor</label>
        <input
          type="text"
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
          placeholder="Ej: Santa Elena"
        />

        <hr />

        <label>Ingrediente</label>
        <select
          value={ingrediente}
          onChange={(e) => setIngrediente(e.target.value)}
        >
          <option value="">Seleccionar</option>
          {stock.map((item) => (
            <option key={item.id} value={item.ingrediente}>
              {item.ingrediente}
            </option>
          ))}
        </select>

        <label>Cantidad</label>
        <input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="Ej: 10"
        />

        <label>Precio total</label>
        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Ej: 120000"
        />

        <button onClick={agregarIngrediente}>
          ➕ Agregar ingrediente
        </button>

        <hr />

        <h3>Detalle de la compra</h3>

        {items.length === 0 && <p>No hay ingredientes agregados.</p>}

        {items.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Ingrediente</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.ingrediente}</td>
                  <td>{item.cantidad}</td>
                  <td>$ {item.precio}</td>
                  <td>
                    <button onClick={() => quitarItem(index)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2>Total compra: $ {totalCompra}</h2>

        <button onClick={guardarCompra}>
          💾 Guardar compra
        </button>
      </div>
    </section>
  );
}

export default Compras;