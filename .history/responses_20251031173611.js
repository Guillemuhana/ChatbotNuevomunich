import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const CONTACTO = "📞 3517010545 • 🌐 https://nuevomunich.com.ar/";

export default async function respond(to, message) {
const msg = message.toLowerCase(); // normalizamos

// ============= 👋 MENÚ PRINCIPAL =============
if (msg.includes("hola") || msg === "menu" || msg === "inicio") {
await sendImage(to, LOGO, "Nuevo Munich");
await sendText(to, "_*Artesanos del Sabor desde 1972.*_\n\n¿Qué necesitás?");
await sendButtons(to, "", [
{ id: "productos", title: "🛒 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "pedido", title: "📝 Hacer pedido" }
]);
await sendText(to, CONTACTO);
return;
}

// ============= 🛒 PRODUCTOS =============
if (msg === "productos") {
await sendText(
to,
"📦 *Productos disponibles*\n\n• Feteados\n• Salames\n• Quesos\n\n(Pronto catálogo interactivo)"
);
return;
}

// ============= 🎉 EVENTOS =============
if (msg === "eventos") {
await sendText(
to,
"🎉 Participamos en eventos gastronómicos con picadas y degustaciones.\n\nConsultanos disponibilidad."
);
return;
}

// ============= 📝 PEDIDO (MODO DEMO) =============
if (msg === "pedido") {
await sendText(
to,
"📝 *Hacer Pedido*\n\nEnviame tu pedido o consulta y te respondemos al toque 😊"
);
return;
}

// ============= ❓ DEFAULT NO ENTENDÍ =============
await sendText(to, "No entendí 🤔\nEscribí *hola* para volver al menú.");
}

