import { sendText, sendImage, sendButtons, sendDocument } from "./bot.js";
import { feteados, sinonimos } from "./productos.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CATALOGO_URL = "https://nuevomunich.com.ar/wp-content/uploads/2024/04/Catalogo-Productos-Nuevo-Munich.pdf";

// ====================== IA ======================
async function responderIA(mensaje) {
try {
const chat = await groq.chat.completions.create({
model: "mixtral-8x7b-32768",
messages: [
{
role: "system",
content: "Sos el asistente oficial de Nuevo Munich. Respondé amable, profesional y claro. No inventes precios. Si preguntan precios, respondé: 'Los precios pueden variar, te paso los actualizados 😊'."
},
{ role: "user", content: mensaje }
]
});

return chat.choices[0].message.content;
} catch (error) {
return "Estoy aquí para ayudarte 😊 ¿Podés repetirlo?";
}
}

// ====================== HANDLER PRINCIPAL ======================
export async function handleIncoming(from, text) {
text = text.toLowerCase();

// ======= MENÚ PRINCIPAL =======
if (["hola", "menu", "inicio", "buenas", "buenos dias", "buenas tardes"].includes(text)) {
return sendButtons(
from,
"*Bienvenido a Nuevo Munich* 🍺\n_Artesanos del sabor desde 1972._\n\nElegí una opción 👇",
[
{ id: "feteados", title: "🥩 Feteados" },
{ id: "catalogo", title: "📄 Ver Catálogo" },
{ id: "pedido", title: "🛒 Hacer Pedido" }
]
);
}

// ======= CATEGORÍA: FETEADOS =======
if (text.includes("feteados")) {
return sendText(
from,
"🥩 *FETEADOS DISPONIBLES:*\n\n• Bondiola\n• Jamón Cocido\n• Lomo de Cerdo\n\n*Escribí el nombre del producto* para ver la imagen 📸"
);
}

// ======= DETECTAR PRODUCTO A PARTIR DEL NOMBRE =======
let clave = text;
if (sinonimos[clave]) clave = sinonimos[clave];

if (feteados[clave]) {
return sendImage(from, feteados[clave].img, feteados[clave].texto);
}

// ======= CATÁLOGO PDF =======
if (text.includes("catalogo") || text.includes("catálogo")) {
return sendDocument(from, CATALOGO_URL, "Catalogo-Nuevo-Munich.pdf");
}

// ======= HACER PEDIDO =======
if (text.includes("pedido")) {
return sendText(
from,
"📝 *Para hacer tu pedido, enviame esta info:*\n\nNombre y Apellido\nProducto(s)\nBarrio\n\n📲 Te confirmo disponibilidad al instante."
);
}

// ======= SI NO ENTIENDE → IA =======
const respuesta = await responderIA(text);
return sendText(from, respuesta);
}
