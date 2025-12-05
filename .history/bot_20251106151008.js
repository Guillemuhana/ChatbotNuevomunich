import axios from "axios";
import dotenv from "dotenv";
import Groq from "groq-sdk";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL;
const WEB = process.env.WEB_URL;
const IG = process.env.INSTAGRAM_URL;
const CATALOGO = process.env.CATALOG_URL;

export const sessions = new Map();

// IA - tono gourmet / vendedor cálido
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function iaResponder(texto) {
try {
const chat = await groq.chat.completions.create({
model: "llama-3.1-70b-versatile",
messages: [
{
role: "system",
content:
"Sos el asistente de Nuevo Munich. Tono amable, gourmet, cordial, experto en embutidos artesanales y picadas premium."
},
{ role: "user", content: texto }
]
});
return chat.choices[0].message.content;
} catch {
return "Disculpame, ¿podés repetir? 😊";
}
}

// --- Mensajes Base ---
export async function sendMessage(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

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
footer: { text: `🌐 ${WEB} | 📸 ${IG} | 📦 Catálogo` },
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

// --- Menú Productos ---
export async function sendProductosMenu(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría 👇" },
footer: { text: `📦 Catálogo: ${CATALOGO}` },
action: {
buttons: [
{ type: "reply", reply: { id: "P_PICADAS", title: "Picadas" } },
{ type: "reply", reply: { id: "P_SALCHICHAS", title: "Salchichas Alemanas" } },
{ type: "reply", reply: { id: "P_GRILL", title: "Parrilla / Grill" } }
]
}
}
});
}

// --- Descripción Categorías ---
export async function sendCategoriaDetalle(to, id) {
const textos = {
P_PICADAS:
"🥓 *Picadas y Tablas Artesanales*\nSelección premium ahumada, pan rústico y aromas de centroeuropa.\n\nCatálogo completo:\n" +
CATALOGO,
P_SALCHICHAS:
"🌭 *Salchichas Alemanas Clásicas*\nVienna, Frankfurt, Húngara, Bratwurst.\n\nCatálogo:\n" +
CATALOGO,
P_GRILL:
"🔥 *Parrilla & Grill*\nKassler, Rosca Polaca y cortes ahumados.\n\nCatálogo:\n" +
CATALOGO
};

return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: textos[id] }
});
}

// --- Pedidos ---
export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEMS", data: {} });
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "Decime qué querés (ej: 1 rosca + 2 viena)." }
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
s.paso = "CONFIRM";
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: `Confirmar pedido:\n\n${s.data.items}\nA nombre de: ${s.data.nombre}` },
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
await sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "✅ Pedido registrado. Gracias por tu compra 👨‍🍳" }
});
} else {
await sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "❌ Pedido cancelado." }
});
}
sessions.delete(to);
}
}

// IA en mensajes libres
export async function replyIA(to, msg) {
const r = await iaResponder(msg);
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: r }
});
}
