import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const LOGO_URL = process.env.LOGO_URL;
const WEB_URL = process.env.WEB_URL;
const INSTAGRAM_URL = process.env.INSTAGRAM_URL;
const CATALOGO_URL = process.env.CATALOGO_URL;

// ============================
// FUNCION BASE PARA ENVIAR MENSAJES
// ============================
async function sendMessage(to, data) {
try {
await axios.post(
`https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
...data,
},
{
headers: {
Authorization: `Bearer ${WHATSAPP_TOKEN}`,
"Content-Type": "application/json",
},
}
);
} catch (error) {
console.log("❌ Error al enviar mensaje:", error.response?.data || error);
}
}

// ============================
// MENSAJE DE BIENVENIDA
// ============================
export async function sendWelcome(to) {
await sendMessage(to, {
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: LOGO_URL }
},
body: {
text: `🍺 *Bienvenido a Nuevo Munich*\nTradición Alemana desde 1972.\n\n¿Qué te gustaría ver?`
},
footer: { text: "Córdoba Capital 🇦🇷" },
action: {
buttons: [
{ type: "reply", reply: { id: "catalogo", title: "📦 Catálogo" } },
{ type: "reply", reply: { id: "picadas", title: "🥨 Picadas" } },
{ type: "reply", reply: { id: "contacto", title: "📞 Contacto" } }
]
}
}
});
}

// ============================
// CATÁLOGO
// ============================
export async function sendCatalogo(to) {
await sendMessage(to, {
type: "text",
text: { body: `📦 *Catálogo Completo*\n${CATALOGO_URL}` }
});
}

// ============================
// INFO PICADAS
// ============================
export async function sendPicadasInfo(to) {
await sendMessage(to, {
type: "text",
text: { body: `🥨 Perfecto! Decime para cuántas personas querés la picada:` }
});
}

// ============================
// PICADA SEGÚN PERSONAS
// ============================
export async function sendPicadaPorPersonas(to, personas) {
const precio = personas * 2500;
await sendMessage(to, {
type: "text",
text: {
body: `🥨 Picada recomendada para *${personas} personas*:\n\n• Variedad de fiambres\ n• Pan casero\n• Salsas\n\n💵 Precio aprox: $${precio}\n\nSi querés, te paso stock para hoy.`
}
});
}

// ============================
// CONTACTO
// ============================
export async function sendContacto(to) {
await sendMessage(to, {
type: "text",
text: {
body: `📞 Teléfono: 351-5555555\n📍 Estamos en Córdoba Capital.\nInstagram: ${INSTAGRAM_URL}\nWeb: ${WEB_URL}`
}
});
}

