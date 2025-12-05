import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// Botones principales
const MAIN_BUTTONS = ["🛒 Productos", "🎉 Eventos", "📝 Hacer pedido"];

async function welcome(from) {
await sendImage(from, LOGO, "");
await new Promise(r => setTimeout(r, 300));

await sendButtons(
from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
MAIN_BUTTONS
);

await new Promise(r => setTimeout(r, 200));

await sendText(from, "📞 3517010545 • 🌐 https://nuevomunich.com.ar/");
}

export default async function respond(from, intent) {
console.log("👉 INTENT RECIBIDO:", intent);

// 🎯 BOTON: Productos
if (intent === "opt_1" || intent.includes("producto")) {
return sendText(
from,
"📦 *Categorías disponibles:*\n\n• Feteados\n• Salames\n• Quesos\n\nEscribí la categoría que te interesa 👇"
);
}

// 🎯 BOTON: Eventos
if (intent === "opt_2" || intent.includes("evento")) {
return sendText(
from,
"🎉 Participamos en eventos gastronómicos y degustaciones.\nConsultanos disponibilidad."
);
}

// 🎯 BOTON: Hacer pedido
if (intent === "opt_3" || intent.includes("pedido")) {
return sendText(
from,
"📝 Próximamente vas a poder realizar tu pedido desde acá.\n\nPor ahora escribí *hola* para volver al menú."
);
}

// ✅ Bienvenida universal (hola, ola, menú, inicio, etc.)
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

// ❓ Default
return sendText(from, "No entendí 🤔\nEscribí *hola* para volver al menú.");
}
