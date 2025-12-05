import { sendText, sendImage, sendButtons } from "./bot.js";
import catalog from "./catalog.json" assert { type: "json" };

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

async function respond(from, text) {
if (!text) return;
text = text.toLowerCase();

// ===== BIENVENIDA =====
if (["hola", "menu", "inicio", "buenas", "hey"].some(w => text.includes(w))) {

await sendImage(from, LOGO);
await new Promise(r => setTimeout(r, 350));

return sendButtons(
from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
["Productos", "Eventos", "Zonas de reparto", "Provincias", "Contacto"]
);
}

// ===== MENÚ PRINCIPAL =====
if (text.includes("producto")) {
return sendButtons(from, "📦 Elegí una categoría:", catalog.categories.map(c => c.title));
}

if (text.includes("evento")) {
return sendText(from, "🎉 Participamos en eventos y degustaciones. Consultanos fechas.");
}

if (text.includes("zona")) {
return sendText(from, "🚚 Reparto en Córdoba Capital.\nDecime tu barrio y te confirmo.");
}

if (text.includes("provincia") || text.includes("envío")) {
return sendText(from, "📦 Enviamos a todo el país con cadena de frío.");
}

if (text.includes("contacto") || text.includes("telefono") || text.includes("whatsapp")) {
return sendText(from,
`📞 ${catalog.contact.phone_display}\n📍 ${catalog.contact.address}\n🌐 ${catalog.contact.website}`
);
}

// ===== CATEGORÍAS =====
for (const cat of catalog.categories) {
if (text.includes(cat.slug)) {
return sendButtons(from, `*${cat.title}*\n${cat.description}`, cat.products.map(p => p.name));
}
}

// ===== PRODUCTOS =====
for (const cat of catalog.categories) {
for (const p of cat.products) {
if (p.keywords.some(k => text.includes(k))) {
return sendImage(
from,
p.image,
`*${p.name}*\n${p.desc}\n\nIngredientes: ${p.ingredients}\nIdeal para: ${p.suggestions}`
);
}
}
}

// ===== DEFAULT =====
return sendText(from, "No entendí 🤔\nEscribí *menu* para volver al inicio.");
}

export default respond;
