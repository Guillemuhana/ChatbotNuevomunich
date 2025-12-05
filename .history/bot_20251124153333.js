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

// número de ventas para derivar el pedido
const VENTAS_PHONE = "5493517010545";

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
const data = {
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
"Bienvenidos a Nuevo Munich 🥨\n" +
"Artesanos del sabor desde 1972.\n" +
`🌐 ${WEB_URL}\n\n` +
"Elegí una opción 👇"
},
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "📖 Leer más" } },
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" } },
{ type: "reply", reply: { id: "INICIO_PEDIDO", title: "📝 Realizar Pedido" } }
]
}
}
};

await enviarMensaje(data);
}

/* ======================================================
LEER MÁS
====================================================== */
export async function sendLeerMas(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Somos una empresa familiar con raíces centroeuropeas y más de 50 años de trayectoria.\n" +
"Elaboramos productos artesanales, picadas y realizamos catering y eventos.\n\n" +
"Usá el *Menú principal* para seguir navegando 👇"
}
};

await enviarMensaje(data);
}

/* ======================================================
MENÚ PRINCIPAL
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
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "🛒 Productos" } },
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "🚚 Food Truck / Eventos" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "📄 Catálogo PDF" } }
]
}
}
};

await enviarMensaje(data);
}

/* ======================================================
CATEGORÍAS
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
{ id: "CAT_ESPECIALIDADES", title: "🍖 Especialidades" }
]
}
]
}
}
};

await enviarMensaje(data);
}

/* ======================================================
SUBCATEGORÍAS
====================================================== */
export async function sendSubcategoria(to, categoriaID) {
let lista = [];
let titulo = "";

if (categoriaID === "CAT_FETEADOS") lista = CATEGORIAS.FETEADOS, titulo = "🥩 Feteados";
if (categoriaID === "CAT_SALAMES") lista = CATEGORIAS.SALAMES, titulo = "🧀 Salames / Picadas";
if (categoriaID === "CAT_SALCHICHAS") lista = CATEGORIAS.SALCHICHAS, titulo = "🌭 Salchichas Alemanas";
if (categoriaID === "CAT_ESPECIALIDADES") lista = CATEGORIAS.ESPECIALIDADES, titulo = "🍖 Especialidades";

const encabezado = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body: `${titulo}\nEstos son algunos de nuestros productos 👇`
}
};
await enviarMensaje(encabezado);

for (const nombre of lista) {
await sendProducto(to, nombre);
}
}

/* ======================================================
PRODUCTO (DOCUMENTO HD)
====================================================== */
export async function sendProducto(to, nombreProducto) {
const urlImagen = IMAGENES[nombreProducto];

if (!urlImagen) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `No encontré la imagen de "${nombreProducto}" 😕.` }
});
return;
}

const data = {
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: urlImagen,
filename: `${nombreProducto}.png`,
caption:
`🛒 ${nombreProducto}\n\n` +
`Para pedirlo escribinos al WhatsApp de ventas:\nhttps://wa.me/${VENTAS_PHONE}`
}
};

await enviarMensaje(data);
}

/* ======================================================
INICIO DEL PEDIDO (NUEVO)
====================================================== */
export async function sendInicioPedido(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "📝 Realizar un pedido" },
body: { text: "Elegí el tipo de pedido 👇" },
action: {
button: "Elegir",
sections: [
{
title: "Tipo de pedido",
rows: [
{ id: "PEDIDO_PARTICULAR", title: "👤 Particular" },
{ id: "PEDIDO_EVENTO", title: "🎉 Evento" },
{ id: "PEDIDO_EMPRESA", title: "🏢 Restaurante / Hotel" },
{ id: "PEDIDO_FOODTRUCK", title: "🚚 Food Truck" }
]
}
]
}
}
};

await enviarMensaje(data);
}

/* ======================================================
FOOD TRUCK
====================================================== */
export async function sendFoodTruck(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"🚚 *Food Truck / Eventos*\n\n" +
"Ofrecemos catering, mesas frías y servicio especial para eventos.\n\n" +
`Consultas:\nhttps://wa.me/${VENTAS_PHONE}`
}
};

await enviarMensaje(data);
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
caption: "📄 Catálogo General Nuevo Munich"
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
