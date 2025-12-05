import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export default async function respond(from, msg) {

// ========== MENÚ PRINCIPAL ==========
if (msg.includes("hola") || msg.includes("menu") || msg.includes("inicio") || msg === "") {

await sendImage(from, LOGO);

await sendButtons(
from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
[
{ id: "productos", title: "🛒 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "pedido", title: "📝 Hacer Pedido" }
]
);

return;
}

// ========== RESPUESTAS ==========
if (msg.includes("productos")) {
return sendText(from,
"📦 *Categorías disponibles:*\n\n• Feteados\n• Salames\n• Quesos\n\nDecime la categoría.");
}

if (msg.includes("eventos")) {
return sendText(from,
"🎉 Estamos presentes en eventos gastronómicos y degustaciones.\nConsultanos fechas disponibles.");
}

if (msg.includes("pedido")) {
return sendText(from,
"📝 *Hacer Pedido*\n\nPronto vas a poder hacer tu pedido por acá ✅\nPor ahora podés escribir *hola* para volver al menú.");
}

// ========== SIN COINCIDENCIA ==========
return sendText(from, "No entendí 🤔\nEscribí *hola* para volver al menú.");
}
