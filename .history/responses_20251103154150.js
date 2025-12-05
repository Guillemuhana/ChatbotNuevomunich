import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// FUNCIÓN PRINCIPAL QUE RESPONDE MENSAJES
export async function handleIncoming(from, text) {
text = text.toLowerCase();

// SALUDO / INICIO
if (["hola", "buenas", "menu", "inicio"].some(w => text.includes(w))) {

// Enviar logo primero
await sendImage(from, LOGO_URL, "");

// Enviar menú
return sendButtons(
from,
"*Bienvenido a Nuevo Munich* 🍺\n_Artesanos del Sabor desde 1972._\n\n¿En qué podemos ayudarte?",
[
{ id: "productos", title: "🧾 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "zonas", title: "🚚 Zonas de Reparto" },
{ id: "pedido", title: "🛒 Hacer Pedido" }
]
);
}

// OPCIÓN: PRODUCTOS
if (text.includes("productos"))
return sendText(from, "📦 Podés ver nuestros productos acá:\nhttps://nuevomunich.com.ar/");

// OPCIÓN: EVENTOS
if (text.includes("eventos"))
return sendText(from, "🎉 Participamos en ferias y degustaciones.\nConsultá disponibilidad.");

// OPCIÓN: ZONAS
if (text.includes("zonas"))
return sendText(from, "🚚 Repartimos en Córdoba Capital y alrededores.");

// OPCIÓN: PEDIDO
if (["pedido", "comprar", "quiero", "precio", "hacer pedido"].some(w => text.includes(w)))
return sendText(from,
"🛒 Enviame los datos así:\n\n• Nombre y Apellido\n• Productos\n• Barrio / Zona\n\nY lo armamos ✅"
);

// DEFAULT (NO ENTENDÍ)
return sendText(from, "No entendí 🤔\nEscribí *hola* para ver el menú.");
}
