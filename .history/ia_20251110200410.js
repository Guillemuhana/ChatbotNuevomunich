import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;

// ------- CATÁLOGO Y PERSONALIDAD COMPLETA -------
const PRODUCTOS_INFO = `
FETEADOS:
- Bondiola
- Jamón Cocido
- Lomo Ahumado
- Panceta Salada Cocida Ahumada

SALAMES:
- Alpino
- Colonia
- Holstein

SALCHICHAS ALEMANAS:
- Viena
- Frankfurt
- Húngara
- Knackwurst
- Rosca Polaca

ESPECIALIDADES:
- Kassler
- Leberkasse
- Leberwurst (Paté de Hígado)

Todos los productos son artesanales con recetas centroeuropeas de 1972.
Certificación SENASA.
`;

const SYSTEM_GUIDELINES = `
Sos el asistente oficial de *Nuevo Munich, Artesanos del Sabor*.
Hablas con tono cálido, gourmet y profesional.

Tus funciones:
1) Recomendar productos según ocasión.
2) Sugerir combinaciones y picadas.
3) Explicar usos y recetas breves.
4) NO inventar productos.
5) Si preguntan precios → responder:
"Los valores pueden variar según presentación y peso. Te confirmo con ventas cuando definamos qué producto te interesa 😊"
6) Siempre cerrar con una pregunta suave para continuar la conversación.

Siempre usar los productos existentes en PRODUCTOS_INFO.
`;

// ------- FUNCIÓN PRINCIPAL IA -------
export async function procesarMensajeIA(pregunta, imagenBase64 = null) {
try {
const mensajes = [
{ role: "system", content: SYSTEM_GUIDELINES + "\n\nCATÁLOGO:\n" + PRODUCTOS_INFO },
{ role: "user", content: pregunta }
];

// Si hubiera imagen (por ahora sólo texto, pero queda preparado)
if (imagenBase64) {
mensajes.push({
role: "user",
content: [
{ type: "text", text: pregunta },
{ type: "image_url", image_url: `data:image/jpeg;base64,${imagenBase64}` }
]
});
}

const response = await axios.post(
"https://router.huggingface.co/v1/chat/completions",
{
model: "mistralai/Mixtral-8x7B-Instruct",
messages: mensajes,
temperature: 0.5,
max_tokens: 450
},
{
headers: {
Authorization: `Bearer ${HF_TOKEN}`,
"Content-Type": "application/json"
}
}
);

const texto = response?.data?.choices?.[0]?.message?.content?.trim();
if (texto && texto.length > 2) return texto;

return "¿Te ayudo con productos para picada, salchichas alemanas o querés armar un pedido? 😊";
} catch (error) {
console.log("❌ Error IA Nuevo Munich:", error?.response?.data || error);
return "Se me mezclaron los embutidos 😅 ¿Podés repetir qué producto o combinación estás buscando?";
}
}

