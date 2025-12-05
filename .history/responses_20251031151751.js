import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// Máximo 3 botones (regla de WhatsApp)
const MAIN_BTNS = [
{ id: "productos", title: "🛒 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "pedido", title: "📝 Hacer Pedido" }
];

async function welcome(from) {
// 1) Logo
await sendImage(from, LOGO, "");

// 2) Botones
await new Promise(r => setTimeout(r, 300));
await sendButtons(from, "Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?", MAIN_BTNS);

// 3) Contacto (después de los botones)
await new Promise(r => setTimeout(r, 200));
await sendText(from, "📞 3517010545 • 🌐 https://nuevomunich.com.ar/");
}

// Palabras que disparan el menú
const WELCOME_WORDS = new Set([
"hola","ola","holaa","hello","buenas","menu","inicio","empezar","start"
]);

export default async function respond(from, intent) {
// Si no hay texto o coincide con “hola” (en cualquier forma) → menú
if (!intent || WELCOME_WORDS.has(intent)) {
return welcome(from);
}

// Productos
if (intent.includes("producto")) {
return sendText(
from,
"📦 *Categorías disponibles:*\n\n• Feteados\n• Salames\n• Quesos\n\nEscribí la categoría 👇"
);
}

// Eventos
if (intent.includes("evento")) {
return sendText(
from,
"🎉 Participamos en eventos gastronómicos y degustaciones.\nConsultanos disponibilidad."
);
}

// Pedido (demo)
if (intent.includes("pedido")) {
return sendText(
from,
"📝 Próximamente vas a poder hacer tu pedido desde acá ✅\n\nEscribí *hola* para volver al menú."
);
}

// Default
return sendText(from, "No entendí 🤔\nEscribí *hola* para volver al menú.");
}
