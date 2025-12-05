import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const WEB_URL = process.env.WEB_URL;
const INSTAGRAM_URL = process.env.INSTAGRAM_URL;
const CATALOGO_URL = process.env.CATALOGO_URL;
const LOGO_URL = process.env.LOGO_URL;

// Enviar mensaje de texto
export async function sendText(to, text) {
await fetch(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
method: "POST",
headers: {
Authorization: `Bearer ${TOKEN}`,
"Content-Type": "application/json",
},
body: JSON.stringify({
messaging_product: "whatsapp",
to,
text: { body: text },
}),
});
}

// Enviar botones
export async function sendButtons(to) {
await fetch(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
method: "POST",
headers: {
Authorization: `Bearer ${TOKEN}`,
"Content-Type": "application/json",
},
body: JSON.stringify({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text: "¿Qué te gustaría ver?",
},
footer: {
text: "Nuevo Munich — Tradición Alemana en Fiambres 🍺",
},
buttons: [
{ type: "reply", reply: { id: "CATALOGO", title: "Catálogo" } },
{ type: "reply", reply: { id: "PICADAS", title: "Picadas" } },
{ type: "reply", reply: { id: "CONTACTO", title: "Contacto" } },
],
},
}),
});
}

// Respuesta a cada opción
export async function handleUserSelection(to, selection) {
switch (selection) {
case "CATALOGO":
return sendText(
to,
`📦 *Catálogo Nuevo Munich*\n${CATALOGO_URL}`
);

case "PICADAS":
return sendText(
to,
`🥨 *Perfecto!* Decime para cuántas personas pensabas la picada.\n\nEjemplos:\n• 2 personas\n• 4 personas\n• 6 personas o más`
);

case "CONTACTO":
return sendText(
to,
`📍 *Visítanos* o consultá envíos:\n\n🌐 Web: ${WEB_URL}\n📸 Instagram: ${INSTAGRAM_URL}`
);

default:
return sendText(to, "No entendí tu selección 😅. Probemos de nuevo.");
}
}

// Mensaje de bienvenida (se llama desde server.js)
export async function sendWelcome(to) {
await sendText(to, `🍺 *Bienvenido a Nuevo Munich*\nFiambres y embutidos artesanales desde 1972.`);
await sendButtons(to);
}
