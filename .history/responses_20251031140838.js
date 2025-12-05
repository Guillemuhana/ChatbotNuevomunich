import { sendText, sendImage, sendButtons } from "./bot.js";

// Logo hosteado (no se cae y no pierde calidad)
const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export async function handleIncoming(from, text) {

// Normalizamos texto
text = text.toLowerCase();

// ========= MENSAJES QUE ACTIVAN EL MENÚ =========
if (
text.includes("hola") ||
text.includes("buen") ||
text.includes("menu") ||
text.includes("inicio") ||
text.includes("volver") ||
text.includes("empezar")
) {

// 1) Logo
await sendImage(from, LOGO_URL);

// 2) Pausa para que el logo se procese antes del menú
await new Promise((r) => setTimeout(r, 900));

// 3) Menú principal (3 botones máximo)
await sendButtons(
from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
"Productos",
"Eventos",
"Contacto"
);

return;
}

// ========= BOTÓN 1 — PRODUCTOS =========
if (text.includes("productos")) {
return sendButtons(
from,
"Elegí una categoría 👇",
"Feteados",
"Arrollados",
"Jamones"
);
}

// --- CATEGORÍA FETEADOS ---
if (text.includes("feteados")) {
return sendText(
from,
"🥩 *FETEADOS DISPONIBLES*\n\n• Bondiola\n• Arrollado de Pollo\n• Jamón Cocido\n\nEscribime el nombre para ver la imagen 👇"
);
}

// BONDIOLA
if (text.includes("bondiola")) {
return sendImage(
from,
"https://i.postimg.cc/4NfxCw7f/bondiola.jpg",
"🥩 *Bondiola Feteada*\nIdeal para picadas y sándwiches."
);
}

// ARROLLADO
if (text.includes("arrollado")) {
return sendImage(
from,
"https://i.postimg.cc/52GKYRtZ/Arrollado-de-Pollo.jpg",
"🐔 *Arrollado de Pollo Feteado*\nSuave, sabroso y artesanal."
);
}

// JAMÓN COCIDO
if (text.includes("jamon") || text.includes("jamón")) {
return sendImage(
from,
"https://i.postimg.cc/Zq96rc5W/jamon.jpg",
"🍖 *Jamón Cocido Artesanal*\nSabor tradicional, calidad Premium."
);
}

// ========= BOTÓN 2 — EVENTOS =========
if (text.includes("eventos")) {
return sendText(
from,
"🎉 *EVENTOS & DEGUSTACIONES*\n\nRealizamos presencia en ferias, degustaciones y eventos gastronómicos.\n\nConsultanos fecha y disponibilidad."
);
}

// ========= BOTÓN 3 — CONTACTO =========
if (text.includes("contacto") || text.includes("ventas")) {
return sendText(
from,
"📞 *Ventas y Atención Personalizada*\n\nWhatsApp: *3517010545*\nCorreo: *ventas@nuevomunich.com.ar*\n\nEstamos para ayudarte 😊"
);
}

// ========= RESPUESTA POR DEFECTO =========
return sendText(
from,
"No entendí 🤔\nEscribí *hola* para ver el menú nuevamente."
);
}

