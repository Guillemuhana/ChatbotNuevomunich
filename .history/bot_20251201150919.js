// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

// ======================================================================
// CONFIG WHATSAPP
// ======================================================================
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

// Logo y enlaces
const LOGO_URL = process.env.LOGO_URL || IMAGENES.LOGO;
const WEB_URL = process.env.WEB_URL || "https://www.nuevomunich.com.ar";
const CATALOG_URL =
process.env.CATALOG_URL ||
"https://www.nuevomunich.com.ar/catalogo.pdf";

export const VENTAS_PHONE = "5493517010545";

// ======================================================================
// FUNCIÓN BASE PARA ENVIAR MENSAJES
// ======================================================================
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

// ======================================================================
// BIENVENIDA (con logo)
// ======================================================================
export async function sendBienvenida(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: LOGO_URL },
},
body: {
text:
"Bienvenidos a Nuevo Munich\n" +
"Artesanos del sabor desde 1972.\n" +
`Web: ${WEB_URL}\n\n` +
"Elegí una opción:",
},
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú" } },
{ type: "reply", reply: { id: "INICIO_PEDIDO", title: "Pedido" } },
],
},
},
};

await enviarMensaje(data);
}

// ======================================================================
// MENÚ PRINCIPAL
// ======================================================================
export async function sendMenuPrincipal(to) {
const data = {
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
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "Catálogo" } },
{ type: "reply", reply: { id: "CHAT_VENTAS", title: "Chat con ventas" } },
],
},
},
};

await enviarMensaje(data);
}

// ======================================================================
// CATEGORÍAS
// ======================================================================
export async function sendCategoriaProductos(to) {
const data = {
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
{ id: "CAT_ESPECIALIDADES", title: "Especialidades" },
],
},
],
},
},
};

await enviarMensaje(data);
}

// ======================================================================
// SUBCATEGORÍAS → Enviar productos
// ======================================================================
export async function sendSubcategoria(to, categoriaID) {
let lista = [];
let titulo = "";

if (categoriaID === "CAT_FETEADOS") {
lista = CATEGORIAS.FETEADOS;
titulo = "Feteados";
} else if (categoriaID === "CAT_SALAMES") {
lista = CATEGORIAS.SALAMES;
titulo = "Salames y picadas";
} else if (categoriaID === "CAT_SALCHICHAS") {
lista = CATEGORIAS.SALCHICHAS;
titulo = "Salchichas alemanas";
} else if (categoriaID === "CAT_ESPECIALIDADES") {
lista = CATEGORIAS.ESPECIALIDADES;
titulo = "Especialidades";
}

if (!lista?.length) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "No hay productos cargados en esta categoría." },
});
return;
}

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `${titulo}\nEstos son nuestros productos:` },
});

for (const nombre of lista) {
await sendProducto(to, nombre);
}

// botón para volver al menú
await sendMenuPrincipal(to);
}

// ======================================================================
// PRODUCTO → Enviar imágenes
// ======================================================================
export async function sendProducto(to, nombreProducto) {
const entry = IMAGENES[nombreProducto];
if (!entry) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `No encontré imágenes para "${nombreProducto}".` },
});
return;
}

const urls = Array.isArray(entry) ? entry : [entry];

for (const url of urls.slice(0, 5)) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: url },
});
}

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `${nombreProducto}\n¿Querés ver otro producto?` },
});
}

// ======================================================================
// FOOD TRUCK
// ======================================================================
export async function sendFoodTruck(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Food truck & eventos\n\n" +
"Ofrecemos catering, mesas frías, picadas calientes y servicio para eventos.\n\n" +
`Consultas directas al equipo de ventas:\nhttps://wa.me/${VENTAS_PHONE}`,
},
});
}

// ======================================================================
// CATÁLOGO PDF
// ======================================================================
export async function sendCatalogoCompleto(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "document",
document: { link: CATALOG_URL, caption: "Catálogo completo" },
});
}

// ======================================================================
// PEDIDO – Opciones
// ======================================================================
export async function sendInicioPedidoOpciones(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Nuevo pedido" },
body: { text: "Seleccioná una opción:" },
action: {
button: "Elegir",
sections: [
{
title: "Opciones",
rows: [
{ id: "REALIZAR_PEDIDO", title: "Realizar pedido" },
{ id: "CHAT_VENTAS", title: "Hablar con ventas" },
],
},
],
},
},
};

await enviarMensaje(data);
}

// ======================================================================
// CHAT DIRECTO CON VENTAS (ÚNICA FUNCIÓN CORRECTA)
// ======================================================================
export async function sendChatVentas(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text:
"¿Querés hablar directamente con un representante de ventas?\n\n" +
"Hacé clic aquí:",
},
action: {
buttons: [
{
type: "url",
url: `https://wa.me/${VENTAS_PHONE}`,
title: "WhatsApp Ventas",
},
],
},
},
};

await enviarMensaje(data);
}

// ======================================================================
// IA fallback
// ======================================================================
export async function sendRespuestaIA(to, mensajeUsuario) {
const respuesta = await procesarMensajeIA(mensajeUsuario || "");

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: respuesta },
});
}
