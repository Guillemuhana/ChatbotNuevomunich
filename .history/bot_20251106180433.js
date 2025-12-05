import axios from "axios";
import dotenv from "dotenv";
import Groq from "groq-sdk";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const LOGO = process.env.LOGO_URL;

// IA
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function iaResponder(texto) {
try {
const r = await groq.chat.completions.create({
model: "llama-3.1-70b-versatile",
messages: [
{
role: "system",
content: "Sos el asistente gourmet de Nuevo Munich. Tono amable, cálido y experto."
},
{ role: "user", content: texto }
]
});
return r.choices[0].message.content;
} catch {
return "¿Podrías repetir? 😊";
}
}

// Enviar mensaje
export async function sendMessage(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// Menú principal
export async function sendMenuPrincipal(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: { text: "*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:" },
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
]
}
}
});
}

// Catálogo
const CATALOGO = {
P_FETEADOS: {
titulo: "🥓 *Feteados Artesanales*",
productos: [
{ nombre: "Bondiola", desc: "Curada lentamente con ahumado suave." },
{ nombre: "Jamón Cocido", desc: "Suave y clásico para picadas." },
{ nombre: "Panceta Ahumada", desc: "Aromática y sabrosa." },
{ nombre: "Arrollados", desc: "Criollo y Pollo, suaves y especiados." },
{ nombre: "Lomo de Cerdo", desc: "Ahumado delicado, ideal para tabla." }
]
},
P_SALAMES: {
titulo: "🍷 *Salames y Embutidos*",
productos: [
{ nombre: "Alpino", desc: "Ahumado, intenso, picado grueso." },
{ nombre: "Colonia", desc: "Clásico, suave y equilibrado." },
{ nombre: "Holstein", desc: "Ahumado, picado fino." }
]
},
P_ALEMANAS: {
titulo: "🌭 *Línea Alemana*",
productos: [
{ nombre: "Viena", desc: "Tradicional, suave y equilibrada." },
{ nombre: "Frankfurt", desc: "Sabor alemán auténtico." },
{ nombre: "Húngara", desc: "Notas especiadas, toque picante." },
{ nombre: "Knackwurst", desc: "Jugosa, piel crujiente." },
{ nombre: "Rosca Polaca", desc: "Para grill o picada." }
]
},
P_ESPECIALIDADES: {
titulo: "🔥 *Especialidades Ahumadas*",
productos: [
{ nombre: "Kassler", desc: "Costeleta ahumada lista para hornear." },
{ nombre: "Leberkase", desc: "Clásico alemán para servir caliente." },
{ nombre: "Cracovia", desc: "Textura suave y aromática." }
]
}
};

// Menú productos
export async function sendProductosMenu(to) {
await sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría 👇" },
action: {
buttons: [
{ type: "reply", reply: { id: "P_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "P_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "P_ALEMANAS", title: "Alemanas" } }
]
}
}
});

return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Más categorías 👇" },
action: {
buttons: [
{ type: "reply", reply: { id: "P_ESPECIALIDADES", title: "Especialidades" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
]
}
}
});
}

// Detalle categoría
export async function sendCategoriaDetalle(to, id) {
const cat = CATALOGO[id];
let txt = `${cat.titulo}\n\n`;
cat.productos.forEach(p => txt += `• *${p.nombre}*\n${p.desc}\n\n`);
return sendMessage({ messaging_product: "whatsapp", to, text: { body: txt.trim() }});
}

// Pedido
export const sessions = new Map();

export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEMS", data: {} });
return sendMessage({ messaging_product: "whatsapp", to, text: { body: "Decime qué querés pedir 😊" }});
}

export async function flujoPedido(to, msg) {
const s = sessions.get(to);
if (!s) return;

if (s.paso === "ITEMS") {
s.data.items = msg;
s.paso = "NOMBRE";
return sendMessage({ messaging_product: "whatsapp", to, text: { body: "¿A nombre de quién lo registro?" }});
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
s.paso = "FIN";
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: `✅ Pedido anotado.\n${s.data.items}\nA nombre de: ${s.data.nombre}\n\n¡Gracias! 👨‍🍳` }
});
}
}

export async function replyIA(to, msg) {
const r = await iaResponder(msg);
return sendMessage({ messaging_product: "whatsapp", to, text: { body: r }});
}

