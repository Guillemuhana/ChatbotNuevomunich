import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

// -------------------------------------
// CONFIG
// -------------------------------------
const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const WEB = "https://nuevomunich.com.ar";

// Sesiones
export const sessions = new Map();

// -------------------------------------
// CATEGORÍAS
// -------------------------------------
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

// -------------------------------------
// FUNCIÓN PARA ENVIAR MENSAJES
// -------------------------------------
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// -------------------------------------
// MENÚ PRINCIPAL (COMPLETO Y CORRECTO)
// -------------------------------------
export async function sendMenuPrincipal(to) {
// 1) Logo arriba
await send({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: LOGO }
});

// 2) Tarjeta con botón LEER MÁS (solo 1 botón permitido)
await send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text: `¡Hola Nuevo Munich 🥨!\nArtesanos del sabor desde 1972.\n\n${WEB}`
},
action: {
buttons: [
{
type: "reply",
reply: { id: "LEER_MAS", title: "Leer más 📖" }
}
]
}
}
});

// 3) Bloque aparte con 3 botones del menú
await send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una opción:" },
action: {
buttons: [
{
type: "reply",
reply: { id: "BTN_PRODUCTOS", title: "Productos 🥓" }
},
{
type: "reply",
reply: { id: "BTN_EVENTOS", title: "Eventos & Catering 🍽️" }
},
{
type: "reply",
reply: { id: "BTN_PEDIDO", title: "Hacer Pedido 📝" }
}
]
}
}
});
}

// -------------------------------------
// DESCRIPCIÓN AMPLIADA
// -------------------------------------
export async function sendDescripcionAmpliada(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body: `*Artesanos del Sabor*

Fue en *1972* cuando los primeros dueños, de origen austríaco, trajeron sus recetas heredadas de generaciones y generaciones de sabores centroeuropeos.

Hoy mantenemos ese legado en cada elaboración.

👉 Escribí *Menú* para volver al inicio.`
}
});
}

// -------------------------------------
// MENÚ DE CATEGORÍAS
// -------------------------------------
export async function sendProductosMenu(to) {
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

// -------------------------------------
// LISTA DE PRODUCTOS DE UNA CATEGORÍA
// -------------------------------------
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
buttons: lista.slice(0, 3).map(prod => ({
type: "reply",
reply: { id: `PROD_${prod}`, title: prod }
}))
}
}
});
}

// -------------------------------------
// IMAGEN DEL PRODUCTO
// -------------------------------------
export async function sendProductoImagen(to, producto) {
const url = IMAGENES[producto];

if (!url) {
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
image: { link: url }
});
}

// -------------------------------------
// RESPUESTA CON IA
// -------------------------------------
export async function replyIA(to, msg) {
const r = await procesarMensajeIA(msg);
return send({
messaging_product: "whatsapp",
to,
text: { body: r }
});
}

