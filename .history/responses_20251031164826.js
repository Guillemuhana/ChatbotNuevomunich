import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const CONTACTO = "📞 3517010545 • 🌐 https://nuevomunich.com.ar/";

export default async function respond(to, message) {
message = message.toLowerCase();

// Bienvenida
if (message.includes("hola") || message === "menu" || message === "inicio") {
await sendImage(to, LOGO);
await sendButtons(to, "Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?", [
{ id: "productos", title: "🛒 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "pedido", title: "📝 Hacer pedido" }
]);
return;
}

// Productos
if (message === "productos") {
return sendText(to, "📦 *Productos disponibles*\n\n• Feteados\n• Salames\n• Quesos\n\nDecime la categoría 👇");
}

// Eventos
if (message === "eventos") {
return sendText(to, "🎉 Participamos en eventos gastronómicos.\nConsultanos disponibilidad.");
}

// Hacer pedido
if (message === "pedido") {
return sendText(to, "📝 Para realizar pedido, enviame tu lista y domicilio.\nEstamos para ayudarte 😊");
}

// Default
return sendText(to, "No entendí 🤔\nEscribí *hola* para volver al menú.");
}
