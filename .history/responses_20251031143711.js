import { sendText, sendImage, sendButtons } from "./bot.js";
import catalog from "./catalog.json" assert { type: "json" };

// LOGO hosteado (no modificar)
const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// Formulario de pedidos (solo mostrar)
const FORM_URL = "https://forms.gle/Ng3jkzM4b7X8ZCzw9";

export async function handleIncoming(text, from) {
text = text.toLowerCase().trim();

// ============ BIENVENIDA ============
if (["hola", "buenas", "menu", "inicio", "volver"].some(w => text.includes(w))) {

// 1) Enviar logo
await sendImage(from, LOGO_URL, "");

// 2) Espera pequeña para que WhatsApp no “trague” botones
await new Promise(res => setTimeout(res, 700));

// 3) Menú principal
return sendButtons(
from,
"🍽️ *Artesanos del Sabor desde 1972*\n¿Qué necesitás?",
[
{ id: "productos", title: "🧾 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "reparto", title: "🚚 Zonas de Reparto" },
{ id: "provincias", title: "🇦🇷 Provincias" },
{ id: "pedido", title: "🛒 Hacer Pedido" }
]
);
}

// ============ BOTONES DEL MENÚ ============

if (text.includes("productos") || text === "🧾 productos") {
return sendText(
from,
"📦 *Categorías disponibles:*\n\n" +
catalog.categories.map(c => "• " + c.title).join("\n") +
"\n\nDecime el nombre de la categoría 👇\nPor ejemplo: *Feteados*"
);
}

if (text.includes("eventos")) {
return sendText(from, "🎉 Participamos en ferias gastronómicas, degustaciones y eventos corporativos.\nConsultanos disponibilidad.");
}

if (text.includes("reparto") || text.includes("zona")) {
return sendText(from, "🚚 Repartimos en Córdoba Capital y alrededores.\nDecime tu barrio y te confirmo 👇");
}

if (text.includes("provincia") || text.includes("envio")) {
return sendText(from, "🇦🇷 Realizamos envíos a todo el país con cadena de frío garantizada.");
}

if (text.includes("pedido") || text.includes("comprar") || text.includes("orden")) {
return sendText(
from,
`🧾 *Formulario de Pedido*\nCompletalo aquí:\n${FORM_URL}\n\nTe respondemos por WhatsApp 📲`
);
}

// ============ DETECCIÓN DE CATEGORÍA (ej: feteados) ============
const category = catalog.categories.find(c =>
text.includes(c.slug) || text.includes(c.title.toLowerCase())
);

if (category) {
return sendText(
from,
`${category.title}\n\n${category.description}\n\n` +
"Productos disponibles:\n" +
category.products.map(p => `• ${p.name}`).join("\n") +
"\n\nEscribí el *nombre exacto* del producto 👇"
);
}

// ============ DETECCIÓN DE PRODUCTO ============
for (const cat of catalog.categories) {
for (const product of cat.products) {
if (product.keywords.some(k => text.includes(k))) {

return sendImage(
from,
product.image || LOGO_URL,
`🥩 *${product.name}*\n${product.desc}\n\n` +
`🔹 Ingredientes: ${product.ingredients}\n` +
`🔹 Sugerencias: ${product.suggestions}\n\n` +
`Para pedir → escribí *pedido*`
);
}
}
}

// ============ MENSAJE POR DEFECTO ============
return sendText(
from,
"No entendí bien 🤔\nProbá escribir *hola* para volver al menú."
);
}

