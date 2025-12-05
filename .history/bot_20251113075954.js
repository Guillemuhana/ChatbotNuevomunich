import axios from "axios";
import dotenv from "dotenv";
import { PRODUCTOS } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

dotenv.config();

// --------------------------
// CONFIG
// --------------------------
const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const WEB = "https://nuevomunich.com.ar";

// --------------------------
export const sessions = new Map();

// --------------------------
// CATEGORÍAS
// --------------------------
export const CATEGORIAS = {
P_FETEADOS: [
"Bondiola",
"Jamón Cocido",
"Jamón Cocido Tipo Bávaro",
"Lomo Cocido",
"Lomo Ahumado a las Finas Hierbas",
"Panceta Ahumada",
"Panceta Salada Ahumada"
],

P_SALAMES: [
"Salame Holstein",
"Salame Tipo Alpino",
"Salame Tipo Colonia",
"Salchichón Ahumado"
],

P_SALCHICHAS: [
"Salchicha Viena Grande",
"Salchicha Frankfurt Tipo Alemán",
"Salchicha Húngara Grande",
"Salchicha Knackwurst",
"Rosca Polaca"
]
};

// --------------------------
// ENVÍO DE MENSAJES
// --------------------------
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// --------------------------------------------------
// 1) MENSAJE DE BIENVENIDA (con logo + leer más)
// --------------------------------------------------
export async function sendBienvenida(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: {
text: `¡Hola! 😊 Bienvenido/a a *Nuevo Munich* 🥨
Artesanos del sabor desde 1972.

${WEB}`
},
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "Leer más 📖" } },
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos 🥓" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos & Catering 🍽️" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido 📝" } }
]
}
}
});
}

// --------------------------------------------------
// 2) TEXTO AMPLIADO (al tocar Leer más)
// --------------------------------------------------
export async function sendDescripcionAmpliada(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body: `*Artesanos del Sabor* 🥨

Fue en 1972 cuando los primeros dueños, de origen austríaco, trajeron sus recetas heredadas de generaciones y generaciones de sabores centroeuropeos.

Hoy mantenemos ese legado en cada elaboración ❤️

👉 Escribí *Menú* para volver al inicio.`
}
});
}

// --------------------------------------------------
// 3) MENÚ PRINCIPAL
// --------------------------------------------------
export async function sendMenuPrincipal(to) {
return sendBienvenida(to);
}

// --------------------------------------------------
// 4) MENÚ DE CATEGORÍAS
// --------------------------------------------------
export async function sendCategorias(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una categoría:" },
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

// --------------------------------------------------
// 5) PRODUCTOS DE UNA CATEGORÍA
// --------------------------------------------------
export async function sendProductosDeCategoria(to, categoriaID) {
const lista = CATEGORIAS[categoriaID];
if (!lista) return;

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí un producto:" },
action: {
buttons: lista.map(prod => ({
type: "reply",
reply: { id: `PROD_${prod}`, title: prod }
}))
}
}
});
}

// --------------------------------------------------
// 6) MOSTRAR IMAGEN DE PRODUCTO
// --------------------------------------------------
export async function sendProducto(to, nombre) {
const key = nombre.toLowerCase().trim();

// Buscar sin acentos y normalizado
const producto = Object.keys(PRODUCTOS).find(
p => p.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "") ===
key.normalize("NFD").replace(/\p{Diacritic}/gu, "")
);

if (!producto) {
return send({
messaging_product: "whatsapp",
to,
text: { body: "No encontré la imagen de ese producto 😕" }
});
}

return send({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: PRODUCTOS[producto].img }
});
}

// --------------------------------------------------
// 7) RESPUESTA CON IA
// --------------------------------------------------
export async function replyIA(to, msg) {
const r = await procesarMensajeIA(msg);
return send({
messaging_product: "whatsapp",
to,
text: { body: r }
});
}