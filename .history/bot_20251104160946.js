import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const WAPI_BASE = "https://graph.facebook.com/v24.0"; // WhatsApp auto-upgrade
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO_URL = process.env.LOGO_URL;
const WEB_URL = process.env.WEB_URL;
const IG_URL = process.env.INSTAGRAM_URL;

function headers() {
return { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };
}

// Enviar texto simple
export async function sendText(to, body) {
return axios.post(
`${WAPI_BASE}/${PHONE_ID}/messages`,
{ messaging_product: "whatsapp", to, text: { body } },
{ headers: headers() }
);
}

// Mensaje interactivo con LOGO arriba
async function sendBlock(to, body, footer, buttons) {
return axios.post(
`${WAPI_BASE}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO_URL } },
body: { text: body },
footer: { text: footer },
action: {
buttons: buttons.map(b => ({
type: "reply",
reply: { id: b.id, title: b.title }
}))
}
}
},
{ headers: headers() }
);
}

// ✅ BLOQUE DE BIENVENIDA (CORREGIDO)
export async function sendWelcomeBlock(to) {
const body =
`Bienvenidos a *Nuevo Munich*
Artesanos del sabor desde 1972

🌐 ${WEB_URL}
📸 ${IG_URL}`;

const footer = "Elegí una opción:"; // FOOTER CORTO = SIN ERRORES ✅

return sendBlock(to, body, footer, [
{ id: "BTN_PICADAS", title: "Picadas" },
{ id: "BTN_PRODUCTOS", title: "Productos" },
{ id: "BTN_PEDIDO", title: "Hacer pedido" }
]);
}

// Manejo de mensajes
export async function handleIncomingMessage(from, text) {
console.log("📩 Mensaje recibido:", from, text);

if (!text || text.toLowerCase() === "hola" || text.toLowerCase() === "menu") {
return sendWelcomeBlock(from);
}

switch (text) {
case "BTN_PICADAS":
return sendText(from, "En un momento te paso opciones de picadas 🧀🍖");

case "BTN_PRODUCTOS":
return sendText(from, "Dime qué producto te interesa y te paso fotos 😊");

case "BTN_PEDIDO":
return sendText(
from,
"Perfecto 🙌\nDecime productos y cantidades para confirmar el pedido."
);

default:
return sendText(from, "No entendí, pero estoy para ayudarte 😊");
}
}
