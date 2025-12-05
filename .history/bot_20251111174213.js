import axios from "axios";
import dotenv from "dotenv";
import { procesarMensajeIA } from "./ia.js";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const WEB = "https://nuevomunich.com.ar";

export const sessions = new Map();
export const ultimoProducto = new Map();

export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// =============================================================
// MENÚ PRINCIPAL
// =============================================================
export async function sendMenuPrincipal(to) {
await send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: { text: "*Bienvenidos a Nuevo Munich 🥨*\nArtesanos del sabor desde 1972." },
footer: { text: WEB },
action: {
buttons: [{ type: "reply", reply: { id: "LEER_MAS", title: "Leer más 📖" } }]
}
}
});

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Menú principal" },
body: { text: "Artesanos del sabor desde 1972.\nElegí lo que necesites 👇" },
action: {
button: "Abrir menú",
sections: [
{
title: "Información",
rows: [
{ id: "MENU_RESEÑA", title: "Sobre nosotros 🧡" },
{ id: "ZONAS_REPARTO", title: "Zonas de reparto 🚚" }
]
},
{
title: "Productos y Servicios",
rows: [
{ id: "BTN_PRODUCTOS", title: "Productos" },
{ id: "BTN_EVENTOS", title: "Eventos & Catering" },
{ id: "BTN_PEDIDO", title: "Hacer Pedido" }
]
},
{
title: "Redes & Sitio",
rows: [
{ id: "INSTAGRAM", title: "Instagram" },
{ id: "WEB", title: "Sitio Web" }
]
}
]
}
}
});
}

// =============================================================
// PRODUCTOS → Categorías y lista
// =============================================================
export async function sendProductosMenu(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Productos" },
body: { text: "Elegí una categoría:" },
action: {
button: "Ver categorías",
sections: [
{
title: "Categorías",
rows: [
{ id: "CAT_FETEADOS", title: "Feteados" },
{ id: "CAT_SALAMES", title: "Salames" },
{ id: "CAT_SALCHICHAS", title: "Salchichas Alemanas" }
]
}
]
}
}
});
}

export async function sendCategoriaDetalle(to, cat) {
const categorias = {
CAT_FETEADOS: ["Bondiola","Jamón Cocido","Lomo Ahumado a las Finas Hierbas","Panceta Ahumada"],
CAT_SALAMES: ["Salame Holstein","Salame Tipo Alpino (Ahumado)","Salame Tipo Colonia"],
CAT_SALCHICHAS: ["Salchicha Viena Grande","Salchicha Frankfurt Tipo Alemán","Salchicha Húngara Grande","Salchicha Knackwurst","Rosca Polaca"]
};

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Seleccioná un producto" },
body: { text: "Elegí el producto 👇" },
action: {
button: "Ver productos",
sections: [
{
title: "Productos",
rows: categorias[cat].map(p => ({ id: "PROD_" + p, title: p }))
}
]
}
}
});
}

// =============================================================
// PEDIDOS (flujo inteligente)
// =============================================================
export async function iniciarPedido(user) {
sessions.set(user, { paso: "ITEM", data: {} });
return send({ messaging_product: "whatsapp", to: user, text: { body: "Decime qué querés pedir 😊" } });
}

export async function flujoPedido(user, msg) {
const s = sessions.get(user);
if (!s) return;

if (s.paso === "ITEM") {
s.data.item = msg;
s.paso = "CANTIDAD";
return send({ messaging_product: "whatsapp", to: user, text: { body: "¿Qué cantidad querés? (Ej: 300g, 1 unidad)" } });
}

if (s.paso === "CANTIDAD") {
s.data.cantidad = msg;
s.paso = "NOMBRE";
return send({ messaging_product: "whatsapp", to: user, text: { body: "¿A nombre de quién registramos el pedido?" } });
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
s.paso = "TIPO_CLIENTE";
return send({ messaging_product: "whatsapp", to: user, text: { body: "¿Es para Particular, Restaurante, Hotel o Evento?" } });
}

if (s.paso === "TIPO_CLIENTE") {
s.data.tipo = msg;
s.paso = "RETIRO";
return send({ messaging_product: "whatsapp", to: user, text: { body: "¿Retiro por local o envío a domicilio?" } });
}

if (s.paso === "RETIRO") {
s.data.retiro = msg;
s.paso = "FECHA";
return send({ messaging_product: "whatsapp", to: user, text: { body: "📅 ¿Para cuándo sería? (Hoy / Mañana / Fecha)" } });
}

if (s.paso === "FECHA") {
s.data.fecha = msg;
s.paso = "CONFIRM";
return send({
messaging_product: "whatsapp",
to: user,
text: { body: `Revisemos 👇\n\n📦 ${s.data.item}\n⚖️ ${s.data.cantidad}\n👤 ${s.data.nombre}\n🏷️ ${s.data.tipo}\n🚚 ${s.data.retiro}\n📅 ${s.data.fecha}\n\nConfirmar ✅ / Cancelar ❌` }
});
}

if (s.paso === "CONFIRM") {
if (msg.toLowerCase().includes("confirm")) {
await send({ messaging_product: "whatsapp", to: user, text: { body: "✅ *Pedido confirmado* 😊\nGracias por elegir productos artesanales.\nNos comunicamos en breve para coordinar entrega." }});
sessions.delete(user);
} else {
await send({ messaging_product: "whatsapp", to: user, text: { body: "Pedido cancelado ❌" }});
sessions.delete(user);
}
}
}

export async function replyIA(to, msg) {
const r = await procesarMensajeIA(msg);
return send({ messaging_product: "whatsapp", to, text: { body: r } });
}
