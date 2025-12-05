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

// Logo (desde .env o desde IMAGENES.LOGO)
const LOGO_URL = process.env.LOGO_URL || IMAGENES.LOGO;

// Web y catálogo (fallback por si falta en .env)
const WEB_URL = process.env.WEB_URL || "https://www.nuevomunich.com.ar";
const CATALOG_URL =
process.env.CATALOG_URL || "https://www.nuevomunich.com.ar/catalogo.pdf";

// Número del equipo de ventas
export const VENTAS_PHONE = "5493517010545";

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
// BIENVENIDA (CON LOGO + 2 BOTONES)
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
image: {
link: LOGO_URL,
},
},
body: {
text:
"Bienvenidos a Nuevo Munich\n" +
"Artesanos del sabor desde 1972.\n" +
`Web: ${WEB_URL}\n\n` +
"Elegí una opción:",
},
action: {
buttons: [
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "Menú" },
},
{
type: "reply",
reply: { id: "INICIO_PEDIDO", title: "Pedido" },
},
],
},
},
};

await enviarMensaje(data);
}

// ======================================================
// MENÚ PRINCIPAL (3 BOTONES)
// ======================================================
export async function sendMenuPrincipal(to) {
const data = {
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
reply: { id: "CAT_PRODUCTOS", title: "Productos" },
},
{
type: "reply",
reply: { id: "INICIO_PEDIDO", title: "Pedido" },
},
{
type: "reply",
reply: { id: "INFO_GENERAL", title: "Info" },
},
],
},
},
};

await enviarMensaje(data);
}

// ======================================================
// BLOQUE INFORMACIÓN (LIST INTERACTIVE)
// ======================================================
export async function sendInfoGeneral(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Información Nuevo Munich" },
body: {
text:
"Podés consultar dirección, horarios, puntos de venta y servicios:",
},
action: {
button: "Ver opciones",
sections: [
{
title: "Información",
rows: [
{ id: "INFO_DIRECCION", title: "Dirección" },
{ id: "INFO_HORARIOS", title: "Horarios" },
{ id: "INFO_PUNTOS", title: "Puntos de venta" },
{ id: "FOOD_TRUCK", title: "Food truck / eventos" },
{ id: "CATALOGO_PDF", title: "Catálogo PDF" },
],
},
],
},
},
};

await enviarMensaje(data);
}

export async function sendInfoDireccion(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"📍 *Dirección de planta / fábrica*\n\n" +
"12 de Octubre 112\n" +
"Barrio Blas Parera – Guiñazú\n" +
"Córdoba, Argentina.\n\n" +
"Podés coordinar visitas o retiros con el equipo de ventas.",
},
});
}

export async function sendInfoHorarios(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"🕒 *Horarios habituales de atención*\n\n" +
"Lunes a viernes: 9 a 18 hs (aprox.)\n" +
"Sábados: según agenda y pedidos.\n\n" +
"Los horarios pueden variar en feriados o fechas especiales. " +
"Para confirmar, escribinos a ventas:\n" +
`https://wa.me/${VENTAS_PHONE}`,
},
});
}

export async function sendInfoPuntos(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"🛒 *Puntos de venta y distribuidores*\n\n" +
"Nuevo Munich trabaja con distintos comercios, hoteles, restaurantes y servicios de catering.\n\n" +
"Para conocer los puntos de venta actualizados y el distribuidor más cercano, " +
"escribinos al WhatsApp de ventas indicando tu zona:\n" +
`https://wa.me/${VENTAS_PHONE}`,
},
});
}

// ======================================================
// CATEGORÍAS (LIST INTERACTIVE)
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
button: "Ver",
sections: [
{
title: "Categorías",
rows: [
{ id: "CAT_FETEADOS", title: "Feteados" },
{ id: "CAT_SALAMES", title: "Salames / picadas" },
{ id: "CAT_SALCHICHAS", title: "Salchichas" },
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
// SUBCATEGORÍA → ENVÍA LOS PRODUCTOS DE ESA CATEGORÍA
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
text: { body: "No hay productos cargados en esta categoría por el momento." },
});
return;
}

// Mensaje de introducción
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `${titulo}\nEstos son nuestros productos:` },
});

// Enviar productos uno por uno
for (const nombre of lista) {
await sendProducto(to, nombre);
}

// Botoncito para volver al menú
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "¿Querés seguir navegando?" },
action: {
buttons: [
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "Menú" },
},
{
type: "reply",
reply: { id: "INICIO_PEDIDO", title: "Pedido" },
},
],
},
},
});
}

// ======================================================
// PRODUCTO → ENVÍA 1 O VARIAS IMÁGENES
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

// Puede ser string o array
const urls = Array.isArray(entry) ? entry : [entry];

// Enviamos hasta 5 imágenes para no saturar
for (const url of urls.slice(0, 5)) {
const dataImg = {
messaging_product: "whatsapp",
to,
type: "image",
image: {
link: url,
},
};
await enviarMensaje(dataImg);
}

// Mensaje final del producto
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
`${nombreProducto}\n\n` +
"Si querés incluir este producto en tu pedido, podés usar el botón *Pedido* del menú, " +
"o escribinos directamente a ventas:\n" +
`https://wa.me/${VENTAS_PHONE}`,
},
});
}

// ======================================================
// FOOD TRUCK / EVENTOS
// ======================================================
export async function sendFoodTruck(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"🚚 Food truck / eventos\n\n" +
"Ideal para ferias, fiestas, eventos corporativos y servicios especiales.\n\n" +
"Podemos armar mesas frías, superpanchos alemanes, picadas completas y propuestas a medida.\n\n" +
`Para coordinar fechas y disponibilidad, escribinos a ventas:\nhttps://wa.me/${VENTAS_PHONE}`,
},
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
caption: "Catálogo general Nuevo Munich",
},
});
}

// ======================================================
// INICIO DE PEDIDO – OPCIONES
// ======================================================
export async function sendInicioPedidoOpciones(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Nuevo pedido" },
body: { text: "Seleccioná el tipo de pedido:" },
action: {
button: "Elegir",
sections: [
{
title: "Tipo de pedido",
rows: [
{ id: "PEDIDO_PARTICULAR", title: "Particular" },
{ id: "PEDIDO_EVENTO", title: "Evento" },
{ id: "PEDIDO_EMPRESA", title: "Hotel / restaurante" },
{ id: "PEDIDO_FOODTRUCK", title: "Food truck" },
],
},
],
},
},
});
}

// ======================================================
// PEDIR DATOS DEL CLIENTE (PASO 2 PEDIDO)
// ======================================================
export async function pedirDatosDelCliente(to, tipo) {
const tipoLindo = tipo.replace("_", " ");

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
`Perfecto, iniciamos un pedido ${tipoLindo}.\n\n` +
"Por favor enviá:\n" +
"• Nombre completo\n" +
"• Fecha (compra o evento)\n" +
"• Ubicación (podés enviar ubicación por WhatsApp)\n" +
"• Detalle del pedido (productos, cantidades aproximadas, cantidad de personas)\n\n" +
"Cuando me envíes todo, armo el resumen para enviarlo a ventas.",
},
});
}

// ======================================================
// CONFIRMACIÓN FINAL PEDIDO (PASO 3)
// ======================================================
export async function sendPedidoConfirmacionCliente(to, resumen) {
// Mensaje al cliente
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Tu pedido quedó así:\n\n" +
`${resumen}\n\n` +
"Lo derivamos ahora mismo al equipo de ventas. ¡Gracias! 🙌",
},
});

// Mensaje al número de ventas
await enviarMensaje({
messaging_product: "whatsapp",
to: VENTAS_PHONE,
type: "text",
text: {
body:
"📩 *NUEVO PEDIDO DESDE EL BOT*\n\n" +
`${resumen}\n\n` +
`Responder al cliente: https://wa.me/${to}`,
},
});
}
// -------------------------------
// CONTACTO DIRECTO A VENTAS
// -------------------------------
const consultasVentas = [
"vendedor", "ventas", "representante", "asesor",
"buenrostro", "comercial", "hablar con alguien",
"contacto", "telefono", "whatsapp ventas",
"quiero comprar", "consulta comercial"
];

if (consultasVentas.some(p => lower.includes(p))) {
await enviarMensaje({
messaging_product: "whatsapp",
to: from,
type: "text",
text: {
body:
"📞 *Contacto directo con un representante de ventas*\n\n" +
`Podés escribir al WhatsApp oficial de ventas:\n` +
`👉 https://wa.me/${VENTAS_PHONE}\n\n` +
"Estamos para ayudarte cuando lo necesites 😊",
},
});
return res.sendStatus(200);
}
// ======================================================
// RESPUESTA IA (CUALQUIER OTRA COSA)
// ======================================================
export async function sendRespuestaIA(to, mensajeUsuario) {
const respuesta = await procesarMensajeIA(mensajeUsuario || "");

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: respuesta },
});
}
