import axios from "axios";
import dotenv from "dotenv";
import { procesarMensajeIA } from "./ia.js";
dotenv.config();

// --- CONFIG ---
const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const WEB = "https://nuevomunich.com.ar";
const CATALOGO = "https://nuevomunich.com.ar/catalogo.pdf";

// 🧠 Sesiones de pedidos (conversaciones vivas)
export const sessions = new Map();

// --- Enviar mensajes (EXPORTADO PARA USO EN server.js) ---
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// =============================================================
// ✅ MENÚ PRINCIPAL
// =============================================================
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: { text: "*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:" },
footer: { text: WEB },
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
{ type: "reply", reply: { id: "CAT_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "CAT_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "CAT_SALCHICHAS", title: "Salchichas Alemanas" } }
]
}
}
});
}

// =============================================================
// 🧾 DETALLE CATEGORÍAS
// =============================================================
export async function sendCategoriaDetalle(to, cat) {
const textos = {
CAT_FETEADOS: "🥓 *Feteados Artesanales*\nBondiola, Jamón Cocido, Lomo, Panceta.\n\n📄 Catálogo:\n" + CATALOGO,
CAT_SALAMES: "🍷 *Salames para Picada*\nAlpino, Colonia, Holstein.\n\n📄 Catálogo:\n" + CATALOGO,
CAT_SALCHICHAS: "🌭 *Línea Alemana*\nViena, Frankfurt, Húngara, Knackwurst, Rosca Polaca.\n\n📄 Catálogo:\n" + CATALOGO
};

return send({
messaging_product: "whatsapp",
to,
text: { body: textos[cat] }
});
}

// =============================================================
// 📝 FLUJO DE PEDIDO PROFESIONAL
// =============================================================
export async function iniciarPedido(user) {
sessions.set(user, { paso: "ITEM", data: {} });

return send({
messaging_product: "whatsapp",
to: user,
text: { body: "Perfecto 😊 Decime *qué producto o combo* querés pedir." }
});
}

export async function flujoPedido(user, msg) {
const s = sessions.get(user);
if (!s) return;

// 1) Producto
if (s.paso === "ITEM") {
s.data.item = msg;
s.paso = "CANTIDAD";
return send({ messaging_product: "whatsapp", to: user, text: { body: "👌 ¿Qué cantidad querés? (Ej: *300g*, *1 unidad*, *1/2 kg*)" } });
}

// 2) Cantidad
if (s.paso === "CANTIDAD") {
s.data.cantidad = msg;
s.paso = "NOMBRE";
return send({ messaging_product: "whatsapp", to: user, text: { body: "Genial 😊 ¿A nombre de quién registramos el pedido?" } });
}

// 3) Nombre
if (s.paso === "NOMBRE") {
s.data.nombre = msg;
s.paso = "TIPO_CLIENTE";
return send({
messaging_product: "whatsapp",
to: user,
type: "interactive",
interactive: {
type: "button",
body: { text: "Perfecto 🙌\n¿Para qué tipo de consumo es?" },
action: {
buttons: [
{ type: "reply", reply: { id: "Particular 🏠", title: "Particular 🏠" } },
{ type: "reply", reply: { id: "Restaurante 🍽️", title: "Restaurante 🍽️" } },
{ type: "reply", reply: { id: "Hotel 🏨", title: "Hotel 🏨" } },
{ type: "reply", reply: { id: "Evento 🎉", title: "Evento 🎉" } }
]
}
}
});
}

// 4) Tipo cliente
if (s.paso === "TIPO_CLIENTE") {
s.data.tipo = msg;
s.paso = "RETIRO";
return send({ messaging_product: "whatsapp", to: user, text: { body: "📍 ¿Retiro por local o envío a domicilio?" } });
}

// 5) Retiro / envío
if (s.paso === "RETIRO") {
s.data.retiro = msg;
s.paso = "CONFIRM";

return send({
messaging_product: "whatsapp",
to: user,
type: "interactive",
interactive: {
type: "button",
body: {
text: `Revisemos tu pedido:\n\n📦 *${s.data.item}*\n⚖️ Cant.: *${s.data.cantidad}*\n👤 Nombre: *${s.data.nombre}*\n🏷️ Consumo: *${s.data.tipo}*\n🚚 Entrega/Retiro: *${s.data.retiro}*\n\n¿Confirmamos?`
},
action: {
buttons: [
{ type: "reply", reply: { id: "CONFIRMAR", title: "Confirmar ✅" } },
{ type: "reply", reply: { id: "CANCELAR", title: "Cancelar ❌" } }
]
}
}
});
}

// 6) Confirmación + Ubicación + Horarios
if (s.paso === "CONFIRM") {

if (msg === "CONFIRMAR") {

// ✅ Confirmación
await send({
messaging_product: "whatsapp",
to: user,
text: { body: "✅ *Pedido registrado con éxito.*\n¡Muchas gracias por elegir *Nuevo Munich*! 🥨" }
});

// 📍 Ubicación
await send({
messaging_product: "whatsapp",
to: user,
type: "location",
location: {
latitude: "-34.542835",
longitude: "-58.711632",
name: "Nuevo Munich",
address: "Pasaje San Martín 1172, San Miguel"
}
});

// 🕒 Horarios
await send({
messaging_product: "whatsapp",
to: user,
text: { body: "🕒 *Horarios*: Lunes a Sábado 9:00 a 21:00 — Domingo cerrado." }
});

// 😊 Cierre cálido
await send({
messaging_product: "whatsapp",
to: user,
text: { body: "Si necesitás algo más, estoy acá 😊" }
});

} else {
await send({
messaging_product: "whatsapp",
to: user,
text: { body: "❌ Pedido cancelado. Cuando quieras lo retomamos 😊" }
});
}

sessions.delete(user);
return;
}
}

// =============================================================
// 🤖 RESPUESTA CON IA
// =============================================================
export async function replyIA(to, msg) {
const respuesta = await procesarMensajeIA(msg);
return send({ messaging_product: "whatsapp", to, text: { body: respuesta } });
}

