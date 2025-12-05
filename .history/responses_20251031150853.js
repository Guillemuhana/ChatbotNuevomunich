import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// Tres botones (límite WhatsApp)
const MAIN_BUTTONS = [
{ id: "productos", title: "🛒 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "pedido", title: "📝 Hacer Pedido" } // demo por ahora
];

async function sendWelcome(from) {
await sendImage(from, LOGO, "");
// pequeña pausa para que el media se vea antes que los botones
await new Promise(r => setTimeout(r, 350));
await sendButtons(
from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
MAIN_BUTTONS
);
// contacto aparte (texto)
await sendText(from, "📞 3517010545 • 🌐 https://nuevomunich.com.ar/");
}

export default async function respond(from, intent) {
// Si no viene nada o es “palabras de inicio”, muestro menú sí o sí
if (!intent || ["hola", "buenas", "menu", "inicio", "hey"].includes(intent)) {
return sendWelcome(from);
}

// ===== Botón: Productos (id exacto) =====
if (intent === "productos" || intent.includes("productos")) {
return sendText(
from,
"📦 *Categorías disponibles:*\n\n• Feteados\n• Salames\n• Quesos\n\nEscribí la categoría."
);
}

// ===== Botón: Eventos (id exacto) =====
if (intent === "eventos" || intent.includes("eventos")) {
return sendText(
from,
"🎉 Participamos en eventos y degustaciones. Consultanos fechas disponibles."
);
}

// ===== Botón: Hacer Pedido (DEMO) =====
if (intent === "pedido" || intent.includes("pedido")) {
return sendText(
from,
"📝 *Hacer Pedido*\n\nPronto vas a poder hacer tu pedido desde acá ✅\nPor ahora, escribí *hola* para volver al menú."
);
}

// ===== Default =====
return sendText(from, "No entendí 🤔\nEscribí *hola* para volver al menú.");
}
