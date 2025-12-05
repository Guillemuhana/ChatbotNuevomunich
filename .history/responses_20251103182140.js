import { sendText, sendImage, sendButtons, sendList, sendDocument, sleep } from "./bot.js";
import { procesarMensajeIA } from "./ia.js";

// --- URLs de marca ---
const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const WEB_URL = "https://nuevomunich.com.ar";
const IG_URL = "https://www.instagram.com/nuevomunich/?igsh=eWFmN3VyNGRndHZv";
const LINKTREE_URL = "https://linktr.ee/nuevomunich?utm_source=linktree_profile_share";
const CATALOGO_DRIVE_DIRECT = "https://drive.google.com/uc?export=download&id=1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k";

// --- Keywords de activación de menú ---
const TRIGGERS_MENU = ["hola","buenas","menu","inicio","start","comenzar"];

// Normaliza texto
const norm = (s) => (s || "").toString().trim().toLowerCase();

export async function handleIncoming(phoneId, to, rawText) {
try {
const text = norm(rawText);

// 1) BIENVENIDA + LOGO + MENÚ
if (!text || TRIGGERS_MENU.some(t => text.includes(t))) {
await sendImage(phoneId, to, LOGO_URL, "");
await sleep(400);

await sendText(
phoneId,
to,
`*Bienvenido a Nuevo Munich* 🍺\n` +
`_Artesanos del sabor desde 1972._\n\n` +
`🌐 Web: ${WEB_URL}\n` +
`📸 Instagram: ${IG_URL}\n` +
`🔗 Linktree: ${LINKTREE_URL}`
);

await sleep(300);

await sendButtons(
phoneId,
to,
"¿En qué podemos ayudarte? 👇",
[
{ id: "BTN_PRODUCTOS", title: "🧾 Productos" },
{ id: "BTN_PICADAS", title: "🍽️ Picadas" },
{ id: "BTN_CATALOGO", title: "📎 Ver Catálogo" }
]
);
return;
}

// 2) BOTONES PRINCIPALES
if (text === "btn_productos" || text.includes("productos")) {
await sendText(
phoneId,
to,
"📦 *Categorías*\n• Feteados\n• Salames\n• Salchichas\n• Especialidades\n\n¿Querés que te sugiera algo según para cuántas personas es?"
);
return;
}

if (text === "btn_catalogo" || text.includes("catalogo") || text.includes("catálogo")) {
await sendText(
phoneId,
to,
`📄 *Catálogo Nuevo Munich*\nDescargalo en PDF aquí:\n${CATALOGO_DRIVE_DIRECT}\n\n` +
`También podés ver todos nuestros enlaces aquí:\n${LINKTREE_URL}`
);
// (Opcional): también podrías usar sendDocument(...)
// await sendDocument(phoneId, to, CATALOGO_DRIVE_DIRECT, "Catalogo-Nuevo-Munich.pdf");
return;
}

if (text === "btn_picadas" || text.includes("picada") || text.includes("picadas")) {
// Lista con 3 opciones
await sendList(
phoneId,
to,
"🍽️ Picadas Nuevo Munich",
"Elegí una propuesta según la cantidad de personas:",
"Ver opciones",
[
{
title: "Sugerencias",
rows: [
{ id: "PICADA_CLASICA", title: "Clásica (2-3 personas)", description: "Selección tradicional de feteados + quesos" },
{ id: "PICADA_FAMILIAR", title: "Familiar (4-5 personas)", description: "Variedad equilibrada para compartir" },
{ id: "PICADA_PREMIUM", title: "Premium (5-8 personas)", description: "Selección amplia con especialidades" },
]
}
]
);
return;
}

// 3) RESPUESTAS DE LA LISTA/BOTONES DE PICADAS
if (text === "PICADA_CLASICA") {
await sendText(
phoneId,
to,
"🍽️ *Picada Clásica (2-3 personas)*\n" +
"Sugerencia: ~300–400 g totales entre feteados y quesos.\n" +
"• Jamón cocido, bondiola, salamín\n" +
"• Queso tipo gouda o pategrás\n" +
"• Aceitunas + pan / grisines\n\n" +
"¿Querés que la armemos y coordinamos retiro o envío?"
);
return;
}

if (text === "PICADA_FAMILIAR") {
await sendText(
phoneId,
to,
"🍽️ *Picada Familiar (4-5 personas)*\n" +
"Sugerencia: ~600–700 g totales.\n" +
"• Jamón cocido tipo bávaro, bondiola, salame tipo colonia\n" +
"• Quesos (pategrás + sardo)\n" +
"• Aceitunas + pan de campo / grisines\n\n" +
"¿La armamos para hoy o preferís programar?"
);
return;
}

if (text === "PICADA_PREMIUM") {
await sendText(
phoneId,
to,
"🍽️ *Picada Premium (5-8 personas)*\n" +
"Sugerencia: ~1 kg o más.\n" +
"• Bondiola, jamón crudo, lomo de cerdo ahumado\n" +
"• Salame holstein o alpino\n" +
"• Quesos (gouda + sardo) + aceitunas\n\n" +
"¿Querés personalizarla con tus favoritos?"
);
return;
}

// 4) FALLBACK A IA (Groq) — responde dudas de productos/catering según guía
const ia = await procesarMensajeIA(rawText || "");
await sendText(phoneId, to, ia);

} catch (e) {
console.error("❌ Error en handleIncoming:", e?.response?.data || e);
await sendText(
phoneId,
to,
"Ups, hubo un inconveniente técnico. ¿Podés repetir tu consulta o decirme si querías *Picadas*, *Productos* o *Catálogo*?"
);
}
}
