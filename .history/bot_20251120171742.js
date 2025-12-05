// bot.js
import axios from "axios";
import { IMAGENES, CATEGORIAS } from "./imagenes.js";

const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

const LOGO_URL = process.env.LOGO_URL;
const WEB_URL = process.env.WEB_URL;
const CATALOG_URL = process.env.CATALOG_URL;
const VENTAS_PHONE = "5493517010545"; // número de ventas

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
🔹 BIENVENIDA (UN SOLO BLOQUE CON LOGO + BOTONES)
====================================================== */
export async function sendBienvenida(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: {
link: LOGO_URL,
},
},
body: {
text:
"Bienvenidos a Nuevo Munich 🥨\n" +
"Artesanos del sabor desde 1972.\n" +
`🌐 ${WEB_URL}\n\n` +
"Elegí una opción 👇",
},
action: {
buttons: [
{
type: "reply",
reply: { id: "LEER_MAS", title: "📖 Leer más" },
},
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" },
},
],
},
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 LEER MÁS
====================================================== */
export async function sendLeerMas(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Somos una empresa familiar con raíces alemanas y más de 50 años de historia.\n" +
"Elaboramos productos artesanales, picadas y realizamos catering y eventos.\n\n" +
"Usá el *Menú principal* para seguir navegando 👇",
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 MENÚ PRINCIPAL
====================================================== */
export async function sendMenuPrincipal(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una opción 👇" },
action: {
buttons: [
{
type: "reply",
reply: { id: "CAT_PRODUCTOS", title: "🛒 Productos" },
},
{
type: "reply",
reply: { id: "FOOD_TRUCK", title: "🚚 Food Truck / Eventos" },
},
{
type: "reply",
reply: { id: "CONSULTAR_PEDIDO", title: "📦 Realizar Pedido" },
},
{
type: "reply",
reply: { id: "CATALOGO_PDF", title: "📄 Catálogo completo" },
},
],
},
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 LISTA DE CATEGORÍAS DE PRODUCTOS
====================================================== */
export async function sendCategoriaProductos(to) {
const data = {
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
};

await enviarMensaje(data);
}

/* ======================================================
🔹 SUBCATEGORÍA → LISTA DE PRODUCTOS (SIN CATÁLOGO META)
====================================================== */
export async function sendSubcategoria(to, categoriaID) {
let lista = [];
let titulo = "Productos";

if (categoriaID === "CAT_FETEADOS") {
lista = CATEGORIAS.FETEADOS;
titulo = "Feteados";
}
if (categoriaID === "CAT_SALAMES") {
lista = CATEGORIAS.SALAMES;
titulo = "Salames / Picadas";
}
if (categoriaID === "CAT_SALCHICHAS") {
lista = CATEGORIAS.SALCHICHAS;
titulo = "Salchichas Alemanas";
}
if (categoriaID === "CAT_ESPECIALIDADES") {
lista = CATEGORIAS.ESPECIALIDADES;
titulo = "Especialidades";
}

const rows = lista.map((nombre) => ({
id: `PROD_${nombre}`,
title: nombre,
}));

const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: titulo },
body: { text: "Elegí un producto 👇" },
action: {
button: "Ver productos",
sections: [
{
title: "Productos",
rows,
},
],
},
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 PRODUCTO INDIVIDUAL (IMAGEN + BOTÓN MENÚ)
====================================================== */
export async function sendProducto(to, nombreProducto) {
const urlImagen = IMAGENES[nombreProducto];

if (!urlImagen) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body: "No encontré la imagen de ese producto 😕",
},
});
return;
}

// Enviamos un mensaje interactivo con la imagen en el header
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: {
link: urlImagen,
},
},
body: {
text:
`🛒 *${nombreProducto}*\n\n` +
"Si querés seguir viendo opciones, usá el botón de abajo 👇",
},
action: {
buttons: [
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "🏠 Menú principal" },
},
{
type: "reply",
reply: { id: "CAT_PRODUCTOS", title: "🔙 Ver productos" },
},
],
},
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 FOOD TRUCK / EVENTOS
====================================================== */
export async function sendFoodTruck(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"🚚 *Food Truck / Eventos*\n\n" +
"Ofrecemos catering, mesas frías y servicio para eventos.\n\n" +
`Para coordinar escribinos al número de ventas:\nhttps://wa.me/${VENTAS_PHONE}`,
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 CONSULTAR / REALIZAR PEDIDO
====================================================== */
export async function sendConsultarPedido(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"📦 *Realizar Pedido*\n\n" +
"Podés armar tu pedido viendo los productos en el menú.\n\n" +
`Cuando lo tengas listo, mandanos un mensaje directo al número de ventas:\nhttps://wa.me/${VENTAS_PHONE}`,
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 CATÁLOGO COMPLETO (PDF)
====================================================== */
export async function sendCatalogoCompleto(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: CATALOG_URL,
caption: "📄 Catálogo General Nuevo Munich",
},
};

await enviarMensaje(data);
}

