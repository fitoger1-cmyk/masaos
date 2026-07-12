import { useState } from "react";

function Recetas({ recetas }) {
  const [recetaEditando, setRecetaEditando] = useState(null);

  function editarReceta(receta) {
    setRecetaEditando({
      ...receta,
      ingredientes: receta.ingredientes.map((ingrediente) => ({
        ...ingrediente,
      })),
    });
  }

  function cambiarIngrediente(index, campo, valor) {
    const ingredientesActualizados = recetaEditando.ingredientes.map(
      (ingrediente, posicion) =>
        posicion === index
          ? {
              ...ingrediente,
              [campo]: campo === "cantidad" ? Number(valor) : valor,
            }
          : ingrediente
    );

    setRecetaEditando({
      ...recetaEditando,
      ingredientes: ingredientesActualizados,
    });
  }

  async function guardarReceta() {
    const respuesta = await fetch(
      `http://localhost:3000/api/recetas/${recetaEditando.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recetaEditando),
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert(datos.error || "No se pudo guardar la receta");
      return;
    }

    alert("Receta actualizada");
    window.location.reload();
  }

  return (
    <section className="section">
      <h2>📖 Recetas</h2>

      {recetas.length === 0 ? (
        <p>No hay recetas cargadas.</p>
      ) : (
        recetas.map((receta) => (
          <div className="card" key={receta.id}>
            <h3>{receta.producto}</h3>

            <button
              type="button"
              className="btnEditar"
              onClick={() => editarReceta(receta)}
            >
              ✏️ Editar receta
            </button>

            <table>
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                </tr>
              </thead>

              <tbody>
                {receta.ingredientes.map((ingrediente, index) => (
                  <tr key={index}>
                    <td>{ingrediente.ingrediente}</td>
                    <td>{ingrediente.cantidad}</td>
                    <td>{ingrediente.unidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      {recetaEditando && (
        <div className="modalFondo">
          <div className="modalCaja">
            <h3>Editar receta</h3>
            <p>{recetaEditando.producto}</p>

            {recetaEditando.ingredientes.map((ingrediente, index) => (
              <div key={index}>
                <label>Ingrediente</label>
                <input
                  value={ingrediente.ingrediente}
                  onChange={(e) =>
                    cambiarIngrediente(index, "ingrediente", e.target.value)
                  }
                />

                <label>Cantidad</label>
                <input
                  type="number"
                  step="0.01"
                  value={ingrediente.cantidad}
                  onChange={(e) =>
                    cambiarIngrediente(index, "cantidad", e.target.value)
                  }
                />

                <label>Unidad</label>
                <input
                  value={ingrediente.unidad}
                  onChange={(e) =>
                    cambiarIngrediente(index, "unidad", e.target.value)
                  }
                />

                <hr />
              </div>
            ))}

            <div className="modalBotones">
              <button
                type="button"
                onClick={() => setRecetaEditando(null)}
              >
                Cancelar
              </button>

              <button type="button" onClick={guardarReceta}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Recetas;