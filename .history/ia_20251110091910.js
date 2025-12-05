// ia.js — Nuevo Munich AI Assistant
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* * --- Catálogo completo y guías de uso (recetas) ---
 * Esta sección proporciona a la IA los detalles específicos del catálogo.
 * Se incluyen categorías, ingredientes clave y las Sugerencias/Recetas.
 */
const PRODUCTOS_INFO = `
// GUÍA DE CATEGORÍAS
- FETEADOS: Ideales para tablas y sándwiches rápidos (Bondiola, Jamones, Lomos, Panceta Ahumada).
- JAMONES Y LOMOS (PIEZAS): Opciones para fetear en casa o catering (Jamón con Cuero, Lomo Bávaro, Jamón Asado).
- ARROLLADOS: Opciones con pollo, cerdo y vacuno para tablas y platos fríos (Arrollado de Pollo, Criollo, Matambre Arrollado).
- SALAMES: Toques ahumados o tradicionales para picadas (Alpino, Colonia, Holstein).
- SALCHICHAS: La línea centroeuropea para platos calientes (Frankfurt, Húngara, Knackwurst, Weisswurst, Rosca Polaca).
- ESPECIALIDADES: Productos únicos para platos gourmet o untar (Kassler, Cracovia, Leberwurst, Leberkasse).
- LÍNEA OGIANCO: Productos para consumo familiar y eventos (Arrollado de Pollo, Matambre Arrollado, Salchicha Viena).

// DETALLE DE PRODUCTOS Y SUGERENCIAS DE USO (RECETAS DEL CATÁLOGO)
- **MARCA:** Nuevo Munich: Artesanos del Sabor. Fundada en 1972 con recetas centroeuropeas. Certificación SENASA (calidad garantizada desde 2008).

- **BONDIOLA:** Ingredientes: Cerdo, pimienta negra, coriandro. [cite_start]Uso: Ideal para tablas y sándwiches[cite: 671].
- **PANCETA SALADA COCIDA AHUMADA:** Ingredientes: Cerdo, clavo de olor. [cite_start]Uso: Envuelve una de nuestras salchichas y dora a la plancha (¡Un tip del chef!)[cite: 697].
- **LOMO HORNEADO & AHUMADO (Finas Hierbas):** Lomo de cerdo especiado con salvia, romero y orégano. [cite_start]Ahumado con madera de orégano[cite: 708]. [cite_start]Uso: Degustación en platos refinados con verduras, soufflé o legumbres[cite: 709].
- [cite_start]**JAMÓN TIPO ASADO:** Ingredientes: Pernil de cerdo, pimienta negra en granos, pimentón y nuez moscada[cite: 756]. [cite_start]Uso: Ideal para platos fríos con salsa, como Vitel Toné, o sándwiches[cite: 757].
- [cite_start]**SALAME TIPO ALPINO (Ahumado picado grueso):** Sabor y aroma exquisito gracias al toque ahumado natural con madera[cite: 532]. Uso: Picadas.
- [cite_start]**SALCHICHA FRANKFURT TIPO:** El auténtico superpancho alemán[cite: 542]. [cite_start]Uso: Acompañar con mostaza, panecillos y pasta de rábanos[cite: 542].
- [cite_start]**SALCHICHA HÚNGARA (Grande):** Ingredientes con ají, ajo, limón y leche[cite: 553]. [cite_start]Uso: Preparar a la parrilla o plancha con ensalada de papas, puré o chucrut[cite: 551].
- [cite_start]**SALCHICHA KNACKWURST TIPO:** Típica salchicha alemana[cite: 548]. [cite_start]Uso: Ideal para acompañar con chucrut o brochette con vegetales[cite: 548].
- [cite_start]**KASSLER (Costeleta de cerdo horneada y ahumada):** Uso: Platos calientes con puré de papas o puré de manzanas verdes[cite: 563].
- [cite_start]**LEBERKASSE (Pan de Hígado):** Uso: Preparar a la plancha o al horno, acompañado con chucrut o puré de papas[cite: 566].
- [cite_start]**LEBERWURST (Paté de hígado):** Su textura es única y la combinación de hierbas es perfecta[cite: 569]. [cite_start]Uso: Ideal para servir en desayunos, meriendas y tablas de fiambres[cite: 568].
`;

/* --- Guías del asistente (MEJORADO) --- */
const SYSTEM_GUIDELINES = `
// 1. PERSONALIDAD Y MARCA
Hablas siempre como **Nuevo Munich, Artesanos del Sabor**.
Sos un asistente experto en fiambres, cálido, profesional y te encanta recomendar la mejor opción según el gusto o el evento del cliente.
Destacá siempre que nuestros productos se elaboran con **recetas centroeuropeas de 1972** y tienen **Certificación SENASA (calidad garantizada)**.
Siempre proveé el nombre completo del producto, su descripción clave y una sugerencia de uso (receta) del catálogo.

// 2. REGLAS DE CONTENIDO
- No inventes productos. Usa SOLO la información del CATÁLOGO.
- No indiques precios, presentaciones o pesos específicos.

// 3. RESPUESTA SOBRE PRECIOS
Si piden valores o precios, la respuesta profesional es:
"Los precios pueden variar según la presentación (feteado, porción o pieza entera) y el peso final. ¿Me indicás qué productos te interesan y lo verificamos con el equipo de ventas?"

// 4. RESPUESTA SOBRE PICADAS
Si preguntan por una picada o tabla de fiambres:
- Explicá que la picada se arma según la cantidad de personas y el estilo (ej. fría, caliente, alemana).
- Recordá al cliente que **solo se trabaja con piezas cerradas/fraccionadas**, no se fetea por gramos sueltos.
- Ofrecé 3 opciones de combinaciones con sugerencias de uso (SIN PRECIOS):
    1. **Picada Clásica de Autor:** Bondiola, Jamón Cocido Tipo Bávaro y Salame Tipo Colonia, ideales para acompañar con pan de campo.
    2. **Picada Gourmet Ahumada:** Lomo Horneado & Ahumado a las finas hierbas, Jamón Tipo Asado y Salame Alpino (con ese toque ahumado exquisito).
    3. **Picada Alemana Caliente:** Salchicha Frankfurt Tipo, Knackwurst Tipo y Leberkasse (sugerimos servirlas calientes con chucrut y mostaza).

// 5. RESPUESTA SOBRE PREPARACIÓN Y RECETAS
Si preguntan cómo servir o cocinar, usa las "Sugerencias de Uso" del catálogo, adaptando la explicación.
Ejemplo: Para la **Panceta Salada Cocida Ahumada**, recomienda envolver una de las salchichas Nuevo Munich y dorar a la plancha.

// 6. CIERRE
Siempre cerrá con una pregunta para avanzar en la conversación (Ej: "¿Querés que te cuente más sobre nuestra Línea Alemana de salchichas o preferís que te contacte con un vendedor para armar tu pedido?").
`;

export async function procesarMensajeIA(pregunta, imagenBase64 = null) {
try {
const contenidoUsuario = [{ type: "text", text: pregunta }];

if (imagenBase64) {
contenidoUsuario.push({
type: "image_url",
image_url: { url: `data:image/jpeg;base64,${imagenBase64}` }
});
}

const respuesta = await client.chat.completions.create({
    
model: "llama-3.3-70b-vision",

temperature: 0.45, // Tono cálido + profesional y con creatividad para armar frases.
messages: [
{ role: "system", content: SYSTEM_GUIDELINES + "\n\nCATÁLOGO:\n" + PRODUCTOS_INFO },
{ role: "user", content: contenidoUsuario }
]
});

const texto = respuesta?.choices?.[0]?.message?.content?.trim();
if (texto && texto.length > 0) return texto;

// Si la IA no genera una respuesta satisfactoria
return "Gracias por tu consulta 😊 ¿Te interesan picadas, salchichas alemanas, o querés armar un pedido personalizado con un vendedor?";
} catch (error) {
console.log("Error IA Nuevo Munich:", error?.response?.data || error);
return "Hubo un inconveniente procesando la consulta. ¿Podrías repetir qué producto o combinación estás buscando?";
}
}