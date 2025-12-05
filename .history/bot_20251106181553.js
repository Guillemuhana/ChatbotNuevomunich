import axios from "axios";
import dotenv from "dotenv";
import Groq from "groq-sdk";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL || "";
const WEB = process.env.WEB_URL || "";
const IG = process.env.INSTAGRAM_URL || "";
const CATALOGO = process.env.CATALOG_URL || "";

export const sessions = new Map();

// ✅ IA amable estilo Nuevo Munich
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function iaResponder(texto) {
try {
const r = await groq.chat.completions.create({
model: "llama-3.1-70b-versatile",
messages: [
{
role: "system",
content:
"Sos el asistente gourmet de Nuevo Munich. Habla cálido, simple, profesional y nunca des precios."
},
{ role: "user", content: texto }
]
});
return r.choices[0].message.content;
} catch {
return "Disculpame, ¿podés repetir? 😊";
}
}

// ✅ Enviar mensajes
export async function sendMessage(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// ✅ Menú principal
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
// ✅ Footer corto para evitar error
footer: { text: `${WEB}` },
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
]
}
}
});
}

// ✅ Primer bloque Categorías
export async function sendMenuProductos(to) {
await sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría 👇" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "CAT_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "CAT_ALEMANAS", title: "Alemanas" } }
]
}
}
});

return sendMasCategorias(to);
}

// ✅ Segundo bloque Categorías
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
{ type: "reply", reply: { id: "CAT_ESPECIALIDADES", title: "Especialidades" } }
]
}
}
});
}

// ✅ Respuestas por categoría (sin precios)
export async function sendCategoriaDetalle(to, id) {
const textos = {
CAT_FETEADOS: "🥓 *Feteados Artesanales*\nBondiola, Jamón Cocido, Lomo Ahumado...\n¿Querés una recomendación?",
CAT_SALAMES: "🍖 *Salames Premium*\nHolstein, Colonia, Alpino.\n¿Cuál te interesa?",
CAT_ALEMANAS: "🌭 *Salchichas Alemanas*\nFrankfurt, Húngara, Viena.\n¿Querés saber cómo se sirven?",
CAT_ESPECIALIDADES: "🔥 *Especialidades*\nKassler, Cracovia, Leberkase.\n¿Querés ideas para una picada?"
};

return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: textos[id] + `\n\nCatálogo completo:\n${CATALOGO}` }
});
}

// ✅ Eventos
export async function sendEventosInfo(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "🎉 Hacemos *catering y eventos*. Picadas para grupos, empresas o reuniones. ¿Para cuántas personas es?" }
});
}

// ✅ Pedido guiado
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
text: { body: "¿A nombre de quién registramos?" }
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
await sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "✅ Pedido registrado 👨‍🍳" }
});
} else {
await sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "❌ Pedido cancelado" }
});
}
sessions.delete(to);
}
}

// ✅ IA libre
export async function replyIA(to, msg) {
const r = await iaResponder(msg);
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: r }
});
}
