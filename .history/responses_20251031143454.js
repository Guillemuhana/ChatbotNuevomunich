import { sendText, sendImage, sendButtons } from "./bot.js";
import catalog from "./catalog.json" assert { type: "json" };

const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// Buscar Producto por palabra clave
function searchProduct(text) {
text = text.toLowerCase();
for (const category of catalog.categories) {
for (const product of category.products) {
if (product.keywords.some(k => text.includes(k))) {
return { category, product };
}
}
}
return null;
}

export async function handleIncoming(from, text) {
if (!text) return;
text = text.toLowerCase();

// MENÚ PRINCIPAL
if (["hola", "menu", "inicio", "volver"].includes(text)) {
await sendImage(from, LOGO_URL);
await new Promise(r => setTimeout(r, 700));

return sendButtons(
from,
"Artesanos del Sabor desde 1972.\n¿Qué necesitás?",
["Productos", "Contacto", "Hacer Pedido"]
);
}

// LISTA DE CATEGORÍAS
if (text.includes("productos")) {
let categorias = catalog.categories.map(c => `• ${c.title}`).join("\n");
return sendText(from, `📦 *Categorías:* \n\n${categorias}\n\nDecime cuál querés ver 👇`);
}

// SI ES UNA CATEGORÍA
for (const category of catalog.categories) {
if (text.includes(category.slug)) {
let lista = category.products.map(p => `• ${p.name}`).join("\n");
return sendText(from,
`${category.title}\n\n${category.description}\n\n${lista}\n\nDecime el nombre del producto 👇`
);
}
}

// BUSCAR PRODUCTO
const result = searchProduct(text);

if (result) {
const { product } = result;

await sendImage(from, product.image, `🥩 *${product.name}*`);
await new Promise(r => setTimeout(r, 500));

return sendButtons(
from,
`*${product.name}*\n${product.desc}\n\n*Ingredientes:* ${product.ingredients}\n*Ideal para:* ${product.suggestions}`,
["Hacer Pedido", "Ver más productos"]
);
}

// FORMULARIO — GOOGLE FORMS (YA MISMO CREAMOS EL LINK)
if (text.includes("hacer pedido")) {
return sendText(
from,
"📝 *Formulario de Pedido*\nCompletalo aquí 👇\n\n" +
"https://forms.gle/XXXXXXXXXXXX" // ← Ahora lo generamos
);
}

// CONTACTO
if (text.includes("contacto")) {
return sendText(
from,
`📞 *Contacto*\n${catalog.contact.phone_display}\n\n📍 ${catalog.contact.address}\n🌐 ${catalog.contact.website}\n📸 ${catalog.contact.instagram}`
);
}

// DEFAULT
return sendText(from, "No entendí 🤔\nEscribí *hola* para ver el menú.");
}
