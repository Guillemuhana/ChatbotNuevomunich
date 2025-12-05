import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { procesarMensajeIA } from "./ia.js";

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// FOOTER (máx 60 chars → seguro, nunca falla)
const FOOTER = `www.nuevomunich.com.ar / @nuevomunich`;

export const sessions = new Map();

async function sendMessage(data) {
return axios.post(`${API}/${PHONE_ID}/messages`, data, {
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
body: { text: "*Bienvenidos a Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:" },
footer: { text: FOOTER },
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos & Catering" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
]
}
}
});
}

// PRODUCTOS — PÁGINA 1
export async function sendProductosMenu1(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría 👇" },
footer: { text: FOOTER },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "CAT_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "BTN_MAS_CATEGORIAS", title: "Más categorías" } }
]
}
}
});
}

// PRODUCTOS — PÁGINA 2
export async function sendProductosMenu2(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Más categorías 👇" },
footer: { text: FOOTER },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_ALEMANAS", title: "Alemanas" } },
{ type: "reply", reply: { id: "CAT_ESPECIALIDADES", title: "Especialidades" } },
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Volver" } }
]
}
}
});
}

// DESCRIPCIÓN DE CATEGORÍAS
const DETALLES = {
CAT_FETEADOS: "🥓 *Feteados Premium*\nBondiola, Jamones, Lomitos, Panceta ahumada.\n\nConsultanos por combinaciones para picadas.",
CAT_SALAMES: "🍷 *Salames Artesanales*\nAlpino, Holstein, Colonia.\n\nAhumados naturales.",
CAT_ALEMANAS: "🌭 *Línea Alemana*\nFrankfurt, Viena, Húngara, Knackwurst, Weisswurst, Rosca Polaca.",
CAT_ESPECIALIDADES: "🔥 *Especialidades Gourmet*\nKassler, Cracovia, Leberwurst, Leberkasse."
};

export async function sendCategoriaDetalle(to, id) {
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: DETALLES[id] + `\n\nCatálogo completo:\n${process.env.CATALOG_URL}` }
});
}

// EVENTOS
export async function sendEventos(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "🎉 Organizamos *Eventos & Catering*.\nContanos cantidad de personas y estilo." }
});
}

// PEDIDOS
export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEMS" });
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "Contame qué querés pedir 😊" }
});
}

export async function flujoPedido(to, msg) {
const s = sessions.get(to);
if (!s) return;

if (s.paso === "ITEMS") {
s.items = msg;
s.paso = "NOMBRE";
return sendMessage({ messaging_product: "whatsapp", to, text: { body: "¿A nombre de quién?" } });
}

if (s.paso === "NOMBRE") {
s.nombre = msg;
s.paso = "CONFIRM";
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: `Perfecto 👍\nPedido: ${s.items}\nNombre: ${s.nombre}\n\n*Escribí OK para confirmar*` }
});
}

if (s.paso === "CONFIRM") {
sessions.delete(to);
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "✅ Pedido registrado. Gracias por elegir Nuevo Munich 👨‍🍳" }
});
}
}

// IA LIBRE
export async function replyIA(to, msg) {
const r = await procesarMensajeIA(msg);
return sendMessage({ messaging_product: "whatsapp", to, text: { body: r } });
}