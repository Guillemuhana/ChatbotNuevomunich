import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// ✅ Enviar texto común
export async function sendText(to, text) {
try {
await axios.post(
`https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
text: { body: text }
},
{
headers: {
Authorization: `Bearer ${WHATSAPP_TOKEN}`,
"Content-Type": "application/json"
}
}
);
} catch (error) {
console.error("❌ Error enviando texto:", error.response?.data || error);
}
}

// ✅ Enviar MENÚ CON BOTONES (formato correcto WhatsApp Cloud)
export async function sendButtons(to) {
try {
await axios.post(
`https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text: "🍺 *Bienvenido a Nuevo Munich* \n\n¿Qué te gustaría ver?"
},
footer: {
text: "Desde 1972 — Tradición Alemana en Fiambres"
},
action: {
buttons: [
{
type: "reply",
reply: {
id: "ver_catalogo",
title: "📦 Catálogo"
}
},
{
type: "reply",
reply: {
id: "ver_picadas",
title: "🥨 Picadas"
}
},
{
type: "reply",
reply: {
id: "contacto",
title: "📞 Contacto"
}
}
]
}
}
},
{
headers: {
Authorization: `Bearer ${WHATSAPP_TOKEN}`,
"Content-Type": "application/json"
}
}
);

} catch (error) {
console.error("❌ Error enviando botones:", error.response?.data || error);
}
}

