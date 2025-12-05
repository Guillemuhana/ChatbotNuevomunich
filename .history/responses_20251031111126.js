import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export async function handleIncoming(from, text) {

// MENÚ PRINCIPAL
if (text.includes("hola") || text.includes("inicio") || text.includes("menu")) {

await sendImage(from, LOGO, "");

await new Promise(r => setTimeout(r, 900));

return sendButtons(from, "Artesanos del Sabor desde 1972.\n¿Qué necesitás?", [
"Productos",
"Eventos",
"Zonas de reparto",
"Provincias",
"Contacto"
]);
}

if (text.includes("productos")) {
return sendText(from, "📦 *Categorías:* Feteados / Arrollados / Jamones / Salames");
}

if (text.includes("eventos")) {
return sendText(from, "🎉 Hacemos presencia en eventos con degustaciones 🍷🧀");
}

if (text.includes("zonas")) {
return sendText(from, "🚚 Córdoba Capital y alrededores. Decime tu barrio 👇");
}

if (text.includes("provincias")) {
return sendText(from, "🇦🇷 Envíos a todo el país con logística refrigerada ❄️");
}

if (text.includes("contacto")) {
return sendText(from, "📞 3517010545\n✉️ ventas@nuevomunich.com.ar");
}

// Productos individuales
if (text.includes("bondiola")) {
return sendImage(from, "https://i.postimg.cc/4NfxCw7f/bondiola.jpg", "🥩 Bondiola Feteada");
}

if (text.includes("arrollado")) {
return sendImage(from, "https://i.postimg.cc/52GKYRtZ/Arrollado-de-Pollo.jpg", "🐔 Arrollado de Pollo Feteado");
}

return sendText(from, "No entendí 🤔 escribí *hola* para ver el menú");
}
