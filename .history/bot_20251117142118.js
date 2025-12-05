import axios from "axios";
import { IMAGENES } from "./imagenes.js";

const token = process.env.WHATSAPP_TOKEN;
const phoneID = process.env.WHATSAPP_PHONE_ID;

// ==================================
// ENVIAR MENSAJE DE TEXTO
// ==================================
async function sendText(to, body) {
return axios.post(
`https://graph.facebook.com/v20.0/${phoneID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "text",
text: { body }
},
{
headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json"
}
}
);
}

// ==================================
// ENVIAR BOTONES
// ==================================
async function sendButtons(to, body, buttons) {
return axios.post(
`https://graph.facebook.com/v20.0/${phoneID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: body },
action: {
buttons
}
}
},
{
headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json"
}
}
);
}

// ==================================
// ENVIAR IMAGEN + BOTÓN
// ==================================
async function sendImage(to, link, text, buttonId) {
return axios.post(
`https://graph.facebook.com/v20.0/${phoneID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link } },
body: { text },
action: {
buttons: [
{
type: "reply",
reply: {
id: buttonId,
title: "Menú principal"
}
}
]
}
}
},
{
headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json"
}
}
);
}

// ==================================
// 1) BIENVENIDA
// ==================================
export async function sendBienvenida(to) {
return sendButtons(
to,
`Bienvenidos a Nuevo Munich 🥨\nArtesanos del sabor desde 1972.\n🌐 https://nuevomunich.com.ar\n\nElegí una opción`,
[
{
type: "reply",
reply: { id: "LEER_MAS", title: "📖 Leer más" }
},
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" }
}
]
);
}

// ==================================
// 2) LEER MÁS
// ==================================
export async function sendLeerMas(to) {
return sendButtons(
to,
"En 1972 los primeros dueños, de origen austríaco, trajeron recetas heredadas de generaciones.\n\nHoy mantenemos ese legado.",
[
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" }
}
]
);
}

// ==================================
// 3) MENÚ PRINCIPAL
// ==================================
export async function sendMenuPrincipal(to) {
return sendButtons(
to,
"Seleccioná una opción del menú:",
[
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "🍽 Productos" } },
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "🚚 Food Truck / Eventos" } },
{ type: "reply", reply: { id: "CONSULTAR_PEDIDO", title: "📝 Realizar Pedido" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "📄 Catálogo Completo" } }
]
);
}

// ==================================
// 4) CATEGORÍAS DE PRODUCTOS
// ==================================
export async function sendCategoriaProductos(to) {
return sendButtons(
to,
"Elegí una categoría:",
[
{ type: "reply", reply: { id: "FETEADOS", title: "🥩 Feteados" } },
{ type: "reply", reply: { id: "SALAMES", title: "🍖 Salames" } },
{ type: "reply", reply: { id: "SALCHICHAS", title: "🌭 Salchichas Alemanas" } },
{ type: "reply", reply: { id: "ESPECIALIDADES", title: "⭐ Especialidades" } }
]
);
}

// ==================================
// 5) SUBCATEGORÍAS / LISTADO
// ==================================
export async function sendSubcategoria(to, categoria) {
const items = IMAGENES[categoria];

let text = "Elegí un producto:\n\n";
items.forEach((p) => {
text += `• ${p.nombre}\n`;
});

return sendText(to, text);
}

// ==================================
// 6) MOSTRAR PRODUCTO (IMAGEN)
// ==================================
export async function sendProducto(to, nombre) {
let found = null;

Object.values(IMAGENES).forEach((arr) => {
arr.forEach((p) => {
if (p.nombre.toUpperCase() === nombre.toUpperCase()) {
found = p;
}
});
});

if (!found) {
return sendText(to, "No encontré ese producto 😕");
}

return sendImage(
to,
found.img,
`${found.nombre}\n${found.descripcion}`,
"MENU_PRINCIPAL"
);
}

// ==================================
// 7) FOOD TRUCK
// ==================================
export async function sendFoodTruck(to) {
return sendText(
to,
"🚚 *Food Truck y Eventos*\nOfrecemos catering, mesas frías y más.\nConsultanos para fechas disponibles."
);
}

// ==================================
// 8) CATÁLOGO PDF
// ==================================
export async function sendCatalogoCompleto(to) {
return sendText(
to,
"📄 *Catálogo Completo*\nPodés verlo aquí:\nhttps://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view"
);
}

// ==================================
// 9) CONSULTAR / HACER PEDIDO
// ==================================
const pedidos = {};

export async function sendConsultarPedido(to) {
pedidos[to] = { paso: "NOMBRE" };

return sendText(
to,
"📝 *Iniciemos tu pedido*\nPor favor escribime tu *nombre y apellido*:"
);
}

// MANEJO PASO A PASO DEL PEDIDO
export async function manejarPedido(to, msg) {
if (!pedidos[to]) return false;

const paso = pedidos[to].paso;

if (paso === "NOMBRE") {
pedidos[to].nombre = msg;
pedidos[to].paso = "DIRECCION";
return sendText(to, "Perfecto 👍\nAhora escribí tu *dirección o punto de entrega*:");
}

if (paso === "DIRECCION") {
pedidos[to].direccion = msg;
pedidos[to].paso = "DETALLE";
return sendText(to, "Genial 🙌\nAhora detallá tu *pedido* (productos y cantidades):");
}

if (paso === "DETALLE") {
pedidos[to].detalle = msg;
pedidos[to].paso = "FIN";
return sendResumenPedido(to);
}

return false;
}

// ==================================
// 10) RESUMEN DEL PEDIDO
// ==================================
export async function sendResumenPedido(to) {
const p = pedidos[to];
if (!p) return;

const resumen = `📦 *Resumen del pedido*\n
👤 Nombre: ${p.nombre}
📍 Dirección: ${p.direccion}
🛒 Pedido:
${p.detalle}

Un representante se comunicará para confirmar.`;

delete pedidos[to];

return sendText(to, resumen);
}

