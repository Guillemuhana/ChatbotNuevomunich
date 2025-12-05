import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// Botones permitidos (máx 3)
const MAIN_BUTTONS = [
{ id: "productos", title: "🛒 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "pedido", title: "📝 Hacer Pedido" } // demo (no hace nada por ahora)
];

async function sendWelcome(from) {
await sendImage(from, LOGO, "");
// pequeña pausa para que el cliente muestre el media antes de los botones
await new Promise(r => setTimeout(r, 400));
await sendButtons(
from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
MAIN_BUTTONS
);
// contacto como texto aparte
await sendText(from, "📞 3517010545 • 🌐 https://nuevomunich.com.ar/");
}

export default async function respond(from, intent) {
// Si el intent viene vacío, tratamos de forzar bienvenida
if (!intent) {
return sendWelcome(from);
}

// disparadores de bienvenida por texto libre
if (intent.includes("hola") || intent.includes("menu") || intent.includes("inicio")) {
return sendWelcome(from);
}

// ===== Botón: Productos (id = "productos") =====
if (intent === "productos" || intent.includes("productos")) {
return sendText(
from,
"📦 *Categorías disponibles:*\n\n• Feteados\n• Salames\n• Quesos\n\nEscribí la categoría."
);
}

// ===== Botón: Eventos (id = "eventos") =====
if (intent === "eventos" || intent.includes("eventos")) {
return sendText(
from,
"🎉 Participamos en eventos y degustaciones. Consultanos fechas disponibles."
);
}

// ===== Botón: Hacer Pedido (demo) (id = "pedido") =====
if (intent === "pedido" || intent.includes("pedido")) {
return sendText(
from,
"📝 *Hacer Pedido*\n\nPronto vas a poder hacer tu pedido desde acá ✅\nPor ahora, escribí *hola* para volver al menú."
);
}

// ===== Default =====
return sendText(from, "No entendí 🤔\nEscribí *hola* para volver al menú.");
}
