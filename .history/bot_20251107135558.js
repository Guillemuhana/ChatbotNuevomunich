import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { procesarMensajeIA } from "./ia.js";

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL;
// Footer ULTRA corto (< 60 chars) para que no dé error:
const FOOTER = "nuevomunich.com.ar · @nuevomunich · linktr.ee";

export const sessions = new Map();

// ---- util base ----
async function sendMessage(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// ---- Menú principal (2 botones) ----
export async function sendMenuPrincipal(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: {
text: "*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:"
},
footer: { text: FOOTER },
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
]
}
}
});
}

// ---- Productos como LISTA (entran todas las categorías) ----
export async function sendProductosLista(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
body: { text: "Seleccioná una categoría:" },
footer: { text: FOOTER },
action: {
button: "Ver categorías",
sections: [
{
title: "Catálogo Nuevo Munich",
rows: [
{ id: "CAT_FETEADOS", title: "Feteados" },
{ id: "CAT_SALAMES", title: "Salames" },
{ id: "CAT_ALEMANAS", title: "Salchichas Alemanas" },
{ id: "CAT_ARROLLADOS",title: "Arrollados" },
{ id: "CAT_ESPECIAL", title: "Especialidades" }
]
}
]
}
}
});
}

// ---- Descripción por categoría (texto) ----
export async function sendCategoriaDetalle(to, id) {
const textos = {
CAT_FETEADOS:
"🥓 *Feteados*:\nBondiola, Jamón Cocido (Bávaro/Asado), Panceta Ahumada, Lomo Ahumado.\nIdeal para tablas y sándwiches.",
CAT_SALAMES:
"🧀 *Salames*:\nAlpino (ahumado, grueso), Colonia, Holstein (ahumado, fino).\nClásicos de picada.",
CAT_ALEMANAS:
"🌭 *Línea Alemana*:\nViena, Frankfurt, Húngara, Knackwurst, Weisswurst, Rosca Polaca.\nPara plancha, horno o parrilla.",
CAT_ARROLLADOS:
"🍖 *Arrollados*:\nDe Pollo, Criollo y Matambre.\nPerfectos para tablas frías y sándwiches.",
CAT_ESPECIAL:
"🔥 *Especialidades*:\nKassler (costeleta ahumada), Leberkasse, Cracovia, Leberwurst.\nPara platos calientes o untables."
};

return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: textos[id] + "\n\n¿Querés recomendaciones o armar una picada? 😊" }
});
}

// ---- Flujo de pedido simple ----
export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEMS", data: {} });
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "Decime qué querés pedir (ej: 2 Viena + 1 Alpino)." }
});
}

export async function flujoPedido(to, msg) {
const s = sessions.get(to);
if (!s) return;

if (s.paso === "ITEMS") {
s.data.items = msg;
s.paso = "NOMBRE";
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "¿A nombre de quién registramos el pedido?" }
});
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
s.paso = "FIN";
sessions.delete(to);
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: `✅ Pedido registrado.\nCliente: ${s.data.nombre}\nPedido: ${s.data.items}\n\nGracias por elegir *Nuevo Munich* 👨‍🍳` }
});
}
}

// ---- IA (Groq) para cualquier texto libre ----
export async function replyIA(to, msg) {
try {
const texto = await procesarMensajeIA(msg);
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: texto }
});
} catch {
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "¿Te cuento sobre nuestras picadas o preferís salchichas alemanas? 😄" }
});
}
}

