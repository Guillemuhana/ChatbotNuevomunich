import { sendText, sendImage, sendButtons } from "./bot.js";

// Logo
const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export async function handleIncoming(from, text) {

text = text.toLowerCase(); // Normalizamos

// ================== BIENVENIDA ==================
if (text.includes("hola") || text.includes("menu") || text.includes("inicio") || text === "") {

await sendImage(from, LOGO_URL, "");

await new Promise(r => setTimeout(r, 1000)); // breve pausa

await sendButtons(
from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
"Productos",
"Eventos",
"Contacto"
);

return;
}

// ================== MENÚ PRINCIPAL ==================

if (text.includes("productos")) {

await sendButtons(
from,
"📦 Elegí una categoría:",
"Feteados",
"Arrollados",
"Jamones"
);
return;
}

if (text.includes("eventos")) {
return sendText(
from,
"🎉 Realizamos presencia en eventos, ferias gastronómicas y degustaciones.\n\nConsultanos fecha y disponibilidad."
);
}

if (text.includes("contacto")) {
return sendText(
from,
"📞 *Ventas y Atención*\n• WhatsApp: +54 9 351 559 0105\n• Email: ventas@nuevomunich.com.ar\n• Instagram: @nuevomunich"
);
}

// ================== CATEGORÍAS ==================

if (text.includes("feteados")) {
return sendText(
from,
"🥩 *Feteados Disponibles:*\n\n• Bondiola\n• Jamón Cocido\n• Arrollado de Pollo\n\nEscribí el nombre del producto 👇"
);
}

if (text.includes("arrollados")) {
return sendText(from, "🐔 Arrollados:\n\n• Arrollado de Pollo\n• Arrollado Primavera\n\nNombrá uno para ver la imagen 👇");
}

if (text.includes("jamones")) {
return sendText(from, "🍖 Jamones:\n\n• Jamón Cocido\n• Jamón Crudo\n\nNombrá uno para ver la imagen 👇");
}

// ================== PRODUCTOS ==================

if (text.includes("bondiola")) {
return sendImage(
from,
"https://i.postimg.cc/4NfxCw7f/bondiola.jpg",
"🥩 *Bondiola Feteada*\nIdeal para picadas y sandwiches gourmet."
);
}

if (text.includes("arrollado de pollo") || text.includes("pollo")) {
return sendImage(
from,
"https://i.postimg.cc/52GKYRtZ/Arrollado-de-Pollo.jpg",
"🐔 *Arrollado de Pollo Feteado*\nSuave, sabroso y artesanal."
);
}

if (text.includes("jamón cocido")) {
return sendImage(
from,
"https://i.postimg.cc/Z5zLznBv/jamoncocido.jpg",
"🍖 *Jamón Cocido Premium*\nCalidad artesanal desde 1972."
);
}

// ================== FALLBACK ==================
return sendText(
from,
"No entendí 😕\nProbá escribir *hola* para volver al menú."
);
}

