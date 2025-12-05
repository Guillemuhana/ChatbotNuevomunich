import axios from "axios";
import dotenv from "dotenv";
import { procesarMensajeIA } from "./ia.js"; // tu archivo IA Opción B
dotenv.config();

const API = "https://graph.facebook.com/v24.0"; // v24 (auto-upgrade de Meta)
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL;
const WEB = process.env.WEB_URL; // ej: https://www.nuevomunich.com.ar
const IG = process.env.INSTAGRAM_URL; // ej: https://instagram.com/nuevomunich
const LINKTREE = process.env.LINKTREE_URL; // ej: https://linktr.ee/nuevomunich

export const sessions = new Map();

/* ========== Util ========== */
async function sendMessage(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

/* ========== Menú principal (sin footer para evitar #131009) ========== */
export async function sendMenuPrincipal(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: LOGO ? { type: "image", image: { link: LOGO } } : undefined,
body: {
text:
"*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:"
},
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos & Catering" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
]
}
}
});
}

/* Footer en mensaje aparte (multilínea como tu imagen) */
export async function sendFooterLinks(to) {
const lines = [
"🌐 www.nuevomunich.com.ar",
"📸 @nuevomunich",
"🔗 linktr.ee/nuevomunich"
].join("\n");

return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: lines }
});
}

/* ========== Productos: 2 tandas de 3 botones ========== */
export async function sendProductosMenu1(to) {
await sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría 👇" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "CAT_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "CAT_ALEMANAS", title: "Alemanas" } }
]
}
}
});

// Hint para el usuario
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "Más categorías 👇" }
});
}

export async function sendProductosMenu2(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Continuación de categorías:" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_ESPECIALIDADES", title: "Especialidades" } },
{ type: "reply", reply: { id: "CAT_JAMONES_LOMOS", title: "Jamones & Lomos" } },
{ type: "reply", reply: { id: "CAT_ARROLLADOS", title: "Arrollados" } }
]
}
}
});
}

/* ========== Descripciones por categoría (sin precios) ========== */
const DESCRIPCIONES = {
CAT_FETEADOS:
"🥪 *Feteados*\n- Bondiola\n- Jamón Cocido (Común / Tipo Bávaro / Tipo Asado)\n- Panceta Salada Cocida Ahumada\n- Lomo de Cerdo (Cocido / Ahumado a finas hierbas)\n\nSugerencias: tablas frías, sándwiches, picadas.",
CAT_SALAMES:
"🧀 *Salames*\n- Tipo Alpino (ahumado, picado grueso)\n- Tipo Colonia\n- Holstein (ahumado, picado fino)\n\nSugerencias: picadas, tapas y degustación.",
CAT_ALEMANAS:
"🌭 *Línea Alemana / Salchichas*\n- Viena (copetín / grande)\n- Frankfurt Tipo (superpancho alemán)\n- Húngara (copetín / grande)\n- Knackwurst Tipo\n- Weisswurst Tipo\n- Rosca Polaca\n\nSugerencias: servir calientes con chucrut, puré o mostaza.",
CAT_ESPECIALIDADES:
"🔥 *Especialidades*\n- Kassler (costeleta de cerdo horneada y ahumada)\n- Leberkasse\n- Cracovia\n- Leberwurst (paté de hígado)\n\nSugerencias: platos calientes o untables gourmet.",
CAT_JAMONES_LOMOS:
"🍖 *Jamones & Lomos (piezas)*\n- Jamón con cuero / Tipo Asado\n- Lomos (Bávaro, Horneado & Ahumado a finas hierbas)\n\nSugerencias: tablas, platos fríos, sándwiches.",
CAT_ARROLLADOS:
"🥓 *Arrollados*\n- Arrollado de Pollo\n- Arrollado Criollo\n- Matambre Arrollado\n\nSugerencias: picadas, entradas frías."
};

export async function sendCategoriaDetalle(to, id) {
const texto = DESCRIPCIONES[id] || "Categoría no disponible momentáneamente.";
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: texto }
});
}

/* ========== Eventos & Catering ========== */
export async function sendEventos(to) {
const body =
"🎪 *Eventos & Catering*\n" +
"- Picadas frías/calientes\n- Estilo alemán\n- Sándwiches artesanales\n\n" +
"Contame cantidad de personas y fecha, y te armamos propuesta sin precio por acá.";
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body }
});
}

/* ========== Pedidos (no se envía a teléfono; queda en el bot) ========== */
export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEMS", data: {} });
return sendMessage({
messaging_product: "whatsapp",
to,
text: {
body:
"📝 *Nuevo Pedido*\nDecime qué querés (ej: 1 Rosca Polaca + 2 Viena grandes)."
}
});
}

export async function flujoPedido(to, msg) {
const s = sessions.get(to);
if (!s) return false;

if (s.paso === "ITEMS") {
s.data.items = msg;
s.paso = "NOMBRE";
await sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "¿A nombre de quién registramos el pedido?" }
});
return true;
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
s.paso = "CONFIRM";
await sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text: `Confirmar pedido:\n\n${s.data.items}\nA nombre de: ${s.data.nombre}`
},
action: {
buttons: [
{ type: "reply", reply: { id: "CONFIRMAR", title: "Confirmar ✅" } },
{ type: "reply", reply: { id: "CANCELAR", title: "Cancelar ❌" } }
]
}
}
});
return true;
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
return true;
}

return false;
}

/* ========== IA para texto libre (Groq – tu ia.js) ========== */
export async function replyIA(to, msg) {
try {
const r = await procesarMensajeIA(msg);
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: r || "¿Te cuento algo de nuestras picadas o salchichas alemanas?" }
});
} catch (e) {
console.log("IA error:", e?.response?.data || e);
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "Perdón, hubo un inconveniente. ¿Podés repetir?" }
});
}
}
