// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const WEB = "https://nuevomunich.com.ar";

/* ------------------ ENVÍO ------------------- */
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

/* ------------------ MENSAJE PRINCIPAL ------------------- */
export async function sendBienvenida(to) {

// LOGO
await send({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: LOGO }
});

// TARJETA CON LEER MÁS
await send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text:
`*¡Bienvenido a Nuevo Munich! 🥨*

Artesanos del Sabor desde 1972.

${WEB}`
},
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "Leer más 📖" } }
]
}
}
});

// BOTÓN MENÚ PRINCIPAL ABAJO
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: " " },
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú principal" } }
]
}
}
});
}

/* ------------------ DESCRIPCIÓN EXPANDIDA ------------------- */
export async function sendDescripcionAmpliada(to) {

await send({
messaging_product: "whatsapp",
to,
text: {
body:
`*Artesanos del Sabor*

Fue en 1972 cuando los primeros dueños, de origen austríaco, trajeron sus recetas
heredadas de generaciones y generaciones de sabores centroeuropeos.

Hoy mantenemos ese legado en cada elaboración.`
}
});

// Mostrar botón menú principal
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: " " },
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú principal" } }
]
}
}
});
}

/* ------------------ MENÚ PRINCIPAL REAL ------------------- */
export async function sendMenuPrincipal(to) {

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una opción:" },
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos 🥓" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos & Catering 🍽️" } },
{ type: "reply", reply: { id: "BTN_ZONAS", title: "Zonas de reparto 🚚" } },
{ type: "reply", reply: { id: "BTN_WEB", title: "Web 🌐" } },
{ type: "reply", reply: { id: "BTN_IG", title: "Instagram 📸" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido 📝" } }
]
}
}
});
}

/* ------------------ CATEGORÍAS ------------------- */
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
"Salame Tipo Alpino (Ahumado)",
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

/* ------------------ MENÚ DE PRODUCTOS ------------------- */
export async function sendMenuProductos(to) {

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría:" },
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

/* ------------------ PRODUCTOS DE UNA CATEGORÍA ------------------- */
export async function sendProductosDeCategoria(to, cat) {
const lista = CATEGORIAS[cat];
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

/* ------------------ IMAGEN DE PRODUCTO ------------------- */
export async function sendProductoImagen(to, producto) {
const url = IMAGENES[producto];

if (!url) {
return send({
messaging_product: "whatsapp",
to,
text: { body: "No encontré la imagen cargada para ese producto 😕" }
});
}

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: url } },
body: { text: `Producto: *${producto}*` },
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú principal" } }
]
}
}
});
}

/* ------------------ IA ------------------- */
export async function replyIA(to, msg) {
const r = await procesarMensajeIA(msg);
return send({ messaging_product: "whatsapp", to, text: { body: r }});
}

