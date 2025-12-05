import { sendText, sendImage, sendButtons, sendDocument } from "./bot.js";
import { productos, sinonimos } from "./productos.js";
import Groq from "groq-sdk";

// === IA ===
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// === LOGO + CATÁLOGO ===
const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const CATALOGO_URL = "https://nuevomunich.com.ar/wp-content/uploads/2024/04/Catalogo-Productos-Nuevo-Munich.pdf";

export async function handleIncoming(from, text) {
text = text.toLowerCase().trim();
console.log("📩 Mensaje recibido:", text);

// ============ MENÚ INICIAL ============
if (["hola", "buenas", "menu", "inicio"].some(w => text.includes(w))) {

await sendImage(from, LOGO_URL, "");

await new Promise(r => setTimeout(r, 700));

return sendButtons(
from,
"*Bienvenido a Nuevo Munich* 🍺\n_Artesanos del Sabor desde 1972._\n\n*¿En qué podemos ayudarte?* 👇",
[
{ id: "productos", title: "🧾 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "zonas", title: "🚚 Zonas de Reparto" },
{ id: "provincias", title: "🇦🇷 Provincias" },
{ id: "catalogo", title: "📎 Ver Catálogo" },
{ id: "pedido", title: "🛒 Hacer Pedido" }
]
);
}

// ========= BOTONES ==========
if (text === "productos") {
return sendText(from,
"📦 *Categorías*\n\n• Feteados\n• Salames\n• Ahumados\n• Quesos\n\n*Decime el nombre del producto*, ejemplo:\n> bondiola\n> panceta\n> jamón cocido");
}

if (text === "eventos") {
return sendText(from, "🎉 Hacemos eventos, ferias y degustaciones. ¿Querés que te asesoremos?");
}

if (text === "zonas") {
return sendText(from, "🚚 Reparto en Córdoba Capital y alrededores.\nDecime tu barrio y te confirmo.");
}

if (text === "provincias") {
return sendText(from, "🇦🇷 Envíos refrigerados a todo el país.");
}

if (text === "pedido") {
return sendText(from,
"📝 *Hacer Pedido*\n\nDecime en 1 solo mensaje:\n\nNombre y Apellido\nProducto(s)\nBarrio\n\n📲 Lo confirmamos por acá.");
}

if (text.includes("catalogo") || text.includes("catálogo")) {
return sendDocument(from, CATALOGO_URL, "Catalogo-Nuevo-Munich.pdf");
}

// ======== RECONOCER PRODUCTOS DIRECTOS =========
let producto = productos[text];

// ======== RECONOCER SINÓNIMOS =========
if (!producto && sinonimos[text]) {
producto = productos[sinonimos[text]];
}

// ======== RESPUESTA DE PRODUCTO =========
if (producto) {
return sendImage(from, producto.img, producto.texto);
}

// ======== IA SI NO ENTIENDE =========
try {
const completion = await groq.chat.completions.create({
model: "mixtral-8x7b-32768",
messages: [
{ role: "system", content: "Sos un asistente amable de una fábrica de fiambres y picadas artesanales." },
{ role: "user", content: text }
]
});

const respuestaIA = completion.choices[0].message.content;
return sendText(from, respuestaIA);

} catch (err) {
console.log("IA ERROR:", err);
return sendText(from, "No te entendí 🤔\nDecime *hola* para ver el menú.");
}
}
