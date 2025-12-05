import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

/** BOTONES PRINCIPALES (máximo permitido = 3) */
const MAIN_BUTTONS = [
{ id: "productos", title: "🛒 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "pedido", title: "📝 Hacer Pedido" }
];

/** =======================================
* Enviar MENÚ de BIENVENIDA
* ======================================= */
async function sendWelcome(from) {
await sendImage(from, LOGO, "");

// Pequeña pausa para que el logo aparezca primero
await new Promise(res => setTimeout(res, 350));

await sendButtons(
from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
MAIN_BUTTONS
);

// INFO breve
await sendText(
from,
"📞 3517010545 • 🌐 https://nuevomunich.com.ar/"
);
}

/** =======================================
* Lógica de respuestas
* ======================================= */
export default async function respond(from, intent) {

// Siempre que digan algo que equivalga a "hola", mandamos menú
if (
!intent ||
["hola","ola","buenas","menu","inicio","hey","holaa","hola!","hola!!"].includes(intent)
) {
return sendWelcome(from);
}

// ====== Productos ======
if (intent === "productos" || intent.includes("productos")) {
return sendText(
from,
"📦 *Categorías disponibles:*\n\n• Feteados\n• Salames\n• Quesos\n\nEscribí la categoría 👇"
);
}

// ====== Eventos ======
if (intent === "eventos" || intent.includes("eventos")) {
return sendText(
from,
"🎉 Participamos en eventos gastronómicos y degustaciones.\nConsultanos disponibilidad."
);
}

// ====== Pedido (DEMO) ======
if (intent === "pedido" || intent.includes("pedido")) {
return sendText(
from,
"📝 Próximamente vas a poder hacer tu pedido desde acá ✅\n\nPor ahora escribí *hola* para volver al menú."
);
}

// ====== Default ======
return sendText(from, "No entendí 🤔\nEscribí *hola* para volver al menú.");
}
