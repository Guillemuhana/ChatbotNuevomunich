// ======================================================
// bot.js — NUEVO MUNICH — COMPLETO Y FUNCIONAL
// ======================================================

import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

// ======================================================
// CONFIGURACIÓN
// ======================================================
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

export const VENTAS_PHONE = "5493517010545";

const LOGO_URL = process.env.LOGO_URL || IMAGENES.LOGO;
const WEB_URL = process.env.WEB_URL || "https://www.nuevomunich.com.ar";
const CATALOGO_URL =
process.env.CATALOG_URL ||
"https://www.nuevomunich.com.ar/catalogo.pdf";

// ======================================================
// FUNCIÓN BASE PARA ENVIAR MENSAJES
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
header: {
type: "image",
image: { link: LOGO_URL },
},
body: {
text:
"Bienvenidos a *Nuevo Munich* 🇩🇪\n" +
"Artesanos del sabor desde 1972.\n\n" +
`🌐 Web: ${WEB_URL}\n\n` +
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

// ======================================================
// MENÚ PRINCIPAL
// ======================================================
export async function sendMenuPrincipal(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Menú principal — Elegí una opción:" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "Food truck" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "Catálogo" } },
],
},
},
};

await enviarMensaje(data);
}

// ======================================================
// CATEGORÍAS
// ======================================================
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
button: "Ver categorías",
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

// ======================================================
// SUBCATEGORÍA → ENVÍA PRODUCTOS
// ======================================================
export async function sendSubcategoria(to, categoriaID) {
let lista = [];
let titulo = "";

switch (categoriaID) {
case "CAT_FETEADOS":
lista = CATEGORIAS.FETEADOS;
titulo = "Feteados";
break;

case "CAT_SALAMES":
lista = CATEGORIAS.SALAMES;
titulo = "Salames y picadas";
break;

case "CAT_SALCHICHAS":
lista = CATEGORIAS.SALCHICHAS;
titulo = "Salchichas alemanas";
break;

case "CAT_ESPECIALIDADES":
lista = CATEGORIAS.ESPECIALIDADES;
titulo = "Especialidades";
break;
}

if (!lista || !lista.length) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "No hay productos cargados aún." },
});
return;
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
// ENVÍO DE UN PRODUCTO
// ======================================================
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
text: {
body:
`*${nombreProducto}*\n\n` +
"Si querés agregarlo al pedido, podés hacerlo desde el menú principal.",
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
"🚚 *Food Truck & Eventos*\n\n" +
"Ofrecemos servicio para fiestas, hoteles, restaurantes y ferias.\n" +
`Consultas directas: https://wa.me/${VENTAS_PHONE}`,
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
link: CATALOGO_URL,
caption: "📘 Catálogo general Nuevo Munich",
},
});
}

// ======================================================
// INICIO DE PEDIDO
// ======================================================
export async function sendInicioPedidoOpciones(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Nuevo pedido" },
body: { text: "Elegí cómo querés continuar:" },
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
// REALIZAR PEDIDO → PEDIR DATOS
// ======================================================
export async function pedirDatosDelCliente(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Perfecto 👌\nPara avanzar con tu pedido necesito:\n\n" +
"• Nombre completo\n" +
"• Fecha (compra o evento)\n" +
"• Ubicación (podés enviar ubicación por WhatsApp)\n" +
"• Detalle del pedido\n\n" +
"Cuando me envíes eso, preparo el resumen para ventas.",
},
});
}

// ======================================================
// CONFIRMAR PEDIDO Y ENVIAR A VENTAS
// ======================================================
export async function sendPedidoConfirmacionCliente(to, resumen) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Tu pedido quedó así:\n\n" +
resumen +
"\n\nLo derivo al equipo de ventas. ¡Gracias!",
},
});

await enviarMensaje({
messaging_product: "whatsapp",
to: VENTAS_PHONE,
type: "text",
text: {
body:
"📦 *NUEVO PEDIDO DESDE EL BOT*\n\n" +
`${resumen}\n\n` +
`Responder al cliente: https://wa.me/${to}`,
},
});
}

// ======================================================
// CHAT DIRECTO CON VENTAS
// ======================================================
export async function sendChatConVentas(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"📞 *Contacto directo con ventas*\n\n" +
`👉 https://wa.me/${VENTAS_PHONE}\n\n` +
"Si necesitás algo más, estoy acá para ayudarte 😊",
},
});
}

// ======================================================
// RESPUESTA IA PARA TODO LO DEMÁS
// ======================================================
export async function sendRespuestaIA(to, mensajeUsuario) {
const respuesta = await procesarMensajeIA(mensajeUsuario || "");

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: respuesta },
});
}