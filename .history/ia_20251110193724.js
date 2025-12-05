import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

// =======================================================
// ✅ CATÁLOGO COMPLETO
// (Este es el que ya veníamos usando con recetas y descripciones)
// =======================================================
const PRODUCTOS_INFO = `
- BONDIOLA: Cerdo curado y estacionado. Ideal para picadas y sándwiches.
- PANCETA AHUMADA: Perfecta para cocinar, envolver salchichas o sumar sabor.
- LOMO HORNEADO & AHUMADO: Suave, especiado, perfecto para degustación fina.
- JAMÓN TIPO ASADO: Excelente en platos fríos, vitel toné o sándwiches gourmet.
- SALAME ALPINO AHUMADO: Picado grueso, aroma exquisito, estrella de las picadas.
- SALAME TIPO COLONIA: Clásico, equilibrado en sabor y especias.
- SALCHICHA FRANKFURT: La del superpancho alemán original.
- SALCHICHA HÚNGARA: Para plancha o parrilla, con toque especiado.
- KNACKWURST: Alemana auténtica para acompañar con chucrut.
- WEISSWURST (Baviera): Blanca, suave, se cocina en agua caliente, no hervir.
- KASSLER: Costeleta de cerdo ahumada para platos calientes.
- LEBERKASSE: Pan de hígado, ideal para plancha con chucrut.
- LEBERWURST: Paté alemán suave, perfecto para untar en picadas.
- MATAMBRE ARROLLADO / POLLO / CRIOLLO: Ideal para platos fríos y cortes en tabla.
- ROSCA POLACA: Salchicha en forma de anillo, para calentar y servir en tabla.
`;

// =======================================================
// ✅ GUIA DE RESPUESTAS Y PERSONALIDAD
// =======================================================
const SYSTEM_GUIDELINES = `
Sos el asistente oficial de Nuevo Munich, Artesanos del Sabor (1972).
Tu tono es cálido, profesional, amable y gourmet.
Siempre respondé en formato claro y simple.
Nunca inventes productos, usá SOLO los del catálogo.
Si te piden precios decí:

"Los precios pueden variar según presentación y peso final. ¿Me decís qué productos te interesan y le consulto al equipo de ventas?"

Si preguntan por una picada ofrecé estas 3 opciones:

1) Picada Clásica:
Bondiola, Jamón Cocido Bávaro, Salame Colonia.
2) Picada Ahumada Gourmet:
Lomo Ahumado, Jamón Tipo Asado, Salame Alpino Ahumado.
3) Picada Alemana Caliente:
Frankfurt + Knackwurst + Leberkasse acompañadas con chucrut y mostaza.

Siempre cerrá con una pregunta para continuar.
`;

// =======================================================
// ✅ FUNCIÓN PRINCIPAL
// =======================================================
export async function procesarMensajeIA(pregunta, imagenBase64 = null) {
try {
const HF_API_URL = "https://router.huggingface.co/hf-inference/mistralai/Mistral-7B-Instruct-v0.3";

const response = await axios.post(
HF_API_URL,
{
model: "mistralai/Mistral-7B-Instruct-v0.3",
messages: [
{ role: "system", content: SYSTEM_GUIDELINES + "\n\nCATÁLOGO:\n" + PRODUCTOS_INFO },
{ role: "user", content: pregunta }
]
},
{
headers: {
Authorization: `Bearer ${process.env.HF_TOKEN}`,
"Content-Type": "application/json"
}
}
);

const texto = response.data?.choices?.[0]?.message?.content?.trim();
if (texto && texto.length > 2) return texto;

return "¿Te interesa alguna picada, salchichas calientes o querés armar un pedido personalizado?";
} catch (error) {
console.log("❌ Error IA Nuevo Munich:", error?.response?.data || error);
return "Se me mezclaron los embutidos 😅 ¿Podés repetir qué buscabas?";
}
}