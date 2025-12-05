import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const WEB_URL = process.env.WEB_URL;
const INSTAGRAM_URL = process.env.INSTAGRAM_URL;
const CATALOGO_URL = process.env.CATALOGO_URL;
const LOGO_URL = process.env.LOGO_URL;

// Función para enviar mensajes a la API
async function enviarWhatsApp(data) {
await fetch(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
method: "POST",
headers: {
"Authorization": `Bearer ${TOKEN}`,
"Content-Type": "application/json"
},
body: JSON.stringify(data)
});
}

// ===============================
// ✅ MENÚ DE BIENVENIDA (con logo + 3 botones)
// ===============================
export async function sendWelcome(to) {
await enviarWhatsApp({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: LOGO_URL }
},
body: {
text: `🍺 *Bienvenido a Nuevo Munich*\nDesde 1972 — Tradición Alemana en Fiambres\n\n¿Qué te gustaría ver?`
},
footer: { text: "Córdoba Capital" },
action: {
buttons: [
{ type: "reply", reply: { id: "catalogo", title: "📦 Catálogo" }},
{ type: "reply", reply: { id: "picadas", title: "🥨 Picadas" }},
{ type: "reply", reply: { id: "contacto", title: "📞 Contacto" }}
]
}
}
});
}

// ===============================
// ✅ INFO SOBRE PICADAS
// ===============================
export async function sendPicadasInfo(to) {
await enviarWhatsApp({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body: `🥨 *Perfecto!*
Decime para cuántas personas querías la picada:

2 personas
4 personas
6 personas o más`
}
});
}

// ===============================
// ✅ PICADA SEGÚN CANTIDAD
// ===============================
export async function sendPicadaPorPersonas(to, cantidad) {
let sugerencia = "";

if (cantidad <= 2) sugerencia = "Picada chica (~300g total):\nBondiola, Salame, Jamón Cocido, Queso y aceitunas.";
if (cantidad == 4) sugerencia = "Picada mediana (~600g):\nBondiola, Salame Colonia, Jamón Tipo Bávaro, Panceta Ahumada, Queso, Olivas, Grisines.";
if (cantidad >= 5) sugerencia = "Picada grande (1kg o más):\nBondiola, Holstein, Alpino Ahumado, Jamón Asado, Lomo Horneado a las Finas Hierbas, Panceta Ahumada y Quesos.";

await enviarWhatsApp({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body: `🥨 *Recomendación para ${cantidad} personas:*\n${sugerencia}\n\n¿Querés que armemos una *cotización*?`
}
});
}

// ===============================
// ✅ CATÁLOGO / CONTACTO
// (estos se manejan desde server.js)
// ===============================
export async function sendCatalogo(to) {
await enviarWhatsApp({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `📦 *Catálogo:* ${CATALOGO_URL}` }
});
}

export async function sendContacto(to) {
await enviarWhatsApp({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `📞 Estamos en Córdoba Capital.\nInstagram: ${INSTAGRAM_URL}\nWeb: ${WEB_URL}` }
});
}
