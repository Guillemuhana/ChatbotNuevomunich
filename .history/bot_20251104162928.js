import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const WAPI = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
const TOKEN = process.env.WHATSAPP_TOKEN;

function api() {
return {
headers: {
Authorization: `Bearer ${TOKEN}`,
"Content-Type": "application/json"
}
};
}

// ==========================
// BLOQUE DE BIENVENIDA
// ==========================
export async function sendWelcomeBlock(to) {
const body = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: process.env.LOGO_URL } },
body: { text: "Bienvenidos a *Nuevo Munich*\nArtesanos del sabor desde 1972" },
footer: { text: `🌐 ${process.env.WEB_URL}\n📸 ${process.env.INSTAGRAM_URL}` },
action: {
buttons: [
{ type: "reply", reply: { id: "PICADAS", title: "🥨 Picadas" }},
{ type: "reply", reply: { id: "PRODUCTOS", title: "🛒 Productos" }},
{ type: "reply", reply: { id: "PEDIR", title: "📝 Hacer pedido" }}
]
}
}
};

return axios.post(WAPI, body, api());
}

// ==========================
// PRODUCTOS (link catálogo)
// ==========================
export async function sendProductosMenu(to) {
return axios.post(WAPI, {
messaging_product: "whatsapp",
to,
text: { body: `🛒 Catálogo completo:\n${process.env.CATALOG_URL}` }
}, api());
}

// ==========================
// PICADAS
// ==========================
export async function sendPicadasInfo(to) {
return axios.post(WAPI, {
messaging_product: "whatsapp",
to,
text: {
body: "🥨 *PICADAS DISPONIBLES*\n\n• Para 2 personas\n• Para 4 personas\n• Para 6+ personas\n\n✅ Consultanos precios y entrega."
}
}, api());
}

// ==========================
// FLUJO DE PEDIDO SIMPLE
// ==========================
const orders = new Map();

export async function handleOrderFlow(user, text) {
if (!orders.has(user)) {
orders.set(user, {});
return axios.post(WAPI, {
messaging_product: "whatsapp",
to: user,
text: { body: "📝 Decime qué te gustaría pedir:" }
}, api());
}

const data = orders.get(user);
data.items = text;

// Enviar a ventas
await axios.post(WAPI, {
messaging_product: "whatsapp",
to: process.env.SALES_NUMBER,
text: { body: `📦 *Nuevo Pedido*\nCliente: ${user}\nPedido: ${data.items}` }
}, api());

// Confirmación al cliente
return axios.post(WAPI, {
messaging_product: "whatsapp",
to: user,
text: { body: "✅ *Pedido enviado!* Te confirmamos en breve 🙌" }
}, api());
}

