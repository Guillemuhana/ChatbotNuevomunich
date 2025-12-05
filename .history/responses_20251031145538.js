import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export default async function respond(from, msg) {

// MENÚ PRINCIPAL
if (msg.includes("hola") || msg.includes("menu") || msg === "" || msg.includes("inicio")) {
await sendImage(from, LOGO);

await sendButtons(from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
[
{ id: "productos", title: "🛒 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "pedido", title: "📝 Hacer Pedido" }
]
);

await sendText(from, "📞 *Contacto:* 3517010545\n🌐 https://nuevomunich.com.ar/");
return;
}

// BOTÓN - PRODUCTOS
if (msg.includes("productos")) {
return sendText(from,
"📦 *Categorías disponibles:*\n\n• Feteados\n• Salames\n• Quesos\n\nEscribí la categoría.");
}

// BOTÓN - EVENTOS
if (msg.includes("eventos")) {
return sendText(from,
"🎉 Realizamos presencia en eventos gastronómicos, degustaciones y ferias.\nConsultanos disponibilidad.");
}

// BOTÓN - HACER PEDIDO (DEMO)
if (msg.includes("pedido")) {
return sendText(from,
"📝 *Realizar Pedido*\n\nPor ahora esta función está en desarrollo.\nMuy pronto vas a poder hacer tu pedido desde acá ✅");
}

// RESPUESTA DEFAULT
return sendText(from,
"No entendí 🤔\nEscribí *hola* para volver al menú.");
}

