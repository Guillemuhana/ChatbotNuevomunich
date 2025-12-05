import axios from "axios";
import dotenv from "dotenv";
import { procesarMensajeIA } from "./ia.js";
dotenv.config();

// --- CONFIG ---
const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// LOGO DIRECTO ✅
const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

const WEB = "https://nuevomunich.com.ar";
const CATALOGO = "https://nuevomunich.com.ar/catalogo.pdf";

// 🧠 Sesiones de pedidos
export const sessions = new Map();

// --- Enviar mensajes ---
async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// =============================================================
// ✅ MENÚ PRINCIPAL
// =============================================================
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: { text: "*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:" },
footer: { text: WEB },
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos 🥓" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos & Catering 🍽️" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido 📝" } }
]
}
}
});
}

// =============================================================
// 🥓 MENÚ PRODUCTOS
// =============================================================
export async function sendProductosMenu(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría:" },
footer: { text: CATALOGO },
action: {
buttons: [
{ type: "reply", reply: { id: "P_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "P_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "P_SALCHICHAS", title: "Salchichas Alemanas" } }
]
}
}
});
}

// =============================================================
// 🧾 DETALLE DE CATEGORÍAS
// =============================================================
export async function sendCategoriaDetalle(to, cat) {
const textos = {
P_FETEADOS: "🥓 *Feteados Artesanales*\nBondiola, Jamón Cocido, Lomo, Panceta.\n\n📄 Catálogo:\n" + CATALOGO,
P_SALAMES: "🍷 *Salames para Picada*\nAlpino, Colonia, Holstein.\n\n📄 Catálogo:\n" + CATALOGO,
P_SALCHICHAS: "🌭 *Línea Alemana*\nViena, Frankfurt, Húngara, Knackwurst, Rosca Polaca.\n\n📄 Catálogo:\n" + CATALOGO
};

return send({
messaging_product: "whatsapp",
to,
text: { body: textos[cat] }
});
}

// =============================================================
// 📝 FLUJO DE PEDIDO
// =============================================================
export async function iniciarPedido(user) {
sessions.set(user, { paso: "ITEMS", data: {} });
return send({
messaging_product: "whatsapp",
to: user,
text: { body: "Decime qué querés pedir 😊" }
});
}

export async function flujoPedido(user, msg) {
const s = sessions.get(user);
if (!s) return;

if (s.paso === "ITEMS") {
s.data.items = msg;
s.paso = "NOMBRE";
return send({ messaging_product: "whatsapp", to: user, text: { body: "¿A nombre de quién registramos el pedido?" } });
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
s.paso = "CONFIRM";
return send({
messaging_product: "whatsapp",
to: user,
type: "interactive",
interactive: {
type: "button",
body: { text: `Confirmar pedido:\n\n📦 ${s.data.items}\n👤 A nombre de: ${s.data.nombre}` },
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
if (msg === "CONFIRMAR")
await send({ messaging_product: "whatsapp", to: user, text: { body: "✅ Pedido registrado. ¡Gracias!" } });
else
await send({ messaging_product: "whatsapp", to: user, text: { body: "❌ Pedido cancelado." } });

sessions.delete(user);
}
}

// =============================================================
// 🤖 RESPUESTA DE IA (HuggingFace funcionando)
// =============================================================
export async function replyIA(to, msg) {
const respuesta = await procesarMensajeIA(msg);
return send({ messaging_product: "whatsapp", to, text: { body: respuesta } });
}

