import { useEffect, useState } from "react";

function HistorialCompras() {
  const [compras, setCompras] = useState([]);
  const [compraAbierta, setCompraAbierta] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/compras")
      .then((res) => res.json())
      .then((data) => setCompras(Array.isArray(data) ? data : []))
      .catch(() => alert("No se pudo cargar el historial de compras"));
  }, []);

  return (
    <section className="section">
      <h2>📄 Historial de compras</h2>

      {compras.length === 0 ? (
        <p>No hay compras cargadas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Número</th>
              <th>Proveedor</th>
              <th>Detalle</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {compras.map((compra) => (
              <tr key={compra.id}>
                <td>{compra.fecha || "-"}</td>
                <td>{compra.tipoComprobante || "-"}</td>
                <td>{compra.numeroComprobante || "-"}</td>
                <td>{compra.proveedor || "-"}</td>
                <td>
                  <button onClick={() => setCompraAbierta(compra)}>
                    Ver
                  </button>
                </td>
                <td>$ {Number(compra.total || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {compraAbierta && (
        <div className="ticket">
          <h3>Detalle de compra</h3>

          <p>Proveedor: {compraAbierta.proveedor}</p>
          <p>
            {compraAbierta.tipoComprobante} Nº{" "}
            {compraAbierta.numeroComprobante}
          </p>

          <table>
            <thead>
              <tr>
                <th>Ingrediente</th>
                <th>Cantidad</th>
                <th>Precio</th>
              </tr>
            </thead>

            <tbody>
              {compraAbierta.items?.map((item, index) => (
                <tr key={index}>
                  <td>{item.ingrediente}</td>
                  <td>{item.cantidad}</td>
                  <td>$ {item.precio}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Total: $ {Number(compraAbierta.total || 0)}</h3>

          <button onClick={() => setCompraAbierta(null)}>Cerrar</button>
        </div>
      )}
    </section>
  );
}

export default HistorialCompras;