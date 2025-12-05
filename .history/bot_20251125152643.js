// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

const LOGO_URL = process.env.LOGO_URL || IMAGENES.LOGO;
const WEB_URL = process.env.WEB_URL;
const CATALOG_URL = process.env.CATALOG_URL;

export const VENTAS_PHONE = "5493517010545";

/* ======================================================
FUNCIÓN BASE PARA ENVIAR MENSAJES
====================================================== */
async function enviarMensaje(data) {
try {
await axios.post(WHATSAPP_API_URL, data, {
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${TOKEN}`
}
});
} catch (error) {
console.error("❌ ERROR EN ENVÍO:", error.response?.data || error.message);
}
}

/* ======================================================
BIENVENIDA
====================================================== */
export async function sendBienvenida(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO_URL }},
body: {
text:
"Bienvenidos a Nuevo Munich 🥨\n" +
"Artesanos del sabor desde 1972.\n" +
`🌐 ${WEB_URL}\n\n` +
"Elegí una opción 👇",
},
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú" }},
{ type: "reply", reply: { id: "INICIO_PEDIDO", title: "Pedido" }},
],
},
},
});
}

/* ======================================================
MENÚ PRINCIPAL
====================================================== */
export async function sendMenuPrincipal(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una opción 👇" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "Productos" }},
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "Food Truck" }},
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "Catálogo" }},
],
},
},
});
}

/* ======================================================
CATEGORÍAS
====================================================== */
export async function sendCategoriaProductos(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Productos Nuevo Munich" },
body: { text: "Elegí una categoría 👇" },
action: {
button: "Ver",
sections: [
{
title: "Categorías",
rows: [
{ id: "CAT_FETEADOS", title: "Feteados" },
{ id: "CAT_SALAMES", title: "Salames y Picadas" },
{ id: "CAT_SALCHICHAS", title: "Salchichas Alemanas" },
{ id: "CAT_ESPECIALIDADES", title: "Especialidades" }
],
},
],
},
},
});
}

/* ======================================================
SUBCATEGORÍAS
====================================================== */
export async function sendSubcategoria(to, categoriaID) {
let lista = [];
let titulo = "";

if (categoriaID === "CAT_FETEADOS") { lista = CATEGORIAS.FETEADOS; titulo = "Feteados"; }
if (categoriaID === "CAT_SALAMES") { lista = CATEGORIAS.SALAMES; titulo = "Salames y Picadas"; }
if (categoriaID === "CAT_SALCHICHAS") { lista = CATEGORIAS.SALCHICHAS; titulo = "Salchichas"; }
if (categoriaID === "CAT_ESPECIALIDADES") { lista = CATEGORIAS.ESPECIALIDADES; titulo = "Especialidades"; }

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `${titulo}\nEstos son nuestros productos 👇` }
});

for (const nombre of lista) {
await sendProducto(to, nombre);
}
}

/* ======================================================
PRODUCTO INDIVIDUAL
====================================================== */
export async function sendProducto(to, nombreProducto) {
const urlImagen = IMAGENES[nombreProducto];

if (!urlImagen) {
return enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `No encontré la imagen de "${nombreProducto}".` }
});
}

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: urlImagen,
filename: `${nombreProducto}.png`,
caption:
`${nombreProducto}\n\n` +
`Para pedirlo escribinos:\nhttps://wa.me/${VENTAS_PHONE}`
}
});
}

/* ======================================================
FOOD TRUCK / EVENTOS
====================================================== */
export async function sendFoodTruck(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"🚚 *Food Truck / Eventos*\n\n" +
"Ideal para eventos y catering.\n\n" +
`Consultanos: https://wa.me/${VENTAS_PHONE}`
}
});
}

/* ======================================================
CATÁLOGO PDF
====================================================== */
export async function sendCatalogoCompleto(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: CATALOG_URL,
caption: "Catálogo General"
}
});
}

/* ======================================================
SISTEMA DE PEDIDO (3 PASOS)
====================================================== */

// 1) Opción de tipo de pedido
export async function sendInicioPedidoOpciones(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Nuevo Pedido" },
body: { text: "Seleccioná el tipo de pedido" },
action: {
button: "Elegir",
sections: [
{
title: "Tipos",
rows: [
{ id: "PEDIDO_PARTICULAR", title: "Particular" },
{ id: "PEDIDO_EVENTO", title: "Evento" },
{ id: "PEDIDO_EMPRESA", title: "Hotel / Restaurante" },
{ id: "PEDIDO_FOODTRUCK", title: "Food Truck" }
]
}
]
}
}
});
}

// 2) Datos del cliente
export async function pedirDatosDelCliente(to, tipo) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
`Perfecto, iniciamos un pedido *${tipo}*.\n\n` +
"Enviame por favor:\n" +
"• Nombre completo\n" +
"• Fecha del pedido / evento\n" +
"• Ubicación\n" +
"• Detalle del pedido\n"
}
});
}

// 3) Confirmación final
export async function sendPedidoConfirmacionCliente(to, resumen) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"¡Perfecto! Tu pedido quedó así:\n\n" +
`${resumen}\n\n` +
"Lo envío ahora al equipo de ventas."
}
});

// enviar a ventas automáticamente
await enviarMensaje({
messaging_product: "whatsapp",
to: VENTAS_PHONE,
type: "text",
text: {
body: `📩 NUEVO PEDIDO:\n\n${resumen}`
}
});
}

/* ======================================================
RESPUESTA IA
====================================================== */
export async function sendRespuestaIA(to, mensajeUsuario) {
const respuesta = await procesarMensajeIA(mensajeUsuario || "");

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: respuesta }
});
}