// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

const LOGO_URL = process.env.LOGO_URL;
const WEB_URL = process.env.WEB_URL;
const CATALOG_URL = process.env.CATALOG_URL;

export const VENTAS_PHONE = "5493517010545";

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
console.error("❌ ERROR EN ENVÍO:", error.response?.data || error);
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
"Bienvenidos a Nuevo Munich\n" +
"Artesanos del sabor desde 1972.\n\n" +
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
body: { text: "Elegí una opción:" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "Food truck" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "Catálogo" } },
{ type: "reply", reply: { id: "CHAT_CON_VENTAS", title: "Chat con ventas" } },
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
};

await enviarMensaje(data);
}

// ======================================================
// SUBCATEGORÍAS
// ======================================================
export async function sendSubcategoria(to, categoriaID) {
let lista = [];
let titulo = "";

const map = {
CAT_FETEADOS: ["Feteados", CATEGORIAS.FETEADOS],
CAT_SALAMES: ["Salames y Picadas", CATEGORIAS.SALAMES],
CAT_SALCHICHAS: ["Salchichas Alemanas", CATEGORIAS.SALCHICHAS],
CAT_ESPECIALIDADES: ["Especialidades", CATEGORIAS.ESPECIALIDADES],
};

if (map[categoriaID]) {
titulo = map[categoriaID][0];
lista = map[categoriaID][1] || [];
}

if (!lista.length) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "No hay productos cargados." },
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
}

// ======================================================
// PRODUCTOS
// ======================================================
export async function sendProducto(to, nombreProducto) {
const entry = IMAGENES[nombreProducto];
if (!entry) return;

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
text: { body: `${nombreProducto}\n¿Querés ver otro producto? Escribí *Menú*.` },
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
text: { body: "Consultas Food Truck:\nhttps://wa.me/" + VENTAS_PHONE },
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
document: { link: CATALOG_URL, caption: "Catálogo Nuevo Munich" },
});
}

// ======================================================
// INICIO PEDIDO
// ======================================================
export async function sendInicioPedidoOpciones(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Nuevo pedido" },
body: { text: "Elegí una opción:" },
action: {
button: "Elegir",
sections: [
{
title: "Opciones",
rows: [
{ id: "PEDIDO_PARTICULAR", title: "Pedido Particular" },
{ id: "PEDIDO_EVENTO", title: "Evento" },
{ id: "PEDIDO_EMPRESA", title: "Hotel / Restaurante" },
],
},
],
},
},
});
}

// ======================================================
// PEDIR DATOS DEL CLIENTE ❗ ESTA ES LA QUE TE FALTABA
// ======================================================
export async function pedirDatosDelCliente(to, tipo) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
`Perfecto, iniciamos un pedido (${tipo}).\n\n` +
`Por favor enviá:\n` +
`• Nombre completo\n` +
`• Fecha\n` +
`• Ubicación\n` +
`• Detalle del pedido\n\n` +
`Cuando esté completo, armo el resumen.`,
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
body: `Tu pedido quedó así:\n\n${resumen}\n\nLo envío ahora al equipo de ventas.`,
},
});

await enviarMensaje({
messaging_product: "whatsapp",
to: VENTAS_PHONE,
type: "text",
text: { body: `NUEVO PEDIDO:\n\n${resumen}\n\nCliente: https://wa.me/${to}` },
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
body: { text: "Hacer clic para hablar con ventas:" },
action: {
buttons: [
{
type: "reply",
reply: {
id: "OPEN_CHAT_VENTAS",
title: "Contactar ventas",
},
},
],
},
},
});
}

// ======================================================
// IA
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

