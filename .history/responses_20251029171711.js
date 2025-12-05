import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = process.env;

// ========================================
// 📤 Funciones de envío
// ========================================
export async function sendText(to, body) {
await axios.post(
`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "text",
text: { body }
},
{ headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
);
}

export async function sendImage(to, imageUrl, caption = "") {
await axios.post(
`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "image",
image: { link: imageUrl, caption }
},
{ headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
);
}

// ========================================
// 🎨 Bienvenida con LOGO
// ========================================
export async function sendWelcome(to) {
await sendImage(
to,
"https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png",
"*Nuevo Munich*\nArtesanos del Sabor desde 1972."
);

await sendText(
to,
`¿Qué necesitás?\n
• Escribí *productos*
• Escribí *eventos*
• Escribí *zonas de reparto*
• Escribí *provincias*
• Escribí *otras consultas*

También podés escribir *feteados*, *catálogo* o *contacto*.`
);
}

// ========================================
// 🤖 Lógica del Chatbot
// ========================================
export async function handleIncoming(to, text) {
// Palabras que disparan la bienvenida
if (["hola", "buenas", "inicio", "menu"].includes(text)) {
return sendWelcome(to);
}

// Mostrar Lista de Feteados
if (text.includes("feteados")) {
return sendText(
to,
`🥩 *Feteados disponibles*\n
• bondiola
• arrollado de pollo
• jamón cocido
• jamón tipo bávaro
• panceta ahumada
• lomito a las finas hierbas

Escribí el *nombre exacto* para ver la imagen.`
);
}

// Mostrar imágenes individuales (ruta local más adelante hostearemos)
const feteados = {
"bondiola": "https://i.postimg.cc/HLz3H4Z4/bondiola.jpg",
"arrollado de pollo": "https://i.postimg.cc/8zZ5dxhX/Arrollado-de-Pollo.jpg",
"jamon cocido": "https://i.postimg.cc/c4Bt5v8w/S1A9455-Jamon-cocido-FETEADO.jpg",
"jamon tipo bavaro": "https://i.postimg.cc/6qKmr5xQ/S1A9464-Jamon-cocido-tipo-Bavaro-FETEADO.jpg",
"panceta ahumada": "https://i.postimg.cc/9fFQ0H4H/S1A9458-Panceta-salada-cocida-ahumada-FETEADA.jpg",
"lomito a las finas hierbas": "https://i.postimg.cc/Nfq2V2V2/S1A9451-Lomito-a-las-finas-hierbas-FETEADO.jpg"
};

if (feteados[text]) {
return sendImage(to, feteados[text], `*${text.toUpperCase()}*\nProducto artesanal Nuevo Munich 🇦🇷`);
}

// Catálogo PDF
if (text.includes("catalogo") || text.includes("catálogo")) {
return sendText(to, "📄 Catálogo completo:\nhttps://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view");
}

// Contacto
if (text.includes("contacto")) {
return sendText(to, "📞 Contacto Ventas:\n3517010545\nventas@nuevomunich.com.ar");
}

// Si no entendió…
return sendWelcome(to);
}
