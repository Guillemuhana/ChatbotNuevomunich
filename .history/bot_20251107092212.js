import axios from "axios";
import dotenv from "dotenv";
import Groq from "groq-sdk";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// ===== Config visual =====
const LOGO =
process.env.LOGO_URL ||
"https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// Abreviados por defecto (<= 60 chars si se usan juntos)
const WEB = (process.env.WEB_URL || "nuevomunich.com.ar").trim();
const IG = (process.env.INSTAGRAM_URL || "@nuevomunich").trim();
const CATALOGO = (process.env.CATALOG_URL || "Catálogo pronto disponible").trim();

// ===== Footer seguro (1..60) o no se envía =====
function buildSafeFooter() {
// armamos "web | @ig" sólo con lo que exista
const parts = [];
if (WEB) parts.push(WEB);
if (IG) parts.push(IG);
const candidate = parts.join(" | "); // ej: "nuevomunich.com.ar | @nuevomunich"

if (candidate && candidate.length <= 60) {
return { text: candidate };
}
// si se pasa o queda vacío, NO mandamos footer
return undefined;
}
const SAFE_FOOTER = buildSafeFooter();

// ===== IA =====
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function iaResponder(texto) {
try {
const chat = await groq.chat.completions.create({
model: "llama-3.1-70b-versatile",
temperature: 0.5,
messages: [
{
role: "system",
content:
"Sos el asistente de Nuevo Munich (charcutería artesanal desde 1972). Tono amable, gourmet, claro. No inventes productos ni des precios."
},
{ role: "user", content: texto }
]
});
return chat.choices?.[0]?.message?.content || "¿Te puedo ayudar con algo más? 😊";
} catch {
return "Disculpame, ¿podés repetir? 😊";
}
}

// ===== Helper envío =====
async function sendMessage(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// Construye un mensaje interactivo de botones con footer opcional seguro
function buildButtonsInteractive({ body, buttons, headerImageLink, addFooter = true }) {
const interactive = {
type: "button",
body: { text: body },
action: { buttons }
};
if (headerImageLink) {
interactive.header = { type: "image", image: { link: headerImageLink } };
}
if (addFooter && SAFE_FOOTER) {
interactive.footer = SAFE_FOOTER; // sólo si pasó el límite
}
return interactive;
}

// ===== Menú principal =====
export async function sendMenuPrincipal(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: buildButtonsInteractive({
body: "*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:",
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos & Catering" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
],
headerImageLink: LOGO,
addFooter: true
})
});
}

// ===== Productos (1er bloque) =====
export async function sendProductosMenu(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: buildButtonsInteractive({
body: "Seleccioná una categoría 👇",
buttons: [
{ type: "reply", reply: { id: "P_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "P_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "BTN_MAS_CATEGORIAS", title: "Más categorías ➕" } }
],
addFooter: true
})
});
}

// ===== Productos (2do bloque) =====
export async function sendCategoriasExtra(to) {
return sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: buildButtonsInteractive({
body: "Más categorías 👇",
buttons: [
{ type: "reply", reply: { id: "P_ALEMANAS", title: "Salchichas Alemanas" } },
{ type: "reply", reply: { id: "P_ESPECIALIDADES", title: "Especialidades" } }
],
addFooter: true
})
});
}

// ===== Detalle por categoría =====
const textosCategoria = {
P_FETEADOS:
"🥓 *Feteados artesanales*\nJamón, bondiola, lomito y más.\nDecime qué buscás y te guío.",
P_SALAMES:
"🍖 *Salames y embutidos*\nAlpino, colonia, holstein.\n¿Querés una sugerencia para picadas?",
P_ALEMANAS:
"🌭 *Salchichas Alemanas*\nVienna, Frankfurt, Húngara, Knackwurst, Weisswurst.",
P_ESPECIALIDADES:
"🔥 *Especialidades ahumadas*\nKassler, Rosca Polaca, Leberkasse, Cracovia."
};

export async function sendCategoriaDetalle(to, id) {
const texto = textosCategoria[id] || "Decime qué categoría querés ver 👍";
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: `${texto}\n\n📦 Catálogo: ${CATALOGO}` }
});
}

// ===== Pedido simple =====
export const sessions = new Map();

export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEMS", data: {} });
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: "Contame qué querés pedir (ej: 2 Vienna + 1 Rosca Polaca) 😊" }
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
text: { body: "¿A nombre de quién lo registro?" }
});
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
sessions.delete(to);
return sendMessage({
messaging_product: "whatsapp",
to,
text: {
body: `✅ Pedido anotado.\n${s.data.items}\nA nombre de: ${s.data.nombre}\n\nTe confirmo disponibilidad enseguida.`
}
});
}
}

// ===== IA libre =====
export async function replyIA(to, msg) {
const r = await iaResponder(msg);
return sendMessage({
messaging_product: "whatsapp",
to,
text: { body: r }
});
}

