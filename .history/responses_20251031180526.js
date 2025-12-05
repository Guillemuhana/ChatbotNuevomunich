import { sendText, sendImage, sendButtons, sendDocument } from "./bot.js";

const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const CATALOGO_URL = "https://nuevomunich.com.ar/wp-content/uploads/2024/04/Catalogo-Productos-Nuevo-Munich.pdf";

export async function handleIncoming(from, text) {
text = text.toLowerCase();

// ================== BIENVENIDA ==================
if (["hola", "buenas", "menu", "inicio"].some(w => text.includes(w))) {

// 1) Enviar logo
await sendImage(from, LOGO_URL, "");

// 2) Pausa para que no se superponga
await new Promise(r => setTimeout(r, 700));

// 3) Menú principal actualizado (con botón Catálogo)
return sendButtons(
from,
"*Bienvenido a Nuevo Munich* 🍺\n_Artesanos del Sabor desde 1972._\n\n*¿En qué podemos ayudarte?* 👇",
[
{ id: "productos", title: "🧾 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "zonas", title: "🚚 Zonas de Reparto" },
{ id: "provincias", title: "🇦🇷 Provincias" },
{ id: "catalogo", title: "📎 Ver Catálogo" }, // NUEVO ✅
{ id: "pedido", title: "🛒 Hacer Pedido" }
]
);
}

// ================== BOTONES ==================
if (text.includes("productos")) {
return sendText(from,
"📦 *Categorías de Productos*\n\n• Feteados\n• Salames\n• Ahumados\n• Quesos\n\n_Respondé con el nombre de la categoría_");
}

if (text.includes("eventos")) {
return sendText(from, "🎉 Participamos en eventos, ferias y degustaciones. Consultanos disponibilidad.");
}

if (text.includes("zonas")) {
return sendText(from, "🚚 Reparto en Córdoba Capital y alrededores.\nDecime tu barrio y te confirmo.");
}

if (text.includes("provincias")) {
return sendText(from, "🇦🇷 Envíos refrigerados a todo el país.");
}

if (text.includes("pedido")) {
return sendText(from,
"🛒 *Hacer Pedido (DEMO)*\n\nEnviá tu pedido así:\n\nNombre y Apellido\nProducto(s)\nBarrio\n\n📲 Luego lo confirmamos por este mismo chat.");
}

// ================== CATÁLOGO (NUEVO) ==================
if (text.includes("catalogo") || text.includes("catálogo")) {
return sendDocument(from, CATALOGO_URL, "📎 *Catálogo Nuevo Munich*");
}

// ================== FETEADOS (ejemplo rápido) ==================
if (text.includes("bondiola")) {
return sendImage(from,
"https://nuevomunich.com.ar/wp-content/uploads/2024/04/S1A9449-Bondiola-FETEADO.jpg",
"🥩 *Bondiola Feteada*\nIdeal para picadas y sándwiches gourmet.");
}

// ================== DEFAULT ==================
return sendText(from, "No entendí 🤔\nEscribí *hola* para volver al menú.");
}

