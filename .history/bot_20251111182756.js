import axios from "axios";
import dotenv from "dotenv";
import { procesarMensajeIA } from "./ia.js";
import { IMAGENES } from "./imagenes.js";
dotenv.config();

// --- CONFIG ---
const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const WEB = "https://nuevomunich.com.ar";
const CATALOGO = "https://nuevomunich.com.ar/catalogo.pdf";

// 🧠 Sesiones
export const sessions = new Map();
export const ultimoProducto = new Map();

// --- Enviar mensajes ---
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// =============================================================
// ✅ MENÚ PRINCIPAL RESUMIDO
// =============================================================
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: {
text: `*Nuevo Munich* 🥨\nArtesanos del sabor desde 1972.\n\n${WEB}`
},
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "Leer más 📖" } }
]
}
}
});
}

// =============================================================
// ✅ MENÚ PRINCIPAL EXPANDIDO
// =============================================================
export async function sendMenuPrincipalExpandido(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: {
text:
`*Nuevo Munich* 🥨
Artesanos del sabor desde 1972.

Fue en *1972* cuando los primeros dueños, de origen *austríaco*, trajeron sus recetas heredadas de generaciones y generaciones de sabores centroeuropeos.

Hoy mantenemos ese legado en cada elaboración.`
},
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos 🥓" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos & Catering 🍽️" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido 📝" } }
]
}
}
});
}

// =============================================================
// 🥓 MENÚ PRODUCTOS
// =============================================================
export async function sendProductosMenu(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría:" },
footer: { text: CATALOGO },
action: {
buttons: [
{ type: "reply", reply: { id: "P_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "P_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "P_SALCHICHAS", title: "Salchichas Alemanas" } }
]
}
}
});
}

// =============================================================
// 🧾 DETALLE DE CATEGORÍAS
// =============================================================
export async function sendCategoriaDetalle(to, cat) {
const textos = {
P_FETEADOS: "🥓 *Feteados Artesanales*\nBondiola, Jamón Cocido, Lomo, Panceta.\n\n📄 Catálogo:\n" + CATALOGO,
P_SALAMES: "🍷 *Salames para Picada*\nAlpino, Colonia, Holstein.\n\n📄 Catálogo:\n" + CATALOGO,
P_SALCHICHAS: "🌭 *Línea Alemana*\nViena, Frankfurt, Húngara, Knackwurst, Rosca Polaca.\n\n📄 Catálogo:\n" + CATALOGO
};

return send({
messaging_product: "whatsapp",
to,
text: { body: textos[cat] }
});
}

// =============================================================
// 🖼️ PRODUCTO → ENVÍA IMAGEN Y DESCRIPCIÓN
// =============================================================
export async function sendProductoDetalle(to, nombre) {
ultimoProducto.set(to, nombre);

const img = IMAGENES[nombre] || LOGO;

return send({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: img },
caption: `*${nombre}*\n¿Querés agregarlo al pedido? 😊`
});
}

// =============================================================
// 📝 FLUJO DE PEDIDO
// =============================================================
export async function iniciarPedido(user) {
sessions.set(user, { paso: "TIPO", data: {} });

return send({
messaging_product: "whatsapp",
to: user,
type: "interactive",
interactive: {
type: "button",
body: { text: "¿Para qué tipo de cliente es el pedido?" },
action: {
buttons: [
{ type: "reply", reply: { id: "PARTICULAR", title: "Particular 👤" } },
{ type: "reply", reply: { id: "LOCAL", title: "Hotel / Restaurante 🏨" } }
]
}
}
});
}

export async function flujoPedido(user, msg) {
const s = sessions.get(user);
if (!s) return;

if (s.paso === "TIPO") {
s.data.tipo = msg;
s.paso = "ITEMS";
return send({ messaging_product: "whatsapp", to: user, text: { body: "Decime qué productos querés 😊" } });
}

if (s.paso === "ITEMS") {
s.data.items = msg;
s.paso = "NOMBRE";
return send({ messaging_product: "whatsapp", to: user, text: { body: "¿A nombre de quién lo registramos?" } });
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
sessions.delete(user);
return send({
messaging_product: "whatsapp",
to: user,
text: { body: `✅ Pedido recibido.\n📦 Productos: ${s.data.items}\n👤 Cliente: ${s.data.nombre}\nTipo: ${s.data.tipo}\n\nUn asesor te confirmará disponibilidad y entrega 🥨` }
});
}
}


// =============================================================
// 🤖 RESPUESTA DE IA
// =============================================================
export async function replyIA(to, msg) {
const respuesta = await procesarMensajeIA(msg);
return send({ messaging_product: "whatsapp", to, text: { body: respuesta } });
}
