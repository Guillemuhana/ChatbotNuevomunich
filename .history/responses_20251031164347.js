import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const MAIN_BTNS = ["🛒 Productos", "🎉 Eventos", "📝 Hacer pedido"];

async function welcome(from) {
await sendImage(from, LOGO, "");
await new Promise(r => setTimeout(r, 250));
await sendButtons(from, "Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?", MAIN_BTNS);
await new Promise(r => setTimeout(r, 200));
await sendText(from, "📞 3517010545 • 🌐 https://nuevomunich.com.ar/");
}

export default async function respond(from, intent) {
// 🔎 Ver qué llega
console.log("👉 INTENT:", intent);

// === BOTONES ===
if (intent === "opt_1") {
return sendText(
from,
"📦 *Categorías:*\n\n• Feteados\n• Salames\n• Quesos\n\nEscribí la categoría que te interesa."
);
}

if (intent === "opt_2") {
return sendText(
from,
"🎉 Participamos en eventos gastronómicos y degustaciones. Consultanos disponibilidad."
);
}

if (intent === "opt_3") {
return sendText(
from,
"📝 Próximamente vas a poder hacer tu pedido desde acá.\nEscribí *hola* para volver al menú."
);
}

// === TEXTO: BIENVENIDA UNIVERSAL ===
if (
intent === "" ||
intent.includes("hola") ||
intent.includes("ola") ||
intent.includes("menu") ||
intent.includes("inicio") ||
intent.includes("start")
) {
return welcome(from);
}

// === DEFAULT ===
return sendText(from, "No entendí 🤔\nEscribí *hola* para volver al menú.");
}

