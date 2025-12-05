import axios from "axios";
import dotenv from "dotenv";
import { IMAGENES } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

dotenv.config();

// --- CONFIG ---
const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// LOGO Y LINK
const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// --- Categorías ---
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
"Salchicha Viena",
"Salchicha Frankfurt",
"Salchicha Húngara",
"Salchicha Knackwurst",
"Rosca Polaca"
]
};

// ====================================
// FUNCTION → SEND BASICO
// ====================================
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// ====================================
// TARJETA DE BIENVENIDA (MENÚ PRINCIPAL)
// ====================================
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",

header: { type: "image", image: { link: LOGO } },

body: {
text: `¡Hola Nuevo Munich 🥨!\nArtesanos del sabor desde 1972.`
},

footer: {
text: "Leer más 📖"
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

// ====================================
// DESCRIPCIÓN AMPLIADA
// ====================================
export async function sendDescripcionAmpliada(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body: `*Artesanos del Sabor*\n
Fue en 1972 cuando los primeros dueños, de origen austríaco, trajeron sus recetas heredadas de generaciones y generaciones de sabores centroeuropeos.
Hoy mantenemos ese legado en cada elaboración.\n
👉 Escribí *Menú* para volver al inicio.`
}
});
}

// ====================================
// MENÚ DE CATEGORÍAS
// ====================================
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

// ====================================
// MOSTRAR LOS PRODUCTOS DE UNA CATEGORÍA
// ====================================
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

// ====================================
// MOSTRAR IMAGEN DEL PRODUCTO
// ====================================
export async function sendProductoImagen(to, nombre) {
const url = IMAGENES[nombre];

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

// ====================================
// IA (Fallback)
// ====================================
export async function replyIA(to, texto) {
const respuesta = await procesarMensajeIA(texto);

return send({
messaging_product: "whatsapp",
to,
text: { body: respuesta }
});
}

