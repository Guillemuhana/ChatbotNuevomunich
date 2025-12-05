import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// botón simple (máx 3)
const MAIN_BUTTONS = ["🛒 Productos", "🎉 Eventos", "📝 Hacer pedido"];

async function welcome(from) {
await sendImage(from, LOGO, "");
await new Promise(r => setTimeout(r, 300));
await sendButtons(from, "Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?", MAIN_BUTTONS);
await new Promise(r => setTimeout(r, 200));
await sendText(from, "📞 3517010545 • 🌐 https://nuevomunich.com.ar/");
}

export default async function respond(from, intent) {
// cualquier variante de hola/menu dispara menú
if (
!intent ||
intent.includes("hola") ||
intent.includes("ola") ||
intent.includes("menu") ||
intent.includes("inicio") ||
intent.includes("start")
) {
return welcome(from);
}

if (intent.includes("producto")) {
return sendText(
from,
"📦 *Categorías disponibles:*\n\n• Feteados\n• Salames\n• Quesos\n\nEscribí la categoría 👇"
);
}

if (intent.includes("evento")) {
return sendText(
from,
"🎉 Participamos en eventos gastronómicos y degustaciones.\nConsultanos disponibilidad."
);
}

if (intent.includes("pedido")) {
return sendText(from, "📝 ¡Genial! En breve vas a poder hacer tu pedido por acá.\nEscribí *hola* para volver al menú.");
}

return sendText(from, "No entendí 🤔\nEscribí *hola* para volver al menú.");
}
