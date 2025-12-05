// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

export const VENTAS_PHONE = "5493517010545"; // WhatsApp oficial de ventas

const LOGO_URL = process.env.LOGO_URL || IMAGENES.LOGO;
const WEB_URL = process.env.WEB_URL || "https://www.nuevomunich.com.ar";
const CATALOG_URL = process.env.CATALOG_URL || "https://www.nuevomunich.com.ar/catalogo.pdf";

// ======================================================
// FUNCIÓN BASE — ENVÍA MENSAJE A WHATSAPP
// ======================================================
async function enviarMensaje(data) {
try {
await axios.post(WHATSAPP_API_URL, data, {
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${TOKEN}`,
},
});
} catch (err) {
console.error("❌ ERROR EN ENVÍO:", err.response?.data || err.message);
}
}

// ======================================================
// BIENVENIDA
// ======================================================
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
"Bienvenido a *Nuevo Munich* 🥨✨\nArtesanos del sabor desde 1972.\n" +
`Web: ${WEB_URL}\n\nElegí una opción:`,
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

// ======================================================
// MENÚ PRINCIPAL
// ======================================================
export async function sendMenuPrincipal(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una opción:" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "Productos" }},
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "Food Truck" }},
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "Catálogo" }},
{ type: "reply", reply: { id: "CHAT_CON_VENTAS", title: "Ventas" }},
],
},
},
});
}

// ======================================================
// CHAT DIRECTO CON VENTAS
// ======================================================
export async function sendChatVentas(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Hacé clic para contactar al equipo de ventas:" },
action: {
buttons: [
{ type: "reply", reply: { id: "ABRIR_CHAT_VENTAS", title: "Contactar ventas" }},
],
},
},
});
}

// ======================================================
// CATEGORÍAS
// ======================================================
export async function sendCategoriaProductos(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Productos Nuevo Munich" },
body: { text: "Elegí una categoría:" },
action: {
button: "Ver",
sections: [
{
title: "Categorías",
rows: [
{ id: "CAT_FETEADOS", title: "Feteados" },
{ id: "CAT_SALAMES", title: "Salames / Picadas" },
{ id: "CAT_SALCHICHAS", title: "Salchichas Alemanas" },
{ id: "CAT_ESPECIALIDADES", title: "Especialidades" },
],
},
],
},
},
});
}

// ======================================================
// ENVIAR PRODUCTOS POR CATEGORÍA
// ======================================================
export async function sendSubcategoria(to, id) {
let lista = [];
let titulo = "";

const map = {
CAT_FETEADOS: ["Feteados", CATEGORIAS.FETEADOS],
CAT_SALAMES: ["Salames / Picadas", CATEGORIAS.SALAMES],
CAT_SALCHICHAS: ["Salchichas Alemanas", CATEGORIAS.SALCHICHAS],
CAT_ESPECIALIDADES: ["Especialidades", CATEGORIAS.ESPECIALIDADES],
};

if (map[id]) {
titulo = map[id][0];
lista = map[id][1];
}

if (!lista.length) {
return enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "Aún no hay productos en esta categoría." },
});
}

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `*${titulo}*\nEstos son nuestros productos:` },
});

for (const nombre of lista) {
await sendProducto(to, nombre);
}
}

// ======================================================
// PRODUCTO → ENVÍA IMAGEN Y DESCRIPCIÓN IA
// ======================================================
export async function sendProducto(to, nombre) {
const images = IMAGENES[nombre];

if (!images) {
return enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `No encontré imágenes de ${nombre}.` },
});
}

const urls = Array.isArray(images) ? images : [images];

for (const img of urls.slice(0, 5)) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: img },
});
}

const descripcion = await procesarMensajeIA(nombre);

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: descripcion },
});

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "¿Querés seguir viendo productos?" },
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Volver al menú" }},
],
},
},
});
}

// ======================================================
// FOOD TRUCK
// ======================================================
export async function sendFoodTruck(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"🚚 *Food Truck / Eventos*\n\n" +
"Catering, picadas calientes, salchichas alemanas y más.\n\n" +
`Consultas directas:\nhttps://wa.me/${VENTAS_PHONE}`,
},
});
}

// ======================================================
// CATÁLOGO PDF
// ======================================================
export async function sendCatalogoCompleto(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: CATALOG_URL,
caption: "Catálogo general Nuevo Munich",
},
});
}

// ======================================================
// PEDIDO — MOSTRAR OPCIONES
// ======================================================
export async function sendInicioPedidoOpciones(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Pedido" },
body: { text: "Elegí una opción:" },
action: {
button: "Elegir",
sections: [
{
title: "Opciones",
rows: [
{ id: "REALIZAR_PEDIDO", title: "Realizar pedido" },
{ id: "CHAT_CON_VENTAS", title: "Hablar con ventas" },
],
},
],
},
},
});
}

// ======================================================
// PEDIR DATOS DEL CLIENTE
// ======================================================
export async function pedirDatosDelCliente(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Perfecto 😊\nPara iniciar el pedido necesito:\n\n" +
"• Nombre completo\n" +
"• Fecha (compra o evento)\n" +
"• Ubicación\n" +
"• Detalle del pedido\n\n" +
"Cuando me envíes todo, preparo el resumen.",
},
});
}

// ======================================================
// CONFIRMAR PEDIDO
// ======================================================
export async function sendPedidoConfirmacionCliente(to, resumen) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body: `Tu pedido quedó así:\n\n${resumen}\n\nLo enviamos ahora al equipo de ventas.`,
},
});

await enviarMensaje({
messaging_product: "whatsapp",
to: VENTAS_PHONE,
type: "text",
text: {
body:
"NUEVO PEDIDO:\n\n" +
resumen +
`\n\nResponder al cliente:\nhttps://wa.me/${to}`,
},
});
}

// ======================================================
// RESPUESTA IA
// ======================================================
export async function sendRespuestaIA(to, mensaje) {
const resp = await procesarMensajeIA(mensaje);

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: resp },
});
}

