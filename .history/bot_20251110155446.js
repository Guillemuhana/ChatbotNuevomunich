import axios from "axios";
import dotenv from "dotenv";
import { procesarMensajeIA } from "./ia.js";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL;
const WEB = process.env.WEB_URL;
const CATALOGO = process.env.CATALOGO_URL;

export const sessions = new Map();

async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// -------- MENÚ PRINCIPAL --------
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: { text: "*Nuevo Munich*\nArtesanos del sabor desde 1972.\n" },
footer: { text: WEB },
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

// -------- MENU PRODUCTOS --------
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

// -------- DETALLES CATEGORIAS --------
export async function sendCategoriaDetalle(to, cat) {
const textos = {
P_FETEADOS: "🥓 *Feteados Artesanales*\nBondiola, Jamón Cocido, Lomo, Panceta.\n\nCatálogo:\n" + CATALOGO,
P_SALAMES: "🍷 *Salames para Picada*\nAlpino, Colonia, Holstein.\n\nCatálogo:\n" + CATALOGO,
P_SALCHICHAS: "🌭 *Línea Alemana*\nViena, Frankfurt, Húngara, Knackwurst, Rosca Polaca.\n\nCatálogo:\n" + CATALOGO
};

return send({
messaging_product: "whatsapp",
to,
text: { body: textos[cat] }
});
}

// -------- PEDIDOS --------
export async function iniciarPedido(user) {
sessions.set(user, { paso: "ITEMS", data: {} });
return send({ messaging_product: "whatsapp", to: user, text: { body: "Decime qué querés pedir 😊" } });
}

export async function flujoPedido(user, msg) {
const s = sessions.get(user);
if (!s) return;

if (s.paso === "ITEMS") {
s.data.items = msg;
s.paso = "NOMBRE";
return send({ messaging_product: "whatsapp", to: user, text: { body: "¿A nombre de quién registramos?" } });
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
if (msg === "CONFIRMAR")
await send({ messaging_product: "whatsapp", to: user, text: { body: "✅ Pedido registrado. ¡Gracias!" } });
else
await send({ messaging_product: "whatsapp", to: user, text: { body: "Pedido cancelado ❌" } });

sessions.delete(user);
}
}

// -------- IA LIBRE --------
export async function replyIA(to, msg) {
const r = await procesarMensajeIA(msg);
return send({ messaging_product: "whatsapp", to, text: { body: r } });
}
