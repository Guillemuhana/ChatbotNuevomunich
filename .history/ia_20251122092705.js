// ia.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;

/* ======================================================
📚 BASE DE PRODUCTOS (NO INVENTA NADA)
====================================================== */
const PRODUCTOS_INFO = `
CATEGORÍAS Y PRODUCTOS DE NUEVO MUNICH:

🥩 FETEADOS
- Bondiola
- Jamón Cocido
- Jamón Cocido Tipo Bávaro
- Jamón Tipo Asado
- Lomo Cocido Ahumado
- Lomo Horneado & Ahumado Finas Hierbas
- Panceta Cocida Ahumada
- Arrollado de Pollo
- Arrollado Criollo

🧀 SALAMES Y AHUMADOS
- Salame Alpino
- Salame Holstein
- Salame Colonia
- Salchichón Ahumado
- Cracovia

🌭 SALCHICHAS ALEMANAS
- Frankfurt
- Viena
- Húngara
- Knackwurst
- Weisswurst
- Rosca Polaca

🍖 ESPECIALIDADES
- Kassler
- Leberkasse
- Leberwurst
`;

/* ======================================================
🤖 GUIADO IA — TONO GOURMET + VENTAS
====================================================== */
const SYSTEM_GUIDELINES = `
Eres el asistente oficial de *Nuevo Munich*, Artesanos del Sabor desde 1972.
Tu tono es cálido, gourmet, profesional y orientado a ventas.

REGLAS:
- NO inventes productos.
- NO inventes precios ni stock.
- Siempre sugerí consumo (“ideal para una picada”, “perfecto para la parrilla”).
- Si el cliente escribe algo confuso, interpretá y ayudá igual, nunca digas “no entendí”.

📌 **REGLA PRINCIPAL DE RESPUESTA A PRODUCTOS:**
Si el cliente pregunta por CUALQUIER producto, ingrediente, categoría, consulta general,
o escribe algo como “¿tienen salchichas?”, “¿hay bondiola?”, “qué venden?”, “productos”, etc:

👉 RESPONDER SIEMPRE con la lista COMPLETA de todas las categorías y productos:

${PRODUCTOS_INFO}

Y cerrá con una frase útil:
“Si querés verlos con fotos, abrí *Menú principal → Productos* 😊”.

Esta regla SIEMPRE se aplica.
`;

/* ======================================================
🧠 FUNCIÓN IA — SIEMPRE RESPONDE
====================================================== */
export async function procesarMensajeIA(pregunta) {
try {
const response = await axios.post(
"https://router.huggingface.co/v1/chat/completions",
{
model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
messages: [
{ role: "system", content: SYSTEM_GUIDELINES },
{ role: "user", content: pregunta }
],
temperature: 0.5,
max_tokens: 500
},
{
headers: {
Authorization: `Bearer ${HF_TOKEN}`,
"Content-Type": "application/json"
}
}
);

return (
response.data?.choices?.[0]?.message?.content ||
"¿Querés ver productos, eventos o hacer un pedido?"
);

} catch (error) {
console.log("❌ Error IA Nuevo Munich:", error.response?.data || error);
return "Hubo un pequeño error 😅 ¿podés repetir?";
}
}

