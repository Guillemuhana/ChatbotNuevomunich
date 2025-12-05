import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

/* ------------------ CATÁLOGO & GUÍAS (lo tuyo intacto) ------------------ */
const PRODUCTOS_INFO = `
// GUÍA DE CATEGORÍAS
- FETEADOS: Ideales para tablas y sándwiches rápidos (Bondiola, Jamones, Lomos, Panceta Ahumada).
- JAMONES Y LOMOS (PIEZAS): Opciones para fetear en casa o catering.
- ARROLLADOS: Opciones para tablas y platos fríos (Matambre Arrollado, Arrollado de Pollo).
- SALAMES: Para picadas y tapeos (Alpino, Colonia, Holstein).
- SALCHICHAS ALEMANAS: Frankfurt, Húngara, Knackwurst, Weisswurst, Rosca Polaca.
- ESPECIALIDADES: Kassler, Cracovia, Leberwurst, Leberkasse.

- Bondiola: Ideal para picadas y bruschettas.
- Panceta Ahumada: Tip del chef → envolver una Frankfurt y sellar a la plancha.
- Lomo Ahumado Finas Hierbas: Para platos refinados con verduras al vapor.
- Jamón Tipo Asado: Perfecto para Vitel Toné o sandwich gourmet.
- Salame Alpino: Toque ahumado exquisito, siempre queda bien en picadas.
- Frankfurt Tipo Alemana: Superpancho tradicional.
- Húngara: Parrilla o plancha + ensalada de papas.
- Knackwurst: Perfecta con chucrut.
- Kassler: Con puré de papas o manzana verde.
- Leberwurst (Paté): Para untar en tostaditas o en desayunos europeos.
`;

const SYSTEM_GUIDELINES = `
Sos el asistente oficial de **Nuevo Munich, Artesanos del Sabor**.
Tono: amable, cálido, experto en fiambres (no robótico).

Siempre destacá:
- Recetas centroeuropeas desde 1972
- Elaboración artesanal
- Certificación SENASA

NO inventes productos ni des precios exactos.

Si piden precios:
"Diferenciamos por presentación (pieza, fraccionado o pack). ¿Qué productos te interesan y lo verificamos con ventas?"

Si piden picadas:
Ofrecé estilos y combinaciones según cantidad de personas.

Cerrá SIEMPRE con una pregunta para continuar.
`;

/* ----------------------------- IA PRINCIPAL ----------------------------- */
export async function procesarMensajeIA(pregunta, imagenBase64 = null) {
try {
const prompt = `
${SYSTEM_GUIDELINES}

CATÁLOGO:
${PRODUCTOS_INFO}

Cliente: "${pregunta}"
Asistente:
`.trim();

// Modelo gratuito estable en HF
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

// ⚠️ Endpoint correcto del Router (incluye /models/)
const url = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

const resp = await axios.post(
url,
{
inputs: prompt,
parameters: {
max_new_tokens: 220,
temperature: 0.55,
return_full_text: false
}
},
{
headers: {
Authorization: `Bearer ${process.env.HF_TOKEN}`,
"Content-Type": "application/json"
},
timeout: 30000
}
);

// Manejo robusto de formatos de salida
let texto =
resp?.data?.generated_text ??
resp?.data?.[0]?.generated_text ??
resp?.data?.choices?.[0]?.text ??
resp?.data?.outputs?.[0]?.content ??
"";

texto = (typeof texto === "string" ? texto : "").trim();

if (texto && texto.length > 2) return texto;

return "Gracias por tu consulta 😊 ¿Buscás algo para picar, salchichas alemanas o querés armar un pedido personalizado?";
} catch (err) {
// Mensaje claro en consola para depurar
console.log("Error IA Nuevo Munich:", err?.response?.data || err?.message || err);
return "Se me mezclaron los embutidos 😅 ¿Podés repetir qué producto o combinación buscás?";
}