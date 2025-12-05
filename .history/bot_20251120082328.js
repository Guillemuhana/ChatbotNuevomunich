// bot.js
import axios from "axios";
import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import dotenv from "dotenv";
dotenv.config();

const WHATSAPP_API_URL =
`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

const TOKEN = process.env.WHATSAPP_TOKEN;

/* ======================================================
🔹 FUNCIÓN BASE PARA ENVIAR MENSAJES
====================================================== */
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

/* ======================================================
🔹 BIENVENIDA (CON LOGO ➜ TEXTO ➜ BOTONES)
====================================================== */
export async function sendBienvenida(to) {

// 1) Enviar LOGO
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "image",
image: {
link: IMAGENES.LOGO,
caption: "Bienvenidos a Nuevo Munich 🥨"
}
});

// 2) Enviar mensaje de bienvenida
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Bienvenidos a Nuevo Munich 🥨\n" +
"Artesanos del sabor desde 1972.\n" +
"🌐 https://nuevomunich.com.ar\n\n" +
"Elegí una opción 👇"
}
});

// 3) Enviar botones
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una opción 👇" },
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "📖 Leer más" } },
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" } },
],
},
},
});
}

/* ======================================================
🔹 LEER MÁS
====================================================== */
export async function sendLeerMas(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Somos una empresa familiar alemana con más de 50 años.\n" +
"Elaboramos productos artesanales y brindamos catering y eventos.\n\n" +
"¿Querés ver el menú principal?"
},
});
}

/* ======================================================
🔹 MENÚ PRINCIPAL
====================================================== */
export async function sendMenuPrincipal(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una opción 👇" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "🛒 Productos" } },
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "🚚 Food Truck / Eventos" } },
{ type: "reply", reply: { id: "CONSULTAR_PEDIDO", title: "📦 Realizar Pedido" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "📄 Catálogo Completo" } },
],
},
},
});
}

/* ======================================================
🔹 CATEGORÍAS
====================================================== */
export async function sendCategoriaProductos(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Productos Nuevo Munich" },
body: { text: "Elegí una categoría" },
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

/* ======================================================
🔹 SUBCATEGORÍA → CARRUSEL
====================================================== */
export async function sendSubcategoria(to, categoriaID) {
let categoria;

if (categoriaID === "CAT_FETEADOS") categoria = CATEGORIAS.FETEADOS;
if (categoriaID === "CAT_SALAMES") categoria = CATEGORIAS.SALAMES;
if (categoriaID === "CAT_SALCHICHAS") categoria = CATEGORIAS.SALCHICHAS;
if (categoriaID === "CAT_ESPECIALIDADES") categoria = CATEGORIAS.ESPECIALIDADES;

const productos = categoria.slice(0, 10);

const items = productos.map((nombre) => ({
id: `PROD_${nombre}`,
title: nombre,
image: { url: IMAGENES[nombre] },
}));

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "catalog_message",
body: { text: "Seleccioná un producto 👇" },
action: {
sections: [
{
title: "Productos",
product_items: items,
},
],
},
},
});
}

/* ======================================================
🔹 PRODUCTO INDIVIDUAL
====================================================== */
export async function sendProducto(to, nombre) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "image",
image: {
link: IMAGENES[nombre],
caption: `🛒 ${nombre}\n¿Querés agregarlo al pedido?`,
},
});
}

/* ======================================================
🔹 CATÁLOGO PDF
====================================================== */
export async function sendCatalogoCompleto(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: "https://nuevomunich.com.ar/catalogo.pdf",
caption: "📄 Catálogo Completo Nuevo Munich",
},
});
}

