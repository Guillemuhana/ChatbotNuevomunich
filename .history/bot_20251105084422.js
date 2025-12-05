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
const SALES = "5493515931673"; // ← Número que recibe los pedidos

export const sessions = new Map();

// ---- FUNCIONES BASE ----
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

async function sendInteractive(to, data) {
return axios.post(
`${API}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: data
},
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

// ---- MENÚ PRINCIPAL ----
export async function sendMenuPrincipal(to) {
await sendInteractive(to, {
type: "button",
header: {
type: "image",
image: { link: LOGO }
},
body: { text: "*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:" },
footer: { text: `🌐 ${WEB} | 📸 ${IG}` },
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Ver Productos" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
]
}
});
}

// ---- MENÚ DE PRODUCTOS ----
export async function sendProductosMenu(to) {
await sendInteractive(to, {
type: "button",
body: { text: "Seleccioná una categoría:" },
action: {
buttons: [
{ type: "reply", reply: { id: "P_PICADAS", title: "Picadas" } },
{ type: "reply", reply: { id: "P_SALCHICHAS", title: "Salchichas Alemanas" } },
{ type: "reply", reply: { id: "P_GRILL", title: "Parrilla / Grill" } }
]
}
});
}

// ---- DETALLE DE CATEGORÍA ----
export async function sendCategoria(to, type) {
let text = "";

if (type === "P_PICADAS")
text = "🥓 *Picadas y Tablas*\n- Selección artesanal de fiambres y pan casero.\n\nCatálogo:\n" + CATALOGO;

if (type === "P_SALCHICHAS")
text = "🌭 *Salchichas Alemanas*\nViena, Frankfurt, Húngara y más.\n\nCatálogo:\n" + CATALOGO;

if (type === "P_GRILL")
text = "🔥 *Grill / Parrilla*\nRosca Polaca, Kassler, estilos ahumados.\n\nCatálogo:\n" + CATALOGO;

await sendText(to, text);
}

// ---- PEDIDOS ----
export async function iniciarPedido(user) {
sessions.set(user, { paso: "ITEMS", data: {} });
await sendText(user, "Decime lo que querés (ej: 1 rosca + 2 viena).");
}

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

return sendInteractive(user, {
type: "button",
body: { text: `Confirmar pedido:\n\n${s.data.items}\nA nombre de: ${s.data.nombre}` },
action: {
buttons: [
{ type: "reply", reply: { id: "CONFIRMAR", title: "Confirmar ✅" } },
{ type: "reply", reply: { id: "CANCELAR", title: "Cancelar ❌" } }
]
}
});

case "CONFIRM":
if (msg === "CONFIRMAR") {
await sendText(SALES, `📦 NUEVO PEDIDO:\n${JSON.stringify(s.data, null, 2)}`);
await sendText(user, "✅ Pedido confirmado. Te contactamos enseguida.");
} else {
await sendText(user, "❌ Pedido cancelado.");
}
sessions.delete(user);
break;
}
}

