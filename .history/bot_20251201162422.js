// ======================================================
// bot.js — NUEVO MUNICH • COMPLETO + CHAT VENTAS
// ======================================================

import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

// --------------------------------------------------
// CONFIG WHATSAPP
// --------------------------------------------------
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

const LOGO_URL = process.env.LOGO_URL || IMAGENES.LOGO;
const WEB_URL = process.env.WEB_URL || "https://www.nuevomunich.com.ar";
const CATALOG_URL = process.env.CATALOG_URL || "https://www.nuevomunich.com.ar/catalogo.pdf";

export const VENTAS_PHONE = "5493517010545";

// --------------------------------------------------
// FUNCIÓN BASE PARA ENVIAR
// --------------------------------------------------
async function enviarMensaje(data) {
try {
await axios.post(WHATSAPP_API_URL, data, {
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${TOKEN}`
}
});
} catch (err) {
console.error("❌ ERROR EN ENVÍO:", err.response?.data || err.message);
}
}

// --------------------------------------------------
// BIENVENIDA (LOGO + MENÚ + CHAT VENTAS)
// --------------------------------------------------
export async function sendBienvenida(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: LOGO_URL }
},
body: {
text:
"Bienvenidos a Nuevo Munich 🇩🇪\n" +
"Artesanos del sabor desde 1972.\n" +
`🌐 Web: ${WEB_URL}\n\n` +
"Elegí una opción:"
},
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú" } },
{ type: "reply", reply: { id: "CHAT_VENTAS", title: "Chat con ventas" } }
]
}
}
});
}

// --------------------------------------------------
// CHAT CON VENTAS
// --------------------------------------------------
export async function sendChatConVentas(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"📞 *Contacto directo con ventas*\n\n" +
`👉 https://wa.me/${VENTAS_PHONE}\n\n` +
"Si necesitás algo más, estoy acá para ayudarte 😊"
}
});
}

// --------------------------------------------------
// MENÚ PRINCIPAL
// --------------------------------------------------
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
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "Food truck" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "Catálogo" } }
]
}
}
});
}

// --------------------------------------------------
// CATEGORÍAS LIST
// --------------------------------------------------
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
{ id: "CAT_SALAMES", title: "Salames / picadas" },
{ id: "CAT_SALCHICHAS", title: "Salchichas" },
{ id: "CAT_ESPECIALIDADES", title: "Especialidades" }
]
}
]
}
}
});
}

// --------------------------------------------------
// SUBCATEGORÍAS
// --------------------------------------------------
export async function sendSubcategoria(to, id) {
let lista = [];
let titulo = "";

const map = {
CAT_FETEADOS: ["Feteados", CATEGORIAS.FETEADOS],
CAT_SALAMES: ["Salames y picadas", CATEGORIAS.SALAMES],
CAT_SALCHICHAS: ["Salchichas alemanas", CATEGORIAS.SALCHICHAS],
CAT_ESPECIALIDADES: ["Especialidades", CATEGORIAS.ESPECIALIDADES]
};

if (!map[id]) return;

titulo = map[id][0];
lista = map[id][1] || [];

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `${titulo}\nEstos son nuestros productos:` }
});

for (const nombre of lista) {
await sendProducto(to, nombre);
}
}

// --------------------------------------------------
// PRODUCTO
// --------------------------------------------------
export async function sendProducto(to, nombre) {
const entry = IMAGENES[nombre];
if (!entry) return;

const urls = Array.isArray(entry) ? entry : [entry];

for (const url of urls.slice(0, 5)) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: url }
});
}

const texto = await procesarMensajeIA(
`Explicá el producto "${nombre}" como chef + vendedor de Nuevo Munich.`
);

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
`🛒 ${nombre}\n\n${texto}\n\n` +
`Para hablar con ventas:\n👉 https://wa.me/${VENTAS_PHONE}`
}
});
}

// --------------------------------------------------
// FOOD TRUCK
// --------------------------------------------------
export async function sendFoodTruck(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"🚚 *Food truck / eventos*\n\n" +
"Ofrecemos catering, mesas frías y servicio para eventos.\n\n" +
`Consultas:\n👉 https://wa.me/${VENTAS_PHONE}`
}
});
}

// --------------------------------------------------
// CATÁLOGO PDF
// --------------------------------------------------
export async function sendCatalogoCompleto(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: CATALOG_URL,
caption: "Catálogo general Nuevo Munich"
}
});
}

// --------------------------------------------------
// IA
// --------------------------------------------------
export async function sendRespuestaIA(to, mensaje) {
const r = await procesarMensajeIA(mensaje);
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: r }
});
}

