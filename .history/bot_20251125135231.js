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
Authorization: `Bearer ${TOKEN}`,
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
header: {
type: "image",
image: { link: LOGO_URL }
},
body: {
text:
"Bienvenidos a Nuevo Munich\n" +
"Artesanos del sabor desde 1972.\n" +
`🌐 ${WEB_URL}\n\n` +
"Elegí una opción:"
},
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "MENU" }},
{ type: "reply", reply: { id: "INICIO_PEDIDO", title: "PEDIDO" }}
]
}
}
});
}

/* ======================================================
MENÚ PRINCIPAL (botones válidos ≤ 20 chars)
====================================================== */
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
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "PRODUCTOS" }},
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "FOOD TRUCK" }},
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "CATALOGO" }},
{ type: "reply", reply: { id: "INICIO_PEDIDO", title: "PEDIDO" }}
]
}
}
});
}

/* ======================================================
CATEGORÍAS (LISTA)
====================================================== */
export async function sendCategoriaProductos(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "PRODUCTOS" },
body: { text: "Elegí una categoría:" },
action: {
button: "VER",
sections: [
{
title: "CATEGORIAS",
rows: [
{ id: "CAT_FETEADOS", title: "Feteados" },
{ id: "CAT_SALAMES", title: "Salames" },
{ id: "CAT_SALCHICHAS", title: "Salchichas" },
{ id: "CAT_ESPECIALIDADES", title: "Especialidades" }
]
}
]
}
}
});
}

/* ======================================================
SUBCATEGORÍAS
====================================================== */
export async function sendSubcategoria(to, categoriaID) {
let lista = [];
let titulo = "";

if (categoriaID === "CAT_FETEADOS") { lista = CATEGORIAS.FETEADOS; titulo = "Feteados"; }
if (categoriaID === "CAT_SALAMES") { lista = CATEGORIAS.SALAMES; titulo = "Salames"; }
if (categoriaID === "CAT_SALCHICHAS") { lista = CATEGORIAS.SALCHICHAS; titulo = "Salchichas"; }
if (categoriaID === "CAT_ESPECIALIDADES") { lista = CATEGORIAS.ESPECIALIDADES; titulo = "Especialidades"; }

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `${titulo}\nNuestros productos:` }
});

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
return enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `No encontré la imagen de "${nombreProducto}".` },
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
`Para pedirlo, seleccioná PEDIDO o escribinos:\nhttps://wa.me/${VENTAS_PHONE}`
}
});
}

/* ======================================================
FOOD TRUCK
====================================================== */
export async function sendFoodTruck(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"FOOD TRUCK / EVENTOS\n\n" +
"Catering, mesas frías y servicio para eventos.\n\n" +
`Consultanos:\nhttps://wa.me/${VENTAS_PHONE}`
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
caption: "CATÁLOGO GENERAL"
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

