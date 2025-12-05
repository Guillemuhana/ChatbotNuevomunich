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
const CATALOGO = process.env.CATALOG_URL;

export const sessions = new Map();

/* =============================
* ENVIAR TEXTO
* ============================= */
async function sendText(to, body) {
return axios.post(
`${API}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
text: { body }
},
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

/* =============================
* ENVIAR BOTONES
* ============================= */
async function sendButtons(to, body, buttons) {
return axios.post(
`${API}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: LOGO }
},
body: { text: body },
action: { buttons }
}
},
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

/* =============================
* MENÚ PRINCIPAL
* ============================= */
export async function sendMenuPrincipal(to) {
await sendButtons(
to,
`*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:`,
[
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Ver Productos" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
]
);
}

/* =============================
* MENÚ DE PRODUCTOS
* ============================= */
export async function sendProductosMenu(to) {
await sendButtons(to, "Seleccioná una categoría:", [
{ type: "reply", reply: { id: "P_PICADAS", title: "Picadas" } },
{ type: "reply", reply: { id: "P_SALCHICHAS", title: "Salchichas Alemanas" } },
{ type: "reply", reply: { id: "P_GRILL", title: "Parrilla / Grill" } }
]);
}

/* =============================
* DETALLE CATEGORÍAS
* ============================= */
export async function sendCategoria(to, id) {
const textos = {
P_PICADAS: `🥓 *Picadas y Tablas*\nFiambres artesanales.\n\n📦 Catálogo: ${CATALOGO}`,
P_SALCHICHAS: `🌭 *Salchichas Alemanas*\nViena, Frankfurt, Húngara.\n\n📦 Catálogo: ${CATALOGO}`,
P_GRILL: `🔥 *Grill / Parrilla*\nAhumados y embutidos premium.\n\n📦 Catálogo: ${CATALOGO}`
};

await sendText(to, textos[id] || "Categoría no disponible.");
}

/* =============================
* INICIAR PEDIDO
* ============================= */
export async function iniciarPedido(user) {
sessions.set(user, { paso: "ITEMS", data: {} });
await sendText(user, "Decime lo que querés pedir:");
}

/* =============================
* FLUJO DEL PEDIDO
* ============================= */
export async function flujoPedido(user, msg) {
const s = sessions.get(user);
if (!s) return;

switch (s.paso) {
case "ITEMS":
s.data.items = msg;
s.paso = "NOMBRE";
return sendText(user, "A nombre de quién registramos el pedido?");

case "NOMBRE":
s.data.nombre = msg;
s.paso = "CONFIRM";
return sendButtons(
user,
`Confirmar pedido:\n\n${s.data.items}\nA nombre de: ${s.data.nombre}`,
[
{ type: "reply", reply: { id: "CONFIRMAR", title: "Confirmar ✅" } },
{ type: "reply", reply: { id: "CANCELAR", title: "Cancelar ❌" } }
]
);

case "CONFIRM":
if (msg === "CONFIRMAR") {
await sendText(user, "✅ Pedido confirmado. Te contactamos enseguida.");
} else {
await sendText(user, "❌ Pedido cancelado.");
}
sessions.delete(user);
break;
}
}

/* =============================
* ROUTER → ACÁ SE DEFINE EL FLUJO
* ============================= */
export async function routeMessage(entry) {
const webhook = entry.changes?.[0]?.value?.messages?.[0];
if (!webhook) return;

const from = webhook.from;
const msg = webhook.text?.body?.trim() || webhook.interactive?.button_reply?.id;

if (!msg) return;

if (msg.toLowerCase() === "hola") return sendMenuPrincipal(from);
if (msg === "BTN_PRODUCTOS") return sendProductosMenu(from);
if (msg === "BTN_PEDIDO") return iniciarPedido(from);
if (["P_PICADAS", "P_SALCHICHAS", "P_GRILL"].includes(msg)) return sendCategoria(from, msg);

if (sessions.has(from)) return flujoPedido(from, msg);
}