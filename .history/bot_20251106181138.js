import axios from "axios";
import dotenv from "dotenv";
import Groq from "groq-sdk";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL;
const IG = process.env.INSTAGRAM_URL;
const WEB = process.env.WEB_URL;

export const sessions = new Map();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function iaResponder(texto) {
try {
const chat = await groq.chat.completions.create({
model: "llama-3.1-70b-versatile",
temperature: 0.6,
messages: [
{
role: "system",
content:
"Sos el asistente de Nuevo Munich: cálido, gourmet, amable y claro. No inventes productos ni precios."
},
{ role: "user", content: texto }
]
});
return chat.choices[0].message.content.trim();
} catch {
return "¿Podrías repetirme por favor? 😊";
}
}

export async function sendMessage(payload) {
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
footer: { text: `Instagram: @nuevomunich` },
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

// PRODUCTOS (Primer grupo)
export async function sendMenuProductos(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría 👇" },
action: {
buttons: [
{ type: "reply", reply: { id: "C_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "C_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "C_ALEMANAS", title: "Alemanas" } }
]
}
}
});
}

// PRODUCTOS (Segundo grupo)
export async function sendMasCategorias(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Más categorías 👇" },
action: {
buttons: [
{ type: "reply", reply: { id: "C_ESPECIALIDADES", title: "Especialidades" } },
{ type: "reply", reply: { id: "C_PARRILLA", title: "Parrilla / Grill" } },
{ type: "reply", reply: { id: "C_PICADAS", title: "Picadas Armadas" } }
]
}
}
});
}

// DETALLE CATEGORÍA ESTILO GOURMET (A)
const DESC = {
C_FETEADOS: `🥓 *Feteados Artesanales*\nAhumados lentos, curados en cámara y textura tierna.\nRecomendados para tabla fría o sándwich rústico.`,
C_SALAMES: `🥩 *Salames de Tradición Europea*\nPicado grueso o fino, notas ahumadas y especias equilibradas.`,
C_ALEMANAS: `🌭 *Salchichas Alemanas*\nVienna, Frankfurt, Húngara, Weiss, Knack y Polaca.\nIdeales para grill o plancha.`,
C_ESPECIALIDADES: `🍖 *Especialidades Ahumadas*\nKassler, Cracovia, Leberkase.\nPara disfrutar caliente, grillado o en tabla.`,
C_PARRILLA: `🔥 *Parrilla / Grill*\nCortes ahumados que sellan perfecto: aroma, dorado y sabor profundo.`,
C_PICADAS: `🧀 *Picadas Armadas*\nSe arman según cantidad de personas.\nConsultame para sugerencias personalizadas.`
};

export function sendCategoriaDetalle(to, id) {
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: DESC[id] + `\n\n¿Querés que te recomiende una combinación? 👨‍🍳` }
});
}

// EVENTOS
export function sendEventosInfo(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "🎉 Organizamos picadas y eventos 👨‍🍳\nDecime para cuántas personas es y te armo propuesta." }
});
}

// PEDIDOS
export function iniciarPedido(to) {
sessions.set(to, { paso: "ITEMS", data: {} });
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "Decime qué productos te interesan 😊" }
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
s.paso = "CONFIRM";
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: `Confirmar pedido:\n${s.data.items}\nA nombre de: ${s.data.nombre}` },
action: {
buttons: [
{ type: "reply", reply: { id: "CONFIRMAR", title: "Confirmar ✅" } },
{ type: "reply", reply: { id: "CANCELAR", title: "Cancelar ❌" } }
]
}
}
});
}

if (s.paso === "CONFIRM") {
if (msg === "CONFIRMAR") {
await sendMessage({ messaging_product: "whatsapp", to, text: { body: "✅ Pedido registrado 👨‍🍳" } });
} else {
await sendMessage({ messaging_product: "whatsapp", to, text: { body: "❌ Cancelado." } });
}
sessions.delete(to);
}
}

// IA LIBRE
export async function replyIA(to, msg) {
const r = await iaResponder(msg);
return sendMessage({ messaging_product: "whatsapp", to, text: { body: r } });
}

