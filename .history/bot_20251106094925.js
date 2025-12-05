import axios from "axios";
import dotenv from "dotenv";
import Groq from "groq-sdk";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL;
const WEB = process.env.WEB_URL;
const IG = process.env.INSTAGRAM_URL;
const CATALOGO = process.env.CATALOG_URL;
const SALES = process.env.SALES_NUMBER;

export const sessions = new Map();

async function api(data) {
return axios.post(`${API}/${PHONE_ID}/messages`, data, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// ---- IA RESPUESTA ----
async function respuestaIA(texto) {
const r = await groq.chat.completions.create({
model: "llama3-8b-8192",
messages: [
{
role: "system",
content: `Sos el asistente oficial de Nuevo Munich. Respondé cálido, claro y profesional. NO des precios. Ayudá a elegir productos.`
},
{ role: "user", content: texto }
]
});
return r.choices[0].message.content;
}

// ---- MENÚ PRINCIPAL ----
export async function sendMenuPrincipal(to) {
return api({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: { text: `*Nuevo Munich*\nArtesanos del sabor desde 1972.` },
footer: { text: `🌐 ${WEB} | 📸 ${IG} | 📦 Catálogo` },
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PICADAS", title: "Picadas" } },
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
]
}
}
});
}

// ---- PRODUCTOS ----
export async function sendProductosMenu(to) {
return api({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Productos Artesanales" },
body: { text: "Elegí una categoría:" },
action: {
button: "Ver categorías",
sections: [
{
title: "Seleccioná una opción",
rows: [
{ id: "P_PICADAS", title: "Picadas & Tablas" },
{ id: "P_SALCHICHAS", title: "Salchichas Alemanas" },
{ id: "P_GRILL", title: "Parrilla / Grill" }
]
}
]
}
}
});
}

// ---- DETALLES DE CATEGORÍA ----
export async function sendCategoria(to, id) {
const textos = {
P_PICADAS: "🥓 Picadas artesanales listas para compartir.\nNo se vende suelto, siempre piezas enteras / fraccionadas cerradas.\n\nCatálogo:\n" + CATALOGO,
P_SALCHICHAS: "🌭 Salchichas alemanas clásicas.\nViena, Frankfurt, Húngara, Knackwurst.\n\nCatálogo:\n" + CATALOGO,
P_GRILL: "🔥 Parrilla & grill ahumado estilo europeo.\nKassler, Rosca Polaca y más.\n\nCatálogo:\n" + CATALOGO
};

return api({
messaging_product: "whatsapp",
to,
text: { body: textos[id] }
});
}

// ---- PEDIDO ----
export async function iniciarPedido(user) {
sessions.set(user, { paso: "ITEMS", data: {} });
return api({
messaging_product: "whatsapp",
to: user,
text: { body: "Decime qué querés pedir (ej: 1 rosca + 2 viena grandes)." }
});
}

export async function flujoPedido(user, msg) {
const s = sessions.get(user);
if (!s) return;

if (s.paso === "ITEMS") {
s.data.items = msg;
s.paso = "NOMBRE";
return api({ messaging_product: "whatsapp", to: user, text: { body: "¿A nombre de quién es el pedido?" } });
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
s.paso = "CONFIRM";
return api({
messaging_product: "whatsapp",
to: user,
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
await api({ messaging_product: "whatsapp", to: SALES, text: { body: `📦 NUEVO PEDIDO:\n${JSON.stringify(s.data, null, 2)}` } });
await api({ messaging_product: "whatsapp", to: user, text: { body: "✅ Pedido enviado. Te escribimos enseguida." } });
} else {
await api({ messaging_product: "whatsapp", to: user, text: { body: "❌ Pedido cancelado." } });
}
return sessions.delete(user);
}
}

// ---- IA fallback cuando el usuario escribe texto libre ----
export async function responderIA(to, texto) {
const r = await respuestaIA(texto);
await api({ messaging_product: "whatsapp", to, text: { body: r } });
}

