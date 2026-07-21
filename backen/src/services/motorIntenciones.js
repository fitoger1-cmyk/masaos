const { generarDashboardMasaIA } = require("./masaIAService");

function detectarIntencion(texto = "") {

    texto = texto.toLowerCase();

    if (
        texto.includes("venta") ||
        texto.includes("factur") ||
        texto.includes("vend")
    ) {
        return "ventas";
    }

    if (
        texto.includes("stock") ||
        texto.includes("insumo") ||
        texto.includes("compr")
    ) {
        return "stock";
    }

    if (
        texto.includes("cliente")
    ) {
        return "clientes";
    }

    if (
        texto.includes("rentabilidad") ||
        texto.includes("ganancia") ||
        texto.includes("margen")
    ) {
        return "rentabilidad";
    }

    if (
        texto.includes("salud") ||
        texto.includes("negocio")
    ) {
        return "salud";
    }

    return "dashboard";
}

function responder(pregunta, datos) {

    const dashboard = generarDashboardMasaIA(datos);

    const tipo = detectarIntencion(pregunta);

    switch (tipo) {

        case "ventas":

            return {
                titulo: "Ventas",
                respuesta:
`Hoy facturaste $${dashboard.ventas.totalHoy.toLocaleString("es-AR")}.

Se realizaron ${dashboard.ventas.cantidadHoy} ventas.

El ticket promedio es $${dashboard.ventas.ticketPromedio.toLocaleString("es-AR")}.

Producto líder: ${dashboard.resumen.productoTop?.nombre || "Sin datos"}`
            };

        case "stock":

            return {
                titulo: "Stock",
                respuesta:
`Hay ${dashboard.stock.criticos.length} insumos en estado crítico.`
            };

        case "clientes":

            return {
                titulo: "Clientes",
                respuesta:
dashboard.clientes.destacado
?
`${dashboard.clientes.destacado.nombre} es actualmente el mejor cliente con ${dashboard.clientes.destacado.cantidadPedidos} pedidos.`
:
"No hay información suficiente."
            };

        case "rentabilidad":

            return {

                titulo:"Rentabilidad",

                respuesta:
`La rentabilidad promedio es ${dashboard.rentabilidad.promedio}%.

Producto más rentable:

${dashboard.rentabilidad.productoMasRentable?.nombre || "-"}`
            };

        case "salud":

            return {

                titulo:"Salud del negocio",

                respuesta:
`${dashboard.saludNegocio.estado}

Puntaje:

${dashboard.saludNegocio.puntaje}/100`
            };

        default:

            return {

                titulo:"Resumen",

                respuesta:
`Hoy vendiste $${dashboard.ventas.totalHoy.toLocaleString("es-AR")}

Hay ${dashboard.alertas.length} alertas activas.

La salud del negocio es ${dashboard.saludNegocio.estado}.`
            };

    }

}

module.exports = responder;