import { sendText, sendImage } from "./bot.js";

// Logo subido a Postimage (el que me pasaste):
const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// --- MENÚ PRINCIPAL CON BOTONES ---
async function sendMenu(to) {
await sendImage(to, LOGO, "");

await sendText(
to,
`¿Qué necesitás?\n\n` +
`• *productos*\n` +
`• *eventos*\n` +
`• *zonas de reparto*\n` +
`• *provincias*\n` +
`• *otras consultas*\n\n` +
`También podés escribir: *feteados*, *catálogo* o *contacto*.`
);
}

export async function handleIncoming(from, rawText) {
const text = (rawText || "").toLowerCase().trim();

// ✅ SALUDO
if (["hola", "buenas", "menu", "inicio"].some(w => text.includes(w))) {
return sendMenu(from);
}

// ✅ PRODUCTOS
if (text.includes("productos")) {
return sendText(from, "🥩 Decime qué categoría querés: *feteados*, arrollados, jamones, salames, especialidades.");
}

// ✅ FETEADOS (por ahora texto hasta subir imágenes)
if (text.includes("feteados")) {
return sendText(
from,
"🥩 *Feteados disponibles:*\n- Arrollado de Pollo\n- Bondiola\n- Lomito Ahumado\n- Jamón Cocido\n\nDecime cuál querés y te paso foto + precio 🧾"
);
}

// ✅ CATÁLOGO
if (text.includes("catálogo") || text.includes("catalogo")) {
return sendText(from, "📄 Catálogo completo:\nhttps://postimg.cc/PPT0fLS4");
}

// ✅ CONTACTO
if (text.includes("contacto")) {
return sendText(from, "📞 Nuestro WhatsApp de ventas es: *3517010545*");
}

// ✅ EVENTOS
if (text.includes("eventos")) {
return sendText(from, "🎉 Organizamos degustaciones y eventos.\nEscribime qué tipo de evento querés.");
}

// ✅ ZONAS
if (text.includes("zonas")) {
return sendText(from, "🗺️ Reparto en Córdoba Capital y zonas aledañas. Decime tu dirección y te confirmo.");
}

// ✅ PROVINCIAS
if (text.includes("provincias")) {
return sendText(from, "🚚 Hacemos envíos a todo el país mediante transporte frigorífico.");
}

// ✅ OTRAS CONSULTAS
if (text.includes("consulta") || text.includes("pregunta")) {
return sendText(from, "Claro, decime tu duda 👇");
}

// ✅ CONSULTAS RÁPIDAS TIPO SMART IA
if (text.includes("hora")) return sendText(from, `🕒 Ahora son: ${new Date().toLocaleTimeString("es-MX")}`);
if (text.includes("día") || text.includes("fecha")) return sendText(from, `📅 Hoy es: ${new Date().toLocaleDateString("es-AR")}`);

// ✅ DEFAULT
return sendMenu(from);
}