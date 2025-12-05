import { sendText, sendImage } from "./bot.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/logo.png"; // <-- tu logo hosteado
const CONTACTO_VENTAS = "+543517010545";

// =========================
// MENÚ PRINCIPAL
// =========================
async function menuPrincipal(to) {
await sendImage(to, LOGO, "Nuevo Munich");
await sendText(
to,
`¿Qué necesitás?\n\n` +
`• Escribí *productos*\n` +
`• Escribí *eventos*\n` +
`• Escribí *zonas de reparto*\n` +
`• Escribí *provincias*\n` +
`• Escribí *otras consultas*\n\n` +
`También podés escribir *feteados*, *catálogo* o *contacto*.`
);
}

// =========================
// RESPUESTAS
// =========================
export async function handleIncoming(from, text) {

// SALUDO
if (["hola","buenas","hey","buen día","buenas tardes"].some(w => text.includes(w))) {
return menuPrincipal(from);
}

// CONTACTO
if (text.includes("contacto")) {
return sendText(from, `📞 Ventas directo:\n${CONTACTO_VENTAS}`);
}

// CATALOGO
if (text.includes("catálogo") || text.includes("catalogo")) {
return sendText(from, "📄 Catálogo completo:\nhttps://postimg.cc/PPT0flS4");
}

// FETEADOS (LISTA INICIAL)
if (text.includes("feteados") || text.includes("feteado")) {
return sendText(
from,
`🥩 *Feteados disponibles:*\n\n` +
`• Arrollado de Pollo\n` +
`• Bondiola\n` +
`• Lomo Ahumado\n` +
`• Lomito a las finas hierbas\n` +
`• Arrollado cocido\n` +
`• Jamón cocido\n` +
`• Panceta salada ahumada\n` +
`• Jamón tipo asado\n` +
`• Jamón tipo Bávaro\n\n` +
`✍️ Escribí el *nombre exacto* para ver la imagen.`
);
}

return menuPrincipal(from);
}
