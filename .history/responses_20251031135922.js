import { sendText, sendImage, sendButtons } from "./bot.js";

// LOGO SUBIDO - SE MANTIENE
const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export async function handleIncoming(text, from) {

text = (text || "").trim().toLowerCase();

// ====== BIENVENIDA ======
if (text === "" || ["hola","buenas","inicio","menu","menú"].includes(text)) {

// Logo
await sendImage(from, LOGO_URL, "");

await new Promise(r => setTimeout(r, 700));

return sendButtons(
from,
"✨ *Artesanos del Sabor desde 1972*\n\nElaboramos productos con tradición centroeuropea.\n\n¿Cómo puedo ayudarte?",
["Productos", "Eventos", "Más Opciones"]
);
}

// ====== SEGUNDO MENÚ ======
if (text.includes("más opciones")) {
return sendButtons(
from,
"Elegí una opción 👇",
["Zonas de reparto", "Provincias", "Contacto"]
);
}

// ====== SECCIONES PRINCIPALES ======
if (text.includes("eventos")) {
return sendText(
from,
"🎉 *Eventos y Degustaciones*\n\nParticipamos en ferias gastronómicas, degustaciones y presentaciones.\nConsultanos para coordinar presencia o envíos especiales."
);
}

if (text.includes("zonas de reparto")) {
return sendText(
from,
"🚚 *Reparto en Córdoba Capital*\n\nDecime tu barrio y te confirmo disponibilidad."
);
}

if (text.includes("provincias")) {
return sendText(
from,
"🇦🇷 *Envíos a todo el país*\n\nMediante transporte refrigerado para mantener la cadena de frío."
);
}

if (text.includes("contacto")) {
return sendText(
from,
"🤝 *Atención Comercial*\n📞 WhatsApp Ventas: *+54 9 351 559 0105*\n✉️ ventas@nuevomunich.com.ar\n\nEstoy para ayudarte 😊"
);
}

// ====== PRODUCTOS ======
if (text.includes("productos")) {
return sendText(
from,
"📦 *Categorías de Productos*\n\n• Feteados\n• Arrollados\n• Jamones\n• Salames\n\nEscribí el nombre de la categoría 👇"
);
}

// --------- CATEGORÍA: FETEADOS ---------
if (text.includes("feteados")) {
return sendText(
from,
"🥩 *Feteados Disponibles*\n\n• Bondiola\n• Jamón Cocido\n• Arrollado de Pollo\n\nEscribime el nombre del producto."
);
}

if (text.includes("bondiola")) {
return sendImage(
from,
"https://i.postimg.cc/4NfxCw7f/bondiola.jpg",
"🥩 *Bondiola Feteada*\nSabor intenso, corte fino. Ideal para picadas."
);
}

if (text.includes("jamón cocido") || text.includes("jamon cocido")) {
return sendImage(
from,
"https://i.postimg.cc/52G2tZK0/jamon-cocido.jpg",
"🍖 *Jamón Cocido Feteado*\nSuave, equilibrado y artesanal."
);
}

if (text.includes("arrollado")) {
return sendImage(
from,
"https://i.postimg.cc/52GKYRtZ/Arrollado-de-Pollo.jpg",
"🐔 *Arrollado de Pollo Feteado*\nDelicado y sabroso."
);
}

// --------- RESPUESTA AUTOMÁTICA SI NO ENTIENDE ---------
return sendText(
from,
"No estoy seguro de eso 🤔\nProbá escribir *hola* para volver al menú."
);
}
