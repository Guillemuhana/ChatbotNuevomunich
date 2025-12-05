import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { procesarMensajeIA } from "./ia.js";

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL;
const FOOTER = `🌐 Web | 📸 Instagram | 📦 Catálogo`;

export const sessions = new Map();

async function sendMessage(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// MENU PRINCIPAL
export async function sendMenuPrincipal(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: { text: "*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:" },
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

// **PRODUCTOS COMO LISTA**
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
button: "Ver Categorías",
sections: [
{
title: "Catálogo",
rows: [
{ id: "CAT_FETEADOS", title: "Feteados" },
{ id: "CAT_SALAMES", title: "Salames" },
{ id: "CAT_ALEMANAS", title: "Salchichas Alemanas" },
{ id: "CAT_ARROLLADOS", title: "Arrollados" },
{ id: "CAT_ESPECIAL", title: "Especialidades" }
]
}
]
}
}
});
}

// INFO POR CATEGORÍA
export async function sendCategoriaDetalle(to, id) {
const textos = {
CAT_FETEADOS: "🥓 *Feteados*: Ideal para tablas y sándwiches.\nBondiola, Jamón Bávaro, Panceta Ahumada, Lomo Ahumado.",
CAT_SALAMES: "🧀 *Salames*: Para picadas.\nAlpino, Colonia, Holstein.",
CAT_ALEMANAS: "🌭 *Línea Alemana*:\nFrankfurt, Húngara, Viena, Knackwurst, Weisswurst, Rosca.",
CAT_ARROLLADOS: "🍖 *Arrollados*:\nPollo, Criollo, Matambre.",
CAT_ESPECIAL: "🔥 *Especialidades*:\nKassler, Leberkasse, Cracovia, Leberwurst."
};

return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: textos[id] + "\n\n¿Querés recomendaciones o armar una picada? 😊" }
});
}

// PEDIDOS
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
return sendMessage({ messaging_product: "whatsapp", to, text: { body: "¿A nombre de quién?" } });
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
s.paso = "FIN";
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: `✅ Pedido registrado.\nA nombre de: ${s.data.nombre}\nPedido: ${s.data.items}\n\nGracias por elegir Nuevo Munich 🤝` }
});
}
}

// IA SIEMPRE
export async function replyIA(to, msg) {
const r = await procesarMensajeIA(msg);
return sendMessage({ messaging_product: "whatsapp", to, text: { body: r } });
}

