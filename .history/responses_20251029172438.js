import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.TOKEN;

// ✅ Funciones para enviar mensajes por WhatsApp API
async function sendText(to, message) {
await axios.post(
"https://graph.facebook.com/v17.0/" + process.env.PHONE_NUMBER_ID + "/messages",
{
messaging_product: "whatsapp",
to,
text: { body: message },
},
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

async function sendImage(to, imageUrl, caption = "") {
await axios.post(
"https://graph.facebook.com/v17.0/" + process.env.PHONE_NUMBER_ID + "/messages",
{
messaging_product: "whatsapp",
to,
type: "image",
image: { link: imageUrl, caption },
},
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

// ✅ MENSAJE DE BIENVENIDA (logo)
async function sendWelcome(to) {
await sendImage(
to,
"https://i.postimg.cc/hPdnrTxH/logo.png",
"Nuevo Munich\nArtesanos del Sabor desde 1972."
);

await sendText(
to,
`¿Qué necesitás?\n\n• Escribí *productos*\n• Escribí *eventos*\n• Escribí *zonas de reparto*\n• Escribí *provincias*\n• Escribí *otras consultas*\n\nTambién podés escribir: *feteados*, *catálogo* o *contacto*.`
);
}

// ✅ LÓGICA PRINCIPAL
export async function handleIncoming(from, text) {

// 🟢 Bienvenida
if (["hola", "buenas", "ola", "menu", "inicio"].some(w => text.includes(w))) {
return sendWelcome(from);
}

// 🥩 Feteados (por ahora solo ejemplo)
if (text.includes("feteados")) {
return sendText(
from,
"🥩 *Feteados*\nDecime cuál producto querés y te envío foto + precio."
);
}

// 📄 Catálogo PDF
if (text.includes("catálogo") || text.includes("catalogo")) {
return sendText(from, "📄 Catálogo completo:\nhttps://tu-catalogo-subido.pdf");
}

// 📞 Contacto
if (text.includes("contacto")) {
return sendText(from, "📞 Nuestro teléfono de ventas es: *3517010545*");
}

// 🔚 Default
return sendWelcome(from);
}

