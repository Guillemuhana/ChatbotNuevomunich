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
BIENVENIDA (UN SOLO BLOQUE)
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
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "🛒 Productos" } }
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
MENÚ PRINCIPAL (3 BOTONES)
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
CATEGORÍAS → LISTA
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
SUBCATEGORÍA → ENVÍA TODOS LOS PRODUCTOS (DOCUMENTO HD CADA UNO)
====================================================== */
export async function sendSubcategoria(to, categoriaID) {
let lista = [];
let titulo = "";

if (categoriaID === "CAT_FETEADOS") {
lista = CATEGORIAS.FETEADOS;
titulo = "🥩 Feteados";
}
if (categoriaID === "CAT_SALAMES") {
lista = CATEGORIAS.SALAMES;
titulo = "🧀 Salames / Picadas";
}
if (categoriaID === "CAT_SALCHICHAS") {
lista = CATEGORIAS.SALCHICHAS;
titulo = "🌭 Salchichas Alemanas";
}
if (categoriaID === "CAT_ESPECIALIDADES") {
lista = CATEGORIAS.ESPECIALIDADES;
titulo = "🍖 Especialidades";
}

if (!lista || lista.length === 0) {
await sendRespuestaIA(
to,
"Un cliente preguntó por la categoría " + categoriaID + " pero no hay productos cargados."
);
return;
}

// Mensaje de cabecera de la categoría
const encabezado = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body: `${titulo}\nEstos son algunos de nuestros productos de esta categoría 👇`
}
};
await enviarMensaje(encabezado);

// Enviar cada producto individualmente (DOCUMENTO HD)
for (const nombre of lista) {
await sendProducto(to, nombre);
}
}

/* ======================================================
PRODUCTO INDIVIDUAL (DOCUMENTO HD)
====================================================== */
export async function sendProducto(to, nombreProducto) {
const urlImagen = IMAGENES[nombreProducto];

if (!urlImagen) {
const dataError = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body: `No encontré la imagen de "${nombreProducto}" 😕.`
}
};
await enviarMensaje(dataError);
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
`Para pedirlo seleccioná *Realizar pedido* en el menú o escribinos al WhatsApp de ventas:\nhttps://wa.me/${VENTAS_PHONE}`
}
};

await enviarMensaje(data);
}

/* ======================================================
FOOD TRUCK / EVENTOS
====================================================== */
export async function sendFoodTruck(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"🚚 *Food Truck / Eventos*\n\n" +
"Ofrecemos catering, mesas frías y servicio para eventos especiales.\n\n" +
`Para coordinar, escribinos al WhatsApp de ventas:\nhttps://wa.me/${VENTAS_PHONE}`
}
};

await enviarMensaje(data);
}

/* ======================================================
PEDIDOS (informativo, derivando al número de ventas)
====================================================== */
export async function sendConsultarPedido(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"📦 *Realizar Pedido*\n\n" +
"Podés ver el catálogo en el menú de *Productos* y elegir lo que te guste.\n\n" +
`Cuando tengas tu elección, envianos el detalle al WhatsApp de ventas:\nhttps://wa.me/${VENTAS_PHONE}`
}
};

await enviarMensaje(data);
}

/* ======================================================
CATÁLOGO PDF
====================================================== */
export async function sendCatalogoCompleto(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: CATALOG_URL,
caption: "📄 Catálogo General Nuevo Munich"
}
};

await enviarMensaje(data);
}

/* ======================================================
RESPUESTA IA (LLAMA A ia.js)
====================================================== */
export async function sendRespuestaIA(to, mensajeUsuario) {
const respuesta = await procesarMensajeIA(mensajeUsuario || "");

const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body: respuesta
}
};

await enviarMensaje(data);
}