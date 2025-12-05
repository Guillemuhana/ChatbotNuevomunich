import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import { procesarMensajeIA } from "./ia.js";

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const FOOTER = "www.nuevomunich.com.ar • @nuevomunich • linktr.ee/nuevomunich";

export const sessions = new Map();

async function sendMessage(data) {
return axios.post(`${API}/${PHONE_ID}/messages`, data, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// ✅ MENÚ PRINCIPAL
export async function sendMenuPrincipal(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: process.env.LOGO_URL } },
body: { text: "*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:" },
footer: { text: FOOTER },
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos" }},
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos & Catering" }},
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" }}
]
}
}
});
}

// ✅ LISTA DE CATEGORÍAS (sin emojis, sin errores)
export async function sendCategorias(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Catálogo" },
body: { text: "Seleccioná una categoría:" },
footer: { text: FOOTER },
action: {
button: "Ver categorías",
sections: [
{
title: "Productos",
rows: [
{ id: "CAT_FETEADOS", title: "Feteados" },
{ id: "CAT_SALAMES", title: "Salames" },
{ id: "CAT_ALEMANAS", title: "Salchichas Alemanas" },
{ id: "CAT_ESPECIALIDADES", title: "Especialidades" }
]
}
]
}
}
});
}

// ✅ RESPUESTA DE CADA CATEGORÍA
export async function sendProductosCategoria(to, id) {
const textos = {
CAT_FETEADOS: "Bondiola, Jamón Cocido, Lomo Ahumado a finas hierbas...",
CAT_SALAMES: "Alpino, Colonia, Holstein (ahumados y sin ahumar).",
CAT_ALEMANAS: "Vienna, Frankfurt Tipo, Húngara, Knackwurst, Weisswurst y más.",
CAT_ESPECIALIDADES: "Kassler, Leberwurst, Leberkasse, Cracovia..."
};

return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: textos[id] }
});
}

// ✅ PEDIDO SIMPLE
export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEMS" });
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "Decime qué querés pedir 😊" }
});
}

export async function flujoPedido(to, msg) {
const s = sessions.get(to);
if (!s) return;

s.data = s.data || {};

if (s.paso === "ITEMS") {
s.data.items = msg;
s.paso = "NOMBRE";
return sendMessage({ messaging_product: "whatsapp", to, text: { body: "¿A nombre de quién?" }});
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
s.paso = "CONFIRM";
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: `Confirmación:\nPedido: ${s.data.items}\nA nombre de: ${s.data.nombre}\n\nResponde *OK* o *Cancelar*` }
});
}

if (s.paso === "CONFIRM") {
if (msg.toLowerCase() === "ok")
sendMessage({ messaging_product: "whatsapp", to, text: { body: "✅ Pedido registrado!" }});
else
sendMessage({ messaging_product: "whatsapp", to, text: { body: "❌ Pedido cancelado." }});
sessions.delete(to);
}
}

// ✅ IA
export async function replyIA(to, msg) {
const r = await procesarMensajeIA(msg);
return sendMessage({ messaging_product: "whatsapp", to, text: { body: r }});
}
