import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

/* ------------------------------------------------------------
CATÁLOGO COMPLETO + GUÍAS DE USO (NO TOCAR)
------------------------------------------------------------ */
const PRODUCTOS_INFO = `
// GUÍA DE CATEGORÍAS
- FETEADOS: Ideales para tablas y sándwiches rápidos (Bondiola, Jamones, Lomos, Panceta Ahumada).
- JAMONES Y LOMOS (PIEZAS): Opciones para fetear en casa o catering.
- ARROLLADOS: Opciones para tablas y platos fríos (Matambre Arrollado, Arrollado de Pollo).
- SALAMES: Para picadas y tapeos (Alpino, Colonia, Holstein).
- SALCHICHAS ALEMANAS: Frankfurt, Húngara, Knackwurst, Weisswurst, Rosca Polaca.
- ESPECIALIDADES: Kassler, Cracovia, Leberwurst, Leberkasse.

// DETALLE + SUGERENCIAS DE USO
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

/* ------------------------------------------------------------
PERSONALIDAD + REGLAS DEL ASISTENTE
------------------------------------------------------------ */
const SYSTEM_GUIDELINES = `
Sos el asistente oficial de **Nuevo Munich, Artesanos del Sabor**.
Tono: amable, cálido, experto en fiambres. Nunca robótico.

Siempre destacá:
- Recetas centroeuropeas desde 1972
- Elaboración artesanal
- Certificación SENASA

NO inventes productos.
NO digas precios exactos.

Si preguntan por precios:
"Diferenciamos por presentación (pieza, fraccionado o pack). ¿Qué productos te interesan y lo verificamos con ventas?"

Si preguntan por picadas:
Ofrecé estilos y combinaciones según cantidad de personas.

Cerrá SIEMPRE la respuesta con una pregunta para continuar la conversación.
`;

/* ------------------------------------------------------------
FUNCIÓN PRINCIPAL DE IA (ACTUALIZADA)
------------------------------------------------------------ */
export async function procesarMensajeIA(pregunta, imagenBase64 = null) {
try {
const prompt = `
${SYSTEM_GUIDELINES}

CATÁLOGO:
${PRODUCTOS_INFO}

Cliente: "${pregunta}"
Asistente:
`;

const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

const response = await axios.post(
`https://router.huggingface.co/hf-inference/${HF_MODEL}`,
{
inputs: prompt,
parameters: {
max_new_tokens: 200,
temperature: 0.55,
return_full_text: false
}
},
{
headers: {
Authorization: `Bearer ${process.env.HF_TOKEN}`,
"Content-Type": "application/json"
}
}
);

const texto = response?.data?.generated_text?.trim();
if (texto && texto.length > 2) return texto;

return "Gracias por tu consulta 😊 ¿Querés algo para picar, alguna salchicha alemana o una tabla completa?";
} catch (error) {
console.log("Error IA Nuevo Munich:", error?.response?.data || error);
return "Se me mezclaron los embutidos 😅 ¿Podés repetir qué producto o combinación buscás?";
}
}