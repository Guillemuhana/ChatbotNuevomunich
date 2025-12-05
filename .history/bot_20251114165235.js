// =========================================
// BOT OFICIAL - NUEVO MUNICH
// =========================================

import axios from "axios";
import dotenv from "dotenv";
import { IMAGENES } from "./imagenes.js";

dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// SESIONES
export const sessions = new Map();

function getSession(id) {
if (!sessions.has(id)) {
sessions.set(id, { step: null, data: {} });
}
return sessions.get(id);
}

// ENVIO DE TEXTO
export async function sendTexto(to, body) {
return axios.post(
`${API}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
text: { body }
},
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

// ENVIO GENERICO
export async function send(payload) {
return axios.post(
`${API}/${PHONE_ID}/messages`,
payload,
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

// LOGO
const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// =========================================
// BIENVENIDA
// =========================================
export async function sendBienvenida(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: {
text:
`*Bienvenidos a Nuevo Munich 🥨*
Artesanos del sabor desde 1972.

🌐 https://nuevomunich.com.ar

Elegí una opción:`
},
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "📖 Leer más" } },
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" } }
]
}
}
});
}

// =========================================
// LEER MÁS
// =========================================
export async function sendLeerMas(to) {
return sendTexto(
to,
`*Artesanos del Sabor*\n\nFue en 1972 cuando los primeros dueños, de origen austríaco, trajeron sus recetas heredadas de generaciones.\n\nHoy mantenemos ese legado en cada elaboración.\n\nEscribí *Menú* para volver.`
);
}

// =========================================
// MENÚ PRINCIPAL
// =========================================
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una opción del menú principal:" },
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRODUCTOS", title: "🥓 Productos" } },
{ type: "reply", reply: { id: "CATALOGO", title: "📘 Catálogo" } },
{ type: "reply", reply: { id: "EVENTOS", title: "🎪 Eventos" } },
{ type: "reply", reply: { id: "CONSULTA", title: "📝 Consulta de Interés" } }
]
}
}
});
}

// =========================================
// MENU PRODUCTOS
// =========================================
export async function sendMenuProductos(to) {
const lista = Object.keys(IMAGENES);

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
body: { text: "Elegí un producto para ver su imagen:" },
action: {
button: "Ver productos",
sections: [
{
title: "Productos Artesanales",
rows: lista.map(p => ({
id: "PROD_" + p,
title: p
}))
}
]
}
}
});
}

// =========================================
// MOSTRAR IMAGEN DE PRODUCTO
// =========================================
export async function sendProductoImagen(to, clave) {
const url = IMAGENES[clave];

if (!url) {
return sendTexto(to, "No encontré imagen para ese producto 😕");
}

await send({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: url }
});

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "¿Querés ver otra cosa?" },
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" } }
]
}
}
});
}

// =========================================
// CONSULTA DE INTERÉS (SIMPLIFICADA)
// =========================================
export async function iniciarConsulta(to) {
const s = getSession(to);
s.step = "NOMBRE";
s.data = {};
return sendTexto(to, "📝 *Perfecto, vamos a registrar tu consulta.*\n\n¿Cuál es tu *nombre y apellido*?");
}

export async function flujoConsulta(to, msg) {
const s = getSession(to);

switch (s.step) {
case "NOMBRE":
s.data.nombre = msg;
s.step = "TELEFONO";
return sendTexto(to, "📱 Perfecto. ¿Tu número de teléfono?");

case "TELEFONO":
s.data.telefono = msg;
s.step = "CONSULTA";
return sendTexto(to, "🛒 ¿Qué productos te interesan o qué consulta querés hacer?");

case "CONSULTA":
s.data.consulta = msg;
s.step = null;

return sendTexto(
to,
`📩 *Consulta registrada*\n\n` +
`👤 Nombre: ${s.data.nombre}\n` +
`📱 Tel: ${s.data.telefono}\n` +
`📝 Consulta: ${s.data.consulta}\n\n` +
`Un asesor comercial se comunicará con vos 😊`
);

default:
return false;
}
}
