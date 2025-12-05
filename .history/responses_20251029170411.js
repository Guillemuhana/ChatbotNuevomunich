// responses.js
import { sendText, sendImage } from "./bot.js";

// ✅ URL pública del logo (reemplazá por la tuya si querés)
const LOGO_URL =
"https://i.ibb.co/nMy6wHG/Nuevo-Munich-Logo.png"; // <- cambiá por tu URL si tenés otra

// ✅ Imagen pública de ejemplo para un producto (Bondiola)
const BONDIOLA_URL =
"https://nuevomunich.com.ar/wp-content/uploads/2024/04/S1A9449-Bondiola-FETEADO.jpg";

// ✅ Link público a catálogo (si no tenés uno propio, dejá este como texto informativo)
const CATALOGO_LINK =
"https://linktr.ee/nuevomunich"; // o Drive/tu web si lo publicás

export async function handleIncoming(message) {
const from = message.from;
const text = (message.text?.body || "").trim().toLowerCase();

// === BIENVENIDA (logo arriba + texto debajo) ===
if (
text === "hola" ||
text === "buenas" ||
text === "hi" ||
text === "menu" ||
text === "menú" ||
text === "inicio" ||
text === ""
) {
await sendImage(
from,
LOGO_URL,
"Nuevo Munich\nArtesanos del Sabor desde 1972."
);

await sendText(
from,
`¿Qué necesitás?\n• Escribí *productos*\n• Escribí *eventos*\n• Escribí *zonas de reparto*\n• Escribí *provincias*\n• Escribí *otras consultas*\n\nTambién podés escribir *feteados*, *catálogo* o *contacto*.`
);
return;
}

// === ATAJOS CLÁSICOS ===
if (text.includes("fetea")) {
await sendText(
from,
"FETEADOS disponibles:\n• Bondiola\n• Arrollado de pollo\n• Lomo de cerdo cocido ahumado\n• Lomito a las finas hierbas\n• Arrollado cocido\n• Jamón cocido\n• Panceta cocida ahumada\n• Jamón cocido tipo asado\n• Jamón cocido tipo Bávaro\n\nPedime por nombre: ej. *bondiola*"
);
return;
}

if (text.includes("bondiola")) {
await sendImage(
from,
BONDIOLA_URL,
"🥩 Bondiola feteada\nIngredientes: Bondiola de cerdo, pimienta negra, coriandro, sal y azúcar.\nSugerencias: Ideal para tablas y sándwiches."
);
return;
}

if (text.includes("catálogo") || text.includes("catalogo")) {
await sendText(
from,
`📄 Catálogo completo: ${CATALOGO_LINK}\nSi preferís, decime *feteados* o el nombre del producto.`
);
return;
}

if (text.includes("contact") || text.includes("pedido") || text.includes("comprar")) {
await sendText(
from,
"📞 *Ventas*: 3517010545\n✉️ *Email*: ventas@nuevomunich.com.ar\nContame tu consulta y tu zona."
);
return;
}

// === MENÚS QUE PEDISTE (texto plano por ahora) ===
if (text.includes("productos")) {
await sendText(
from,
"Categorías de productos:\n• Feteados\n• Arrollados\n• Jamones\n• Salamines\n• Salchichas\n• Especialidades\n\nPor ahora respondemos *feteados* con detalle. (Vamos ampliando 💪)"
);
return;
}

if (text.includes("eventos")) {
await sendText(
from,
"🎉 Eventos: Nuevo Munich participa en eventos y propuestas gastronómicas. Contanos fecha, ciudad y estimación de público para coordinar."
);
return;
}

if (text.includes("zonas de reparto")) {
await sendText(
from,
"🚚 Zonas de reparto: consultanos tu barrio/ciudad para coordinar entrega o punto de retiro."
);
return;
}

if (text.includes("provincias")) {
await sendText(
from,
"🇦🇷 Provincias: trabajamos con distribuidores y envíos según logística. Decinos tu provincia y ciudad para confirmar disponibilidad."
);
return;
}

if (text.includes("otras consultas") || text.includes("otra consulta")) {
await sendText(
from,
"Te leo 👇 Contame qué necesitás (producto, cantidad, zona, fecha)."
);
return;
}

// === FALLBACK ===
await sendText(
from,
"No te entendí bien 🤔\nProbá con: *productos*, *feteados*, *catálogo*, *contacto*, *eventos*, *zonas de reparto*, *provincias*."
);
}
