// ia.js — Nuevo Munich AI Assistant (versión compatible con Groq gratis)
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Modelo correcto para cuentas gratuitas (NO admite visión)
const MODEL = "llama-3.3-8b-instant";

/* * --- Catálogo completo y guías de uso (recetas) --- */
const PRODUCTOS_INFO = `
// GUÍA DE CATEGORÍAS
- FETEADOS: Ideales para tablas y sándwiches rápidos (Bondiola, Jamones, Lomos, Panceta Ahumada).
- JAMONES Y LOMOS (PIEZAS): Jamón con Cuero, Lomo Bávaro, Jamón Tipo Asado.
- ARROLLADOS: Arrollado de Pollo, Criollo, Matambre Arrollado.
- SALAMES: Alpino (ahumado), Colonia, Holstein.
- SALCHICHAS: Frankfurt, Húngara, Knackwurst, Weisswurst, Rosca Polaca.
- ESPECIALIDADES: Kassler, Cracovia, Leberwurst, Leberkasse.
`;

const SYSTEM_GUIDELINES = `
// PERSONALIDAD Y MARCA
Hablas siempre como Nuevo Munich, Artesanos del Sabor.
Tono cálido, gourmet, profesional y amable.
Destacá las recetas centroeuropeas desde 1972 y la certificación SENASA.

// REGLAS
- No inventes productos.
- No des precios.

// PRECIOS
Si preguntan precios:
"Los precios pueden variar según presentación y peso final. ¿Qué productos te interesan y lo verificamos con ventas? 😊"

// PICADAS
Ofrecé 3 opciones con estilo sin mencionar precios:

1) Picada Clásica de Autor: Bondiola + Jamón Tipo Bávaro + Salame Tipo Colonia.
2) Picada Gourmet Ahumada: Lomo Ahumado + Jamón Tipo Asado + Salame Alpino.
3) Picada Alemana Caliente: Frankfurt Tipo + Knackwurst Tipo + Leberkasse (servir caliente con chucrut y mostaza).

Siempre cerrá con una pregunta amable.
`;

export async function procesarMensajeIA(textoUsuario, imagenBase64 = null) {
try {

// Si el usuario mandó imagen → el modelo gratis NO puede procesarla
if (imagenBase64) {
return "Por ahora no puedo reconocer imágenes 😊 pero decime qué ves o qué producto querés y te ayudo con gusto.";
}

const respuesta = await client.chat.completions.create({
model: MODEL,
temperature: 0.45,
messages: [
{ role: "system", content: SYSTEM_GUIDELINES + "\n\nCATÁLOGO:\n" + PRODUCTOS_INFO },
{ role: "user", content: textoUsuario }
]
});

const texto = respuesta?.choices?.[0]?.message?.content?.trim();

if (texto && texto.length > 0) return texto;

return "¿Buscás picadas, salchichas alemanas o querés armar un pedido?";
} catch (error) {
console.log("Error IA Nuevo Munich:", error?.response?.data || error);
return "Se me mezclaron las especias un segundo 😅 ¿Me repetís qué producto buscabas?";
}
}
