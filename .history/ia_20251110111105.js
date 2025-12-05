// ia.js — Nuevo Munich AI Assistant (completo y actualizado)
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

// Cliente Groq (usa la key de .env -> GROQ_API_KEY)
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* --------------------------------------------------------------------------
* CATÁLOGO COMPLETO + SUGERENCIAS (SIN PRECIOS)
* -------------------------------------------------------------------------- */
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

FETEADOS:
- BONDIOLA: Cerdo, pimienta negra, coriandro. Uso: Ideal para tablas y sándwiches.
- JAMÓN COCIDO (Común / Tipo Bávaro / Tipo Asado): Pernil de cerdo; variantes con especias. Uso: Sándwiches, tablas.
- PANCETA SALADA COCIDA AHUMADA: Cerdo, toque de clavo de olor. Uso: Envolver salchichas y dorar a la plancha (tip del chef).
- LOMO DE CERDO COCIDO | LOMO DE CERDO AHUMADO a las finas hierbas: Salvia, romero, orégano. Uso: Platos fríos/templados con verduras o legumbres.

ARROLLADOS:
- ARROLLADO DE POLLO / ARROLLADO CRIOLLO / MATAMBRE ARROLLADO: Para tablas y platos fríos. Uso: Cortes parejos, servir con mostaza y pan rústico.

SALAMES:
- SALAME TIPO ALPINO (Ahumado, picado grueso): Toque ahumado natural. Uso: Picadas.
- SALAME TIPO COLONIA: Tradicional. Uso: Picadas clásicas.
- SALAME HOLSTEIN (Ahumado, picado fino): Perfil más suave. Uso: Tablas variadas.

LÍNEA ALEMANA / SALCHICHAS:
- VIENA (Copetín / Grande): Uso: Picar o hot-dog.
- FRANKFURT TIPO (Superpancho Alemán): Uso: Pan, mostaza y pasta de rábanos.
- TIPO HÚNGARA (Copetín / Grande): Ají, ajo, limón y leche. Uso: Parrilla/plancha con ensalada de papas, puré o chucrut.
- KNACKWURST TIPO: Uso: Con chucrut o en brochettes con vegetales.
- WEISSWURST TIPO: Típica bávara. Uso: Hervida suave y con pretzel/mostaza dulce.
- ROSCA POLACA: Uso: Al horno o plancha; cortar en rodajas gruesas.

ESPECIALIDADES:
- KASSLER (Costeleta de cerdo horneada y ahumada): Uso: Platos calientes con puré de papas o puré de manzanas verdes.
- LEBERKASSE (Pan de Hígado): Uso: A la plancha/horno con chucrut o puré.
- CRACOVIA: Embutido ahumado suave. Uso: Tablas o sándwiches.
- LEBERWURST (Paté de hígado): Textura suave, hierbas. Uso: Desayunos, meriendas y tablas (untar).

LÍNEA OGIANCO (familia):
- Salchicha Viena, Arrollado de Pollo, Matambre Arrollado (presentaciones accesibles para eventos/cenas).
`;

/* --------------------------------------------------------------------------
* GUÍAS DEL ASISTENTE (PERSONALIDAD + POLÍTICAS DE RESPUESTA)
* -------------------------------------------------------------------------- */
const SYSTEM_GUIDELINES = `
// 1. PERSONALIDAD Y MARCA
Hablás siempre como **Nuevo Munich, Artesanos del Sabor**.
Tono cálido, profesional y gourmet. Recomendás según gusto/evento.
Remarcás recetas centroeuropeas (1972) y **Certificación SENASA**.

// 2. REGLAS DE CONTENIDO
- No inventes productos. Usá SOLO el catálogo provisto.
- No des precios ni pesos exactos.

// 3. SI PIDEN PRECIOS
Decí: "Los precios pueden variar según la presentación (feteado, porción o pieza entera) y el peso final. ¿Qué productos te interesan y lo verificamos con el equipo de ventas?"

// 4. SI PIDEN PICADAS / TABLAS
- Se arman según cantidad de personas y estilo (fría, caliente, alemana).
- Solo piezas cerradas o fraccionadas; no por gramos sueltos.
- Ofrecé 3 combinaciones (sin precios), por ejemplo:
1) **Picada Clásica de Autor**: Bondiola, Jamón Cocido Tipo Bávaro, Salame Tipo Colonia.
2) **Picada Gourmet Ahumada**: Lomo Ahumado finas hierbas, Jamón Tipo Asado, Salame Alpino.
3) **Picada Alemana Caliente**: Frankfurt, Knackwurst y Leberkasse (con chucrut y mostaza).

// 5. PREPARACIONES / RECETAS
Dá instrucciones simples usando las sugerencias del catálogo (ej.: Panceta ahumada envolviendo una salchicha y dorada a la plancha).

// 6. CIERRE
Siempre cerrá con una pregunta: ¿Para cuántas personas? ¿Es para hoy? ¿Querés que te arme una propuesta?
`;

/* --------------------------------------------------------------------------
* FUNCIÓN PRINCIPAL
* -------------------------------------------------------------------------- */
export async function procesarMensajeIA(pregunta, imagenBase64 = null) {
try {
// Construimos el mensaje del usuario (texto + imagen opcional)
const contenidoUsuario = [{ type: "text", text: pregunta }];

if (imagenBase64) {
contenidoUsuario.push({
type: "image_url",
image_url: { url: `data:image/jpeg;base64,${imagenBase64}` }
});
}

// ⚠️ MODELO ACTUAL DISPONIBLE EN GROQ (GRATIS)
const respuesta = await client.chat.completions.create({
model: "llama-3-groq-8b-8192",
temperature: 0.45,
messages: [
{ role: "system", content: SYSTEM_GUIDELINES + "\n\nCATÁLOGO:\n" + PRODUCTOS_INFO },
{ role: "user", content: contenidoUsuario }
]
});

const texto = respuesta?.choices?.[0]?.message?.content?.trim();
if (texto) return texto;

// Fallback cordial si el modelo no devuelve texto
return "Gracias por tu consulta 😊 ¿Te interesan picadas, salchichas alemanas, o querés armar un pedido personalizado con un vendedor?";

} catch (error) {
// Log detallado para que lo veas en consola si hay cambios futuros de Groq
console.log("Error IA Nuevo Munich:", error?.response?.data || error);
return "Hubo un inconveniente procesando la consulta. ¿Podrías repetir qué producto o combinación estás buscando?";
}
}
