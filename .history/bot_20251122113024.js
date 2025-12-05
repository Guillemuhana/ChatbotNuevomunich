// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

const WHATSAPP_API_URL =
`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

const LOGO_URL = process.env.LOGO_URL;
const WEB_URL = process.env.WEB_URL;
const CATALOG_URL = process.env.CATALOG_URL;

const VENTAS_PHONE = "5493517010545";

// ======================================================
// ENVIAR MENSAJE
// ======================================================
async function enviarMensaje(data) {
try {
await axios.post(WHATSAPP_API_URL, data, {
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${TOKEN}`,
},
});
} catch (error) {
console.error("❌ ERROR EN ENVÍO:", error.response?.data || error.message);
}
}

// ======================================================
// BIENVENIDA
// ======================================================
export async function sendBienvenida(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO_URL } },
body: {
text:
"Bienvenidos a Nuevo Munich 🥨\n" +
"Artesanos del sabor desde 1972.\n" +
`🌐 ${WEB_URL}\n\nElegí una opción 👇`,
},
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "📖 Leer más" } },
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "📋 Menú" } },
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "🛒 Productos" } }
]
}
}
};

await enviarMensaje(data);
}

// ======================================================
// LEER MÁS
// ======================================================
export async function sendLeerMas(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Somos una empresa familiar con raíces alemanas y más de 50 años de trayectoria.\n\n" +
"Elaboramos productos artesanales, picadas y realizamos catering y eventos.\n\n" +
"Usá el *Menú principal* para seguir navegando 👇",
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
body: { text: "Elegí una opción 👇" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "🛒 Productos" } },
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "🚚 Food Truck" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "📄 Catálogo" } }
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
body: { text: "Elegí una categoría 👇" },
action: {
button: "Ver categorías",
sections: [
{
title: "Productos",
rows: [
{ id: "CAT_FETEADOS", title: "🥩 Feteados" },
{ id: "CAT_SALAMES", title: "🧀 Salames / Picadas" },
{ id: "CAT_SALCHICHAS", title: "🌭 Salchichas" },
{ id: "CAT_ESPECIALIDADES", title: "🍖 Especialidades" },
],
},
],
},
},
});
}

// ======================================================
// SUBCATEGORÍA (SE ENVÍAN IMÁGENES UNA POR UNA)
// ======================================================
export async function sendSubcategoria(to, categoriaID) {
let lista = [];

if (categoriaID === "CAT_FETEADOS") lista = CATEGORIAS.FETEADOS;
if (categoriaID === "CAT_SALAMES") lista = CATEGORIAS.SALAMES;
if (categoriaID === "CAT_SALCHICHAS") lista = CATEGORIAS.SALCHICHAS;
if (categoriaID === "CAT_ESPECIALIDADES") lista = CATEGORIAS.ESPECIALIDADES;

for (const nombre of lista) {
await sendProducto(to, nombre);
}
}

// ======================================================
// PRODUCTO INDIVIDUAL
// ======================================================
export async function sendProducto(to, nombreProducto) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "image",
image: {
link: IMAGENES[nombreProducto],
caption: `🛒 ${nombreProducto}\n\nPara pedirlo seleccioná *Realizar pedido* en el menú.`,
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
"Servicio para eventos, catering y mesas frías.\n\n" +
`Consultas:\nhttps://wa.me/${VENTAS_PHONE}`,
},
});
}

// ======================================================
// PEDIDOS
// ======================================================
export async function sendConsultarPedido(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"📦 *Realizar Pedido*\n\n" +
"Podés armar tu pedido desde el menú de productos.\n\n" +
`Cuando lo tengas listo escribí al WhatsApp de ventas:\nhttps://wa.me/${VENTAS_PHONE}`,
},
});
}

// ======================================================
// CATÁLOGO
// ======================================================
export async function sendCatalogoCompleto(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "document",
document: { link: CATALOG_URL, caption: "📄 Catálogo General Nuevo Munich" },
});
}

// ======================================================
// RESPUESTA IA
// ======================================================
export async function sendRespuestaIA(to, mensajeUsuario) {
const respuesta = await procesarMensajeIA(mensajeUsuario);

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: respuesta },
});
}

