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

// IA
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function iaResponder(texto) {
try {
const chat = await groq.chat.completions.create({
model: "llama-3.1-70b-versatile",
messages: [
{
role: "system",
content:
"Sos el asistente de Nuevo Munich. Tono cálido, gourmet, cordial."
},
{ role: "user", content: texto }
]
});
return chat.choices[0].message.content;
} catch {
return "Disculpame, ¿podés repetir? 😊";
}
}

export const sessions = new Map();

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
body: {
text: "*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:"
},
footer: { text: "NuevoMunich.com.ar · Instagram · Catálogo" },
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Ver Productos" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
]
}
}
});
}

// MENÚ CATEGORÍAS
export async function sendProductosMenu(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría 👇" },
footer: { text: "NuevoMunich.com.ar · Catálogo" },
action: {
buttons: [
{ type: "reply", reply: { id: "C_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "C_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "C_SALCHICHAS", title: "Salchichas Alemanas" } },
{ type: "reply", reply: { id: "C_ESPECIALIDADES", title: "Especialidades" } }
]
}
}
});
}

// PRODUCTOS POR CATEGORÍA
export async function sendCategoriaDetalle(to, id) {
const textos = {
C_FETEADOS: `🥓 *FETEADOS ARTESANALES*
- Bondiola
- Jamón Cocido (Común, Tipo Bávaro, Tipo Asado)
- Panceta salada cocida ahumada
- Arrollado de pollo y arrollado criollo
- Lomo de cerdo ahumado a las finas hierbas`,

C_SALAMES: `🥓 *SALAMES*
- Salame tipo Alpino (ahumado, picado grueso)
- Salame tipo Colonia
- Salame Holstein (ahumado, picado fino)`,

C_SALCHICHAS: `🌭 *SALCHICHAS ALEMANAS*
- Viena (copetín y grande)
- Frankfurt tipo (superpancho alemán)
- Tipo Húngara (copetín y grande)
- Knackwurst tipo
- Weisswurst tipo
- Rosca Polaca`,

C_ESPECIALIDADES: `🔥 *ESPECIALIDADES & GRILL*
- Kassler (costeleta de cerdo ahumada)
- Leberkasse
- Cracovia
- Leberwurst (paté de hígado)`
};

return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: textos[id] + `\n\nCatálogo completo:\n${CATALOGO}` }
});
}

// PEDIDOS
export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEMS", data: {} });
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "Decime qué querés pedir 😊" }
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
body: { text: `Confirmar:\n${s.data.items}\nCliente: ${s.data.nombre}` },
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
text: { body: "✅ Pedido registrado. ¡Gracias! 👨‍🍳" }
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

// IA LIBRE
export async function replyIA(to, msg) {
const r = await iaResponder(msg);
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: r }
});
}

