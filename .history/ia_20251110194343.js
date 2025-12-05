import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const PRODUCTOS_INFO = `
- BONDIOLA: Cerdo curado y estacionado. Ideal para picadas y sándwiches.
- PANCETA AHUMADA: Perfecta para cocinar o sumar sabor.
- LOMO AHUMADO: Gourmet y suave.
- SALAME ALPINO AHUMADO: Estrella de picadas.
- FRANKFURT / HÚNGARA / KNACKWURST / WEISSWURST: Línea clásica alemana.
- KASSLER: Costeleta ahumada para plato caliente.
- LEBERKASE + LEBERWURST: Para chucrut o untar.
- MATAMBRES ARROLLADOS & ROSCA POLACA: Tabla fría lista para servir.
`;

const SYSTEM_GUIDELINES = `
Sos el asistente oficial de Nuevo Munich, Artesanos del Sabor.
Usá tono cálido y gourmet.
NO inventes productos.
Si piden precios: "Los precios varían según peso final, decime qué producto querés y lo consulto".
Siempre respondé con una pregunta final para continuar conversación.
`;

export async function procesarMensajeIA(pregunta) {
try {
const response = await axios.post(
"https://router.huggingface.co/v1/chat/completions",
{
model: "HuggingFaceH4/zephyr-7b-beta",
messages: [
{ role: "system", content: SYSTEM_GUIDELINES + "\nCATÁLOGO:\n" + PRODUCTOS_INFO },
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
if (texto && texto.length > 1) return texto;

return "¿Buscás algo para picar, salchichas alemanas o querés armar un pedido personalizado?";
} catch (error) {
console.log("❌ Error IA Nuevo Munich:", error?.response?.data || error);
return "Se me mezclaron los embutidos 😅 ¿Podés repetir qué buscabas?";
}
}

