// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

// ======================================================
// CONFIG WHATSAPP
// ======================================================
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

// Logo, web, catálogo
const LOGO_URL = process.env.LOGO_URL || IMAGENES.LOGO;
const WEB_URL = process.env.WEB_URL || "https://www.instagram.com/nuevomunich";
const CATALOG_URL =
process.env.CATALOG_URL ||
"https://drive.google.com/file/d/10ZSG_B0pC8j0jVv9Z0p0lGUT02Enr2wu/view";

// Número del equipo de ventas
export const VENTAS_PHONE = process.env.VENTAS_PHONE || "5493517010545";

// ======================================================
// FUNCIÓN BASE PARA ENVIAR MENSAJES
// ======================================================
async function enviarMensaje(data) {
try {
await axios.post(WHATSAPP_API_URL, data, {
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${TOKEN}`,
},
});
} catch (error) {
console.error("❌ ERROR EN ENVÍO:", error.response?.data || error.message);
}
}

// ======================================================
// BIENVENIDA (CON LOGO + 3 BOTONES)
// ======================================================
export async function sendBienvenida(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: LOGO_URL },
},
body: {
text:
"Bienvenidos a *Nuevo Munich* 🥨\n" +
"Artesanos del sabor desde 1972.\n\n" +
`Instagram: ${WEB_URL}\n\n` +
"Elegí una opción:",
},
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú" } },
{ type: "reply", reply: { id: "INICIO_PEDIDO", title: "Pedido" } },
{
type: "reply",
reply: { id: "CHAT_VENTAS", title: "Chat ventas" },
},
],
},
},
};

await enviarMensaje(data);
}

// ======================================================
// MENÚ PRINCIPAL
// ======================================================
export async function sendMenuPrincipal(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Menú principal, elegí una opción:" },
action: {
buttons: [
{
type: "reply",
reply: { id: "CAT_PRODUCTOS", title: "Productos" },
},
{
type: "reply",
reply: { id: "FOOD_TRUCK", title: "Food truck" },
},
{
type: "reply",
reply: { id: "CATALOGO_PDF", title: "Catálogo" },
},
{
type: "reply",
reply: { id: "CHAT_VENTAS", title: "Chat ventas" },
},
],
},
},
};

await enviarMensaje(data);
}

// ======================================================
// CHAT DIRECTO CON VENTAS
// ======================================================
export async function sendChatVentas(to) {
const linkVentas = `https://wa.me/${VENTAS_PHONE}?text=Hola%20Nuevo%20Munich%2C%20quiero%20hablar%20con%20ventas`;
const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Te paso el WhatsApp del equipo de ventas 👇\n\n" +
`👉 ${linkVentas}\n\n` +
"Podés escribirles directamente para precios, listas, pedidos grandes o acuerdos comerciales.",
},
};

await enviarMensaje(data);
}

// ======================================================
// CATEGORÍAS DE PRODUCTOS
// ======================================================
export async function sendCategoriaProductos(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Productos Nuevo Munich" },
body: { text: "Elegí una categoría:" },
action: {
button: "Ver categorías",
sections: [
{
title: "Categorías",
rows: [
{ id: "CAT_FETEADOS", title: "Feteados" },
{ id: "CAT_SALAMES", title: "Salames / picadas" },
{ id: "CAT_SALCHICHAS", title: "Salchichas alemanas" },
{ id: "CAT_ESPECIALIDADES", title: "Especialidades" },
],
},
],
},
},
};

await enviarMensaje(data);
}

// ======================================================
// SUBCATEGORÍAS → ENVÍA LISTA DE PRODUCTOS DE ESA CATEGORÍA
// ======================================================
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
titulo = "Salchichas alemanas";
} else if (categoriaID === "CAT_ESPECIALIDADES") {
lista = CATEGORIAS.ESPECIALIDADES || [];
titulo = "Especialidades";
}

if (!lista.length) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "Todavía no hay productos cargados en esta categoría." },
});
return;
}

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `*${titulo}*\nEstos son nuestros productos:` },
});

for (const nombre of lista) {
await sendProducto(to, nombre);
}
}

// ======================================================
// PRODUCTO → ENVÍA 1–N IMÁGENES + EXPLICACIÓN IA
// ======================================================
export async function sendProducto(to, nombreProducto) {
const entry = IMAGENES[nombreProducto];

if (!entry) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `No encontré imágenes para "${nombreProducto}".` },
});
return;
}

const urls = Array.isArray(entry) ? entry : [entry];

// Enviar hasta 5 imágenes
for (const url of urls.slice(0, 5)) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: url },
});
}

// Descripción gourmet automática con IA
const descripcion = await procesarMensajeIA(
`El cliente está viendo el producto "${nombreProducto}".
Explicalo como vendedor + chef de Nuevo Munich.
Incluí:
- descripción gourmet
- 1 receta express
- 2 combinaciones recomendadas (panes, quesos, bebidas, salsas)
- 1 consejo profesional de servicio o conservación.`
);

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body: descripcion,
},
});

// Recordatorio de menú y ventas
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Si querés seguir viendo opciones escribí *Menú* o tocá el botón correspondiente.\n" +
"Y si preferís hablar directamente con una persona, elegí *Chat ventas*.",
},
});
}

// ======================================================
// FOOD TRUCK / EVENTOS
// ======================================================
export async function sendFoodTruck(to) {
const body =
"🚚 *Food truck y eventos*\n\n" +
"Podés contratar nuestros productos para eventos, fiestas, empresas y servicios gastronómicos.\n\n" +
"Te ayudamos a elegir la mejor combinación de salchichas alemanas, feteados y especialidades según la cantidad de personas.\n\n" +
"Para coordinar detalles finales, hablá con ventas desde *Chat ventas* del menú o por el WhatsApp de ventas.";

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body },
});
}

// ======================================================
// CATÁLOGO PDF
// ======================================================
export async function sendCatalogoCompleto(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: CATALOG_URL,
caption: "📄 Catálogo general Nuevo Munich",
},
});
}

// ======================================================
// INICIO DE PEDIDO – OPCIÓN FORMULARIO O CHAT VENTAS
// ======================================================
export async function sendInicioPedidoOpciones(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Nuevo pedido" },
body: { text: "¿Cómo querés continuar?" },
action: {
button: "Elegir",
sections: [
{
title: "Opciones de pedido",
rows: [
{ id: "FORM_PEDIDO", title: "Formulario de pedido" },
{ id: "CHAT_VENTAS", title: "Chat directo con ventas" },
],
},
],
},
},
});
}

// ======================================================
// FORMULARIO DE PEDIDO (PASO 2)
// ======================================================
export async function pedirDatosDelCliente(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Perfecto, armemos tu pedido.\n\n" +
"Por favor enviá *en un solo mensaje* estos datos:\n" +
"• Nombre y apellido\n" +
"• Teléfono de contacto\n" +
"• Productos y cantidades aproximadas\n" +
"• Fecha de compra o evento\n" +
"• Zona / localidad\n\n" +
"Cuando lo envíes, escribí al final la palabra *CONFIRMAR*.",
},
});
}

// ======================================================
// CONFIRMACIÓN FINAL PEDIDO (PASO 3)
// ======================================================
export async function sendPedidoConfirmacionCliente(to, resumen) {
// mensaje al cliente
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"📦 Tu pedido se ve así:\n\n" +
`${resumen}\n\n` +
"Lo derivamos ahora mismo al equipo de ventas. Ellos se contactan con vos para confirmar precios y detalles. 🙌",
},
});

// mensaje a ventas
await enviarMensaje({
messaging_product: "whatsapp",
to: VENTAS_PHONE,
type: "text",
text: {
body:
"🆕 *NUEVO PEDIDO DESDE EL BOT*\n\n" +
`${resumen}\n\n` +
`Cliente: https://wa.me/${to}`,
},
});
}

// ======================================================
// RESPUESTA IA GENERAL
// ======================================================
export async function sendRespuestaIA(to, mensajeUsuario) {
// Si el usuario pregunta por ventas / precios, reforzamos venta humana
const lower = (mensajeUsuario || "").toLowerCase();
if (
lower.includes("precio") ||
lower.includes("lista") ||
lower.includes("presupuesto") ||
lower.includes("vender") ||
lower.includes("venta") ||
lower.includes("vendedor") ||
lower.includes("hablar con alguien") ||
lower.includes("persona") ||
lower.includes("asesor")
) {
await sendChatVentas(to);
return;
}

const respuesta = await procesarMensajeIA(mensajeUsuario || "");

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: respuesta },
});

}

// ======================================================
// CHAT DIRECTO CON EL EQUIPO DE VENTAS
// ======================================================
export async function sendChatVentas(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text:
"Podés hablar directamente con nuestro equipo de ventas.\n\n" +
"¿Querés continuar?"
},
action: {
buttons: [
{
type: "url",
url: `https://wa.me/${VENTAS_PHONE}`,
title: "Abrir WhatsApp Ventas"
}
]
}
}
};

await enviarMensaje(data);
}
