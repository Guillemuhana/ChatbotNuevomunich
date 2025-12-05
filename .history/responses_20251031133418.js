import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export async function handleIncoming(from, text) {

// ========== MENÚ PRINCIPAL ==========
if (!text || text.includes("hola") || text.includes("menu") || text.includes("inicio")) {

await sendImage(from, LOGO_URL);

await new Promise(r => setTimeout(r, 800));

return sendButtons(
from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
["Productos", "Eventos", "Zonas de reparto", "Provincias", "Contacto"]
);
}

// ========== RESPUESTAS ==========

if (text.includes("productos")) {
return sendText(from, "📦 *Categorías de Productos*\n\n• Feteados\n• Arrollados\n• Jamones\n• Salames\n\nDecime la categoría 👇");
}

if (text.includes("eventos")) {
return sendText(from, "🎉 Realizamos presencia en eventos gastronómicos.\nConsultanos disponibilidad.");
}

if (text.includes("zonas_de_reparto")) {
return sendText(from, "🚚 Reparto en Córdoba Capital y alrededores.\nDecime tu barrio 👇");
}

if (text.includes("provincias")) {
return sendText(from, "🇦🇷 Envíos a todo el país con logística refrigerada.");
}

if (text.includes("contacto")) {
return sendText(from, "📞 Ventas:\n*3517010545*\n✉️ ventas@nuevomunich.com.ar");
}

// ========== CATEGORÍAS ==========
if (text.includes("feteados")) {
return sendText(from, "🥩 *Feteados:* Bondiola, Arrollado de Pollo, Jamón Cocido.\n\nEscribí el nombre del producto 👇");
}

if (text.includes("bondiola")) {
return sendImage(from, "https://i.postimg.cc/4NfxCw7f/bondiola.jpg", "🥩 *Bondiola Feteada*");
}

if (text.includes("arrollado")) {
return sendImage(from, "https://i.postimg.cc/52GKYRtZ/Arrollado-de-Pollo.jpg", "🐔 *Arrollado de Pollo Feteado*");
}

// ========== MENSAJE POR DEFECTO ==========
return sendText(from, "No entendí 🤔\nEscribí *hola* para ver el menú.");
}
