import { sendText, sendImage, sendButtons, sendDocument } from "./bot.js";
import { feteados, sinonimos } from "./productos.js";

const CATALOGO_URL = "https://nuevomunich.com.ar/wp-content/uploads/2024/04/Catalogo-Productos-Nuevo-Munich.pdf";

export async function handleIncoming(from, text) {
text = text.toLowerCase();

// MENÚ PRINCIPAL
if (["hola", "menu", "inicio", "buenas"].includes(text)) {
return sendButtons(from,
"*Bienvenido a Nuevo Munich* 🍺\n_Artesanos del sabor desde 1972._\n\nElegí una opción:",
[
{ id: "feteados", title: "🥩 Feteados" },
{ id: "catalogo", title: "📄 Ver Catálogo" },
{ id: "pedido", title: "🛒 Hacer Pedido" }
]
);
}

// CATEGORÍA FETEADOS
if (text.includes("feteados")) {
return sendText(from, "🥩 *Feteados disponibles:*\n\n• Bondiola\n• Jamón Cocido\n• Lomo de Cerdo\n\nEscribí el nombre del producto para ver la imagen.");
}

// RESPUESTA AUTOMÁTICA CON IMAGEN
let clave = text;
if (sinonimos[clave]) clave = sinonimos[clave];

if (feteados[clave]) {
return sendImage(from, feteados[clave].img, feteados[clave].texto);
}

// CATÁLOGO PDF
if (text.includes("catalogo")) {
return sendDocument(from, CATALOGO_URL, "Catalogo-Nuevo-Munich.pdf");
}

// PEDIDO
if (text.includes("pedido")) {
return sendText(from, "📝 Decime qué te gustaría pedir y lo armamos.");
}

return sendText(from, "No entendí 🤔\nEscribí *hola* para ver el menú.");
}
