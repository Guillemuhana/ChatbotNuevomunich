import axios from "axios";
import dotenv from "dotenv";
import Groq from "groq-sdk";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL || "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const WEB = process.env.WEB_URL || "nuevomunich.com.ar";
const IG = process.env.INSTAGRAM_URL || "@nuevomunich.oficial";
const CATALOGO = process.env.CATALOG_URL || "(Pronto disponible)";

export const sessions = new Map();

// ----------- IA ------------
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function iaResponder(texto) {
try {
const chat = await groq.chat.completions.create({
model: "llama-3.1-70b-versatile",
messages: [
{ role: "system", content: "Sos el asistente de Nuevo Munich. Tono amable y gourmet." },
{ role: "user", content: texto }
]
});
return chat.choices[0].message.content;
} catch {
return "Disculpame, ¿podés repetir? 😊";
}
}

async function sendMessage(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// ----------- MENÚ PRINCIPAL -----------
export async function sendMenuPrincipal(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: { text: "*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:" },
footer: { text: `${WEB} | ${IG}` },
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

// ----------- PRIMER MENÚ DE PRODUCTOS -----------
export async function sendProductosMenu(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría 👇" },
footer: { text: "Más categorías al final" },
action: {
buttons: [
{ type: "reply", reply: { id: "P_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "P_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "BTN_MAS_CATEGORIAS", title: "Más categorías ➕" } }
]
}
}
});
}

// ----------- SEGUNDO MENÚ DE PRODUCTOS -----------
export async function sendCategoriasExtra(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Más categorías 👇" },
footer: { text: "Seleccioná para ver detalles" },
action: {
buttons: [
{ type: "reply", reply: { id: "P_ALEMANAS", title: "Salchichas Alemanas" } },
{ type: "reply", reply: { id: "P_ESPECIALIDADES", title: "Especialidades" } }
]
}
}
});
}

// ----------- DETALLE DE CATEGORÍAS -----------
const textos = {
P_FETEADOS: "🥓 *Feteados artesanales*\nJamón, bondiola, lomito y más.\nConsultame qué buscás 😊",
P_SALAMES: "🍖 *Salames y embutidos*\nAlpino, colonia, holstein.\nConsultame por opciones.",
P_ALEMANAS: "🌭 *Salchichas Alemanas clásicas*\nVienna, Frankfurt, Húngara, Knackwurst...",
P_ESPECIALIDADES: "🔥 *Especialidades ahumadas*\nKassler, Rosca Polaca, Leberkasse."
};

export async function sendCategoriaDetalle(to, id) {
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: textos[id] + `\n\n📦 Catálogo completo: ${CATALOGO}` }
});
}

// ----------- PEDIDOS -----------
export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEMS", data: {} });
return sendMessage({ messaging_product: "whatsapp", to, text: { body: "Decime qué querés pedir 😊" } });
}

export async function flujoPedido(to, msg) {
const s = sessions.get(to);
if (!s) return;

if (s.paso === "ITEMS") {
s.data.items = msg;
s.paso = "NOMBRE";
return sendMessage({ messaging_product: "whatsapp", to, text: { body: "¿A nombre de quién lo registro?" } });
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
sessions.delete(to);
return sendMessage({ messaging_product: "whatsapp", to, text: { body: `✅ Pedido anotado.\n${s.data.items}\nA nombre de: ${s.data.nombre}` } });
}
}

// ----------- IA LIBRE -----------
export async function replyIA(to, msg) {
const r = await iaResponder(msg);
return sendMessage({ messaging_product: "whatsapp", to, text: { body: r } });
}
