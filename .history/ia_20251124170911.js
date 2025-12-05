// ia.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;

// Endpoint estilo OpenAI del Router de HuggingFace
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
// Modelo compatible de chat
const HF_MODEL = "google/gemma-2-9b-it";

// ------------------------------------------------------------------
// Base de productos (solo texto, para que la IA responda bien)
// ------------------------------------------------------------------
const PRODUCTOS_INFO = `
Somos Nuevo Munich, artesanos del sabor desde 1972, con tradición centroeuropea y certificación SENASA.

CATEGORÍAS PRINCIPALES:
- Feteados
- Salames / Picadas
- Salchichas Alemanas
- Especialidades de cocina

FETEADOS (para tablas, sándwiches o platos fríos):
- Bondiola: con pimienta negra y coriandro. Ideal para tablas y sándwiches gourmet.
- Jamón Cocido: clásico, perfecto para pizzas, tostados o sandwiches.
- Jamón Cocido Tipo Bávaro: horneado y ahumado con madera de orégano.
- Jamón Tipo Asado: sazón con pimienta negra, ají molido, pimentón y nuez moscada.
- Lomo Cocido: lomo de cerdo cocido.
- Lomo Ahumado a las Finas Hierbas: salvia, romero, orégano. Va muy bien con verduras o legumbres.
- Panceta Salada Cocida Ahumada: ideal para envolver salchichas y dorar a la plancha.
- Arrollado de Pollo: con huevo, zanahoria, ají molido y orégano.
- Arrollado Criollo: carne de cerdo, tocino y especias naturales.
- Matambre Arrollado: clásico para fiestas y picadas.

SALAMES Y PICADAS:
- Salame tipo Alpino: ahumado, picado grueso, sabor y aroma intensos.
- Salame Holstein: ahumado, picado fino, sabor delicado.
- Salame tipo Colonia: un clásico para picadas.
- Salchichón Ahumado: ahumado con madera de orégano, ideal feteado.
- Cracovia: especialidad para fetear y usar en tablas.

SALCHICHAS ALEMANAS:
- Salchicha Frankfurt: ideal para el “superpancho alemán” con mostaza.
- Salchicha Viena (grande y copetín): perfecta a la parrilla o plancha con chucrut o puré.
- Salchicha Húngara (grande y copetín): cocida y ahumada, con ají.
- Salchicha Knackwurst: típica alemana, va muy bien con chucrut o en brochette.
- Salchicha Weisswurst: suave, sugerida con mostaza dulce.
- Rosca Polaca: 90% carne de cerdo ahumada, ideal a la plancha o parrilla con chucrut.

ESPECIALIDADES:
- Kassler (costeleta de cerdo ahumada): para servir caliente con puré de papas o manzana.
- Leberkasse: tipo pastel de carne, al horno o plancha, va muy bien con chucrut o puré.
- Leberwurst: paté de hígado para untar en panes y tablas de fiambres.
`;

// ------------------------------------------------------------------
// Guías de sistema (tono + reglas de negocio)
// ------------------------------------------------------------------
const SYSTEM_GUIDELINES = `
Eres el asistente comercial y de atención al cliente de "Nuevo Munich – Artesanos del Sabor".

TONO:
- Habla en español, con tono cálido, gourmet, profesional y cercano.
- Mostrá entusiasmo por la calidad artesanal y la tradición centroeuropea.
- Cada vez que describas un producto, si tiene sentido, sugerí una forma de consumo (picadas, sandwich, superpancho, eventos, etc.).

REGLAS:
- NUNCA des precios exactos. Responde algo como:
"Los precios varían según el peso y la presentación. Te confirmamos el valor exacto al armar el pedido."
- NUNCA confirmes stock. Di algo como:
"Revisaremos el stock al procesar tu pedido, pero normalmente solemos tener disponibilidad."
- NUNCA inventes productos que no estén en la lista. Si no existe, redirige a alguna categoría real
como "Feteados", "Salchichas Alemanas", "Salames / Picadas" o "Especialidades".
- Si el usuario hace preguntas muy generales, ayudalo sugiriendo productos concretos.

SIEMPRE que te pregunten si tienen algo (por ejemplo "¿tienen salchichas?" o "¿tienen jamón?"):
- Responde afirmativamente si hay productos relacionados y nómbralos.
- Ofrece una breve descripción rica y apetitosa.
- Invita a seguir por el menú del bot: "Podés verlos también entrando en *Productos* → categoría correspondiente."
`;

export async function procesarMensajeIA(pregunta) {
// Si no hay token, no rompemos el bot
if (!HF_TOKEN) {
return (
"Soy el asistente de Nuevo Munich 😊.\n" +
"Por ahora no tengo acceso al motor de IA, pero puedo guiarte con el menú:\n" +
"escribí *Productos*, *Food Truck* o *Catálogo PDF* para seguir."
);
}

try {
const response = await axios.post(
HF_API_URL,
{
model: HF_MODEL,
messages: [
{ role: "system", content: SYSTEM_GUIDELINES + "\n\n" + PRODUCTOS_INFO },
{ role: "user", content: pregunta }
],
temperature: 0.5,
max_tokens: 400
},
{
headers: {
Authorization: `Bearer ${HF_TOKEN}`,
"Content-Type": "application/json"
}
}
);

const texto =
response.data?.choices?.[0]?.message?.content?.trim() ||
"¿Querés ver productos, eventos o hacer un pedido? Podés escribir *Productos*, *Food Truck* o *Catálogo*.";

return texto;
} catch (e) {
console.log("❌ Error IA Nuevo Munich:", e.response?.data || e);
return (
"Perdón, hubo un problemita con la IA 😅.\n" +
"Igual podés seguir usando el menú escribiendo *Productos*, *Food Truck* o *Catálogo PDF*."
);
}
}

