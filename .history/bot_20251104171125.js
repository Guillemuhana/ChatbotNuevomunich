// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL;
const WEB = process.env.WEB_URL;
const IG = process.env.INSTAGRAM_URL;
const CATALOGO = process.env.CATALOGO_URL;
const SALES = process.env.SALES_NUMBER;

export const sessions = new Map();

export async function sendText(to, body) {
return axios.post(
`${API}/${PHONE_ID}/messages`,
{ messaging_product: "whatsapp", to, text: { body } },
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

export async function sendImage(to, link) {
return axios.post(
`${API}/${PHONE_ID}/messages`,
{ messaging_product: "whatsapp", to, type: "image", image: { link } },
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

export async function sendButtons(to, body, buttons) {
const mapped = buttons.map(b => ({
type: "reply",
reply: { id: b.id, title: b.title }
}));

return axios.post(
`${API}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: { text: body },
footer: { text: `🌐 ${WEB} | 📸 ${IG}` },
action: { buttons: mapped }
}
},
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

export async function sendMenuPrincipal(to) {
return sendButtons(
to,
`*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:`,
[
{ id: "BTN_PICADAS", title: "Picadas" },
{ id: "BTN_PRODUCTOS", title: "Productos" },
{ id: "BTN_PEDIDO", title: "Hacer Pedido" }
]
);
}

export async function sendProductosMenu(to) {
return sendButtons(to, "Seleccioná una categoría:", [
{ id: "P_PICADAS", title: "Picadas & Tablas" },
{ id: "P_SALCHICHAS", title: "Salchichas Alemanas" },
{ id: "P_GRILL", title: "Grill / Parrilla" }
]);
}

export async function sendCategoriaDetalle(to, tipo) {
let texto = "";
if (tipo === "PICADAS")
texto = `🧀 *Picadas & Tablas*\nFiambres artesanales - No por gramo suelto.`;
else if (tipo === "P_SALCHICHAS")
texto = `🌭 *Salchichas Alemanas*\nFrankfurt · Viena · Húngara · Knackwurst · Weisswurst.`;
else if (tipo === "P_GRILL")
texto = `🔥 *Parrilla / Grill*\nKassler · Polaca · Estilo Alemán.`;

await sendText(to, texto);
await sendText(to, `📦 Catálogo completo:\n${CATALOGO}`);
}

export function iniciarPedido(user) {
sessions.set(user, { paso: "TIPO", data: {} });
return sendButtons(user, "¿Para qué es el pedido?", [
{ id: "PED_FAM", title: "Familiar" },
{ id: "PED_EVT", title: "Evento" }
]);
}

export async function flujoPedido(user, msg) {
const s = sessions.get(user);
if (!s) return iniciarPedido(user);

switch (s.paso) {
case "TIPO":
s.data.tipo = msg;
s.paso = "ITEMS";
return sendText(user, "Decime qué querés pedir:");
case "ITEMS":
s.data.items = msg;
s.paso = "NOMBRE";
return sendText(user, "¿Nombre para el pedido?");
case "NOMBRE":
s.data.nombre = msg;
await sendText(SALES, `🛒 *Nuevo Pedido*\n${JSON.stringify(s.data, null, 2)}`);
sessions.delete(user);
return sendText(user, "✅ Pedido enviado. Te van a contactar.");
}
}

