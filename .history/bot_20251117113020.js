import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { PRODUCTOS } from "./imagenes.js";

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// ============================================
// FUNCIÓN GENERAL PARA ENVIAR MENSAJES
// ============================================
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// ============================================
// 1) BIENVENIDA
// ============================================
export async function sendBienvenida(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: {
text: `*Nuevo Munich 🥨*
Artesanos del Sabor desde 1972.

https://nuevomunich.com.ar`
},
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "Leer más 📖" } },
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú Principal 📋" } }
]
}
}
});
}

// ============================================
// 2) TEXTO AMPLIADO
// ============================================
export async function sendLeerMas(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body: `*Artesanos del Sabor*
Desde 1972 mantenemos recetas de origen austríaco transmitidas de generación en generación.

Hoy seguimos honrando ese legado en cada elaboración 🤎

👉 Tocá *Menú Principal* para ver todas las opciones.`
}
});
}

// ============================================
// 3) MENÚ PRINCIPAL
// ============================================
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "*Menú Principal*" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "Productos 🥓" } },
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "Food Truck 🚚" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "Catálogo 📘" } },
{ type: "reply", reply: { id: "CONSULTAR_PEDIDO", title: "Consultar Pedido 📝" } }
]
}
}
});
}

// ============================================
// 4) CATEGORÍAS DE PRODUCTOS
// ============================================
export async function sendCategoriaProductos(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría:" },
action: {
buttons: [
{ type: "reply", reply: { id: "FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "SALCHICHAS", title: "Salchichas Alemanas" } },
{ type: "reply", reply: { id: "ESPECIALIDADES", title: "Especialidades" } }
]
}
}
});
}

// ============================================
// 5) SUBCATEGORÍAS → PRODUCTO
// ============================================
export async function sendSubcategoria(to, categoria) {
const lista = PRODUCTOS[categoria];
if (!lista) return;

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: `Elegí un producto:` },
action: {
buttons: lista.map(p => ({
type: "reply",
reply: { id: `PROD_${p.nombre}`, title: p.nombre }
}))
}
}
});
}

// ============================================
// 6) MOSTRAR PRODUCTO (IMAGEN + BOTÓN MENÚ)
// ============================================
export async function sendProducto(to, nombre) {
const prod = Object.values(PRODUCTOS).flat().find(
p => p.nombre.toLowerCase() === nombre.toLowerCase()
);

if (!prod) {
return send({
messaging_product: "whatsapp",
to,
text: { body: "No encontré ese producto 😕" }
});
}

// Imagen
await send({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: prod.img }
});

// Descripción + botón menú
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: `*${prod.nombre}*\n${prod.desc}` },
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menu Principal 📋" } }
]
}
}
});
}

// ============================================
// 7) CATÁLOGO PDF
// ============================================
export async function sendCatalogoCompleto(to) {
return send({
messaging_product: "whatsapp",
to,
document: {
link: "https://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view?usp=sharing",
caption: "Catálogo Completo Nuevo Munich 📘"
}
});
}

// ============================================
// 8) FOOD TRUCK
// ============================================
export async function sendFoodTruck(to) {
return send({
messaging_product: "whatsapp",
to,
text: { body: "🚚 *Food Truck Nuevo Munich*\nConsultanos fechas y disponibilidad." }
});
}

// ============================================
// 9) CONSULTAR PEDIDO
// ============================================
export async function sendConsultarPedido(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
"📝 *Consultá tu pedido*\n\nDecime tu nombre completo y qué producto te interesa."
}
});
}
