// bot.js
import axios from "axios";
import dotenv from "dotenv";
import Groq from "groq-sdk";
dotenv.config();

/* ====== CONFIG META ====== */
const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

/* ====== LINKS / MARCA ====== */
const LOGO = process.env.LOGO_URL;
const WEB = process.env.WEB_URL; // ej: https://nuevomunich.com.ar
const IG = process.env.INSTAGRAM_URL; // ej: https://instagram.com/nuevomunich.oficial
const CATALOGO = process.env.CATALOG_URL; // ej: https://nuevomunich.com.ar/catalogo

/* ====== IA (Groq) ====== */
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function iaResponder(texto) {
try {
const chat = await groq.chat.completions.create({
model: "llama-3.1-70b-versatile",
temperature: 0.45,
messages: [
{
role: "system",
content:
`Sos el asistente de Nuevo Munich (Córdoba, 1972). Tono amable, gourmet y claro.
No inventes productos ni precios. Si preguntan por valores decí que varían según peso/presentación.`
},
{ role: "user", content: texto }
]
});
return chat.choices?.[0]?.message?.content?.trim() || "¿Te ayudo con Picadas, Línea Alemana o Parrilla?";
} catch {
return "Disculpame, ¿podés repetir? 😊";
}
}

/* ====== HELPERS ====== */

// 1) Footer seguro (NUNCA más de 60 caracteres)
function footerSeguro() {
// usamos solo la web para no pasarnos de 60
// ejemplo: "https://nuevomunich.com.ar" (<= 60)
return WEB?.slice(0, 60) || "";
}

// 2) Enviar bloque con los tres links (fuera del footer)
async function enviarLinksCompletos(to) {
const cuerpo =
`🔗 Links útiles
• Web: ${WEB}
• Instagram: ${IG}
• Catálogo: ${CATALOGO}`;
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: cuerpo }
});
}

/* ====== ENVÍO BASE ====== */
export async function sendMessage(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

/* ====== MENÚ PRINCIPAL ====== */
export async function sendMenuPrincipal(to) {
await sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: { text: "*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:" },
// Footer CORTO (solo la web) para evitar el error 131009
footer: { text: footerSeguro() },
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Ver Productos" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos" } }
]
}
}
});

// Links completos en un mensaje aparte (sin límite de 60)
await enviarLinksCompletos(to);
}

/* ====== MENÚ PRODUCTOS ====== */
export async function sendProductosMenu(to) {
await sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría 👇" },
footer: { text: footerSeguro() }, // solo web
action: {
buttons: [
{ type: "reply", reply: { id: "P_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "P_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "P_ALemana", title: "Línea Alemana" } },
{ type: "reply", reply: { id: "P_GRILL", title: "Parrilla / Grill" } },
{ type: "reply", reply: { id: "P_ESPECIALIDADES", title: "Especialidades" } }
].slice(0,3) // WhatsApp solo permite 3 botones por mensaje
}
}
});

// Para ofrecer todas, enviamos las restantes en otro mensaje de texto
await sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "⚠️ WhatsApp permite 3 botones. También podés escribir:\n- Feteados\n- Salames\n- Línea Alemana\n- Parrilla / Grill\n- Especialidades" }
});
}

/* ====== DETALLE POR CATEGORÍA (sin precios) ====== */
const DETALLES = {
P_FETEADOS:
`🥓 *Feteados*
- Bondiola
- Jamón Cocido (Común, Tipo Bávaro, Tipo Asado)
- Panceta salada cocida ahumada
- Arrollado de Pollo / Arrollado Criollo
- Lomo de cerdo (cocido) / Lomo ahumado finas hierbas`,

P_SALAMES:
`🧂 *Salames*
- Tipo Alpino (ahumado, picado grueso)
- Tipo Colonia
- Holstein (ahumado, picado fino)`,

P_ALemana:
`🌭 *Línea Alemana / Salchichas*
- Viena (copetín / grande)
- Frankfurt tipo (superpancho)
- Tipo Húngara (copetín / grande)
- Knackwurst tipo
- Weisswurst tipo
- Rosca Polaca`,

P_GRILL:
`🔥 *Parrilla / Grill*
- Kassler (costeleta de cerdo horneada y ahumada)
- Rosca Polaca
- Cortes ahumados`,

P_ESPECIALIDADES:
`⭐ *Especialidades*
- Kassler
- Leberkasse
- Cracovia
- Leberwurst (paté de hígado)`
};

export async function sendCategoriaDetalle(to, id) {
const texto = DETALLES[id] || "¿Qué categoría te interesa? (Feteados, Salames, Línea Alemana, Parrilla/Grill, Especialidades)";
await sendMessage({
messaging_product: "whatsapp",
to,
text: { body: texto }
});
// Recordatorio de catálogo
await sendMessage({
messaging_product: "whatsapp",
to,
text: { body: `📦 Catálogo: ${CATALOGO}` }
});
}

/* ====== PEDIDOS ====== */
export const sessions = new Map();

export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEMS", data: {} });
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "Decime qué querés (ej: 1 rosca + 2 viena)." }
});
}

export async function flujoPedido(to, msg) {
const s = sessions.get(to);
if (!s) return;

if (s.paso === "ITEMS") {
s.data.items = msg;
s.paso = "NOMBRE";
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "¿A nombre de quién registramos el pedido?" }
});
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
s.paso = "CONFIRM";
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: `Confirmar pedido:\n\n${s.data.items}\nA nombre de: ${s.data.nombre}` },
action: {
buttons: [
{ type: "reply", reply: { id: "CONFIRMAR", title: "Confirmar ✅" } },
{ type: "reply", reply: { id: "CANCELAR", title: "Cancelar ❌" } }
]
}
}
});
}

if (s.paso === "CONFIRM") {
if (msg === "CONFIRMAR") {
await sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "✅ Pedido registrado. ¡Gracias! 👨‍🍳" }
});
} else {
await sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "❌ Pedido cancelado." }
});
}
sessions.delete(to);
}
}

/* ====== IA LIBRE ====== */
export async function replyIA(to, msg) {
const r = await iaResponder(msg);
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: r }
});
}
