// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

// --------------------------------------------------
// CONFIG WHATSAPP
// --------------------------------------------------
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

export const VENTAS_PHONE = "5493517010545"; // WhatsApp del equipo comercial

const LOGO_URL = process.env.LOGO_URL || IMAGENES.LOGO;
const WEB_URL = process.env.WEB_URL || "https://www.nuevomunich.com.ar";
const CATALOG_URL = process.env.CATALOG_URL || "https://www.nuevomunich.com.ar/catalogo.pdf";

// --------------------------------------------------
// FUNCIÓN BASE PARA ENVIAR MENSAJES
// --------------------------------------------------
async function enviarMensaje(data) {
try {
await axios.post(WHATSAPP_API_URL, data, {
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${TOKEN}`
}
});
} catch (error) {
console.error("❌ ERROR EN ENVÍO:", error.response?.data || error.message);
}
}

// --------------------------------------------------
// BIENVENIDA (LOGO + BOTONES)
// --------------------------------------------------
export async function sendBienvenida(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO_URL } },
body: {
text:
"Bienvenidos a Nuevo Munich 👋\n" +
"Artesanos del sabor desde 1972.\n" +
`Web: ${WEB_URL}\n\n` +
"Elegí una opción:"
},
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú" } },
{ type: "reply", reply: { id: "CHAT_VENTAS", title: "Chat con ventas" } }
]
}
}
});
}

// --------------------------------------------------
// MENÚ PRINCIPAL
// --------------------------------------------------
export async function sendMenuPrincipal(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una opción:" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "Food Truck" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "Catálogo" } }
]
}
}
});
}

// --------------------------------------------------
// CHAT CON VENTAS DIRECTO
// --------------------------------------------------
export async function sendChatConVentas(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"📞 *Contacto directo con ventas*\n\n" +
`Hacé clic acá para hablar con un asesor:\nhttps://wa.me/${VENTAS_PHONE}\n\n` +
"¿Querés ver el *Menú*? Escribí *Menú*."
}
});
}

// --------------------------------------------------
// CATEGORÍAS
// --------------------------------------------------
export async function sendCategoriaProductos(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Productos Nuevo Munich" },
body: { text: "Elegí una categoría:" },
action: {
button: "Ver",
sections: [
{
title: "Categorías",
rows: [
{ id: "CAT_FETEADOS", title: "Feteados" },
{ id: "CAT_SALAMES", title: "Salames / Picadas" },
{ id: "CAT_SALCHICHAS", title: "Salchichas Alemanas" },
{ id: "CAT_ESPECIALIDADES", title: "Especialidades" }
]
}
]
}
}
});
}

// --------------------------------------------------
// SUBCATEGORÍA
// --------------------------------------------------
export async function sendSubcategoria(to, categoriaID) {
let lista = [];
let titulo = "";

if (categoriaID === "CAT_FETEADOS") {
lista = CATEGORIAS.FETEADOS || [];
titulo = "Feteados";
} else if (categoriaID === "CAT_SALAMES") {
lista = CATEGORIAS.SALAMES || [];
titulo = "Salames y picadas";
} else if (categoriaID === "CAT_SALCHICHAS") {
lista = CATEGORIAS.SALCHICHAS || [];
titulo = "Salchichas Alemanas";
} else if (categoriaID === "CAT_ESPECIALIDADES") {
lista = CATEGORIAS.ESPECIALIDADES || [];
titulo = "Especialidades";
}

if (!lista.length) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "No hay productos cargados todavía." }
});
return;
}

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `${titulo}\nAquí tenés nuestros productos:` }
});

for (const nombre of lista) {
await sendProducto(to, nombre);
}
}

// --------------------------------------------------
// PRODUCTO → IMÁGENES + EXPLICACIÓN IA
// --------------------------------------------------
export async function sendProducto(to, nombreProducto) {
const entry = IMAGENES[nombreProducto];

if (!entry) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `No encontré imágenes para "${nombreProducto}".` }
});
return;
}

const urls = Array.isArray(entry) ? entry : [entry];

for (const url of urls.slice(0, 5)) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: url }
});
}

const explicacion = await procesarMensajeIA(
`Explicá el producto "${nombreProducto}" de Nuevo Munich:
- Descripción gourmet
- Receta express
- 2 combinaciones recomendadas
- Consejo profesional`
);

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
`🛒 *${nombreProducto}*\n\n${explicacion}\n\n` +
`Si querés hablar con un asesor:\nhttps://wa.me/${VENTAS_PHONE}`
}
});
}

// --------------------------------------------------
// FOOD TRUCK
// --------------------------------------------------
export async function sendFoodTruck(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"🚚 *Food Truck y eventos*\n\n" +
"Ofrecemos catering, mesas frías y servicio para eventos.\n\n" +
`Consultas directas a ventas:\nhttps://wa.me/${VENTAS_PHONE}`
}
});
}

// --------------------------------------------------
// CATÁLOGO
// --------------------------------------------------
export async function sendCatalogoCompleto(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: CATALOG_URL,
caption: "Catálogo general Nuevo Munich"
}
});
}

// --------------------------------------------------
// INICIO PEDIDO
// --------------------------------------------------
export async function sendInicioPedidoOpciones(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "¿Cómo querés continuar?" },
action: {
buttons: [
{ type: "reply", reply: { id: "CHAT_VENTAS", title: "Chat con ventas" } },
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú" } }
]
}
}
});
}

// --------------------------------------------------
// PASO 2 PEDIDO
// --------------------------------------------------
export async function pedirDatosDelCliente(to, tipo) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
`Perfecto, iniciamos un pedido ${tipo}.\n\n` +
"Enviame por favor:\n" +
"• Nombre completo\n" +
"• Fecha (compra o evento)\n" +
"• Ubicación\n" +
"• Detalle del pedido"
}
});
}

// --------------------------------------------------
// CONFIRMACIÓN PEDIDO
// --------------------------------------------------
export async function sendPedidoConfirmacionCliente(to, resumen) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Tu pedido quedó así:\n\n" +
`${resumen}\n\n` +
"Lo derivamos al equipo de ventas. ¡Gracias!"
}
});

// Aviso interno a ventas
await enviarMensaje({
messaging_product: "whatsapp",
to: VENTAS_PHONE,
type: "text",
text: {
body:
"📩 NUEVO PEDIDO:\n\n" +
`${resumen}\n\n` +
`Responder al cliente:\nhttps://wa.me/${to}`
}
});
}

// --------------------------------------------------
// RESPUESTA IA
// --------------------------------------------------
export async function sendRespuestaIA(to, mensajeUsuario) {
const respuesta = await procesarMensajeIA(mensajeUsuario);

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: respuesta }
});
}

