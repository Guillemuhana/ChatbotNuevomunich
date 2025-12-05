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

// Web y catálogo
const WEB_URL = process.env.WEB_URL || "https://www.nuevomunich.com.ar";
const CATALOG_URL = process.env.CATALOG_URL || "https://www.nuevomunich.com.ar/catalogo.pdf";

// Número del equipo de ventas
export const VENTAS_PHONE = "5493517010545";

// ======================================================
// FUNCIÓN GENERAL PARA ENVIAR MENSAJES
// ======================================================
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

// ======================================================
// BIENVENIDA
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
image: { link: LOGO_URL }
},
body: {
text:
"Bienvenidos a *Nuevo Munich*\nTradición artesanal desde 1972.\n\n" +
`🌐 Web: ${WEB_URL}\n\nElegí una opción para comenzar:`
},
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú" } },
{ type: "reply", reply: { id: "INICIO_PEDIDO", title: "Pedido" } }
]
}
}
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
body: { text: "Elegí una opción:" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "Food truck" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "Catálogo" } }
]
}
}
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
};

await enviarMensaje(data);
}

// ======================================================
// SUBCATEGORÍAS → ENVÍA PRODUCTOS
// ======================================================
export async function sendSubcategoria(to, categoriaID) {
let lista = [];
let titulo = "";

const map = {
CAT_FETEADOS: { lista: CATEGORIAS.FETEADOS, titulo: "Feteados" },
CAT_SALAMES: { lista: CATEGORIAS.SALAMES, titulo: "Salames y picadas" },
CAT_SALCHICHAS: { lista: CATEGORIAS.SALCHICHAS, titulo: "Salchichas Alemanas" },
CAT_ESPECIALIDADES: { lista: CATEGORIAS.ESPECIALIDADES, titulo: "Especialidades" }
};

if (map[categoriaID]) {
lista = map[categoriaID].lista;
titulo = map[categoriaID].titulo;
}

if (!lista?.length) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "No hay productos cargados en esta categoría por el momento." }
});
return;
}

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `*${titulo}*\nEstos son nuestros productos:` }
});

for (const nombre of lista) {
await sendProducto(to, nombre);
}

// botón volver al menú
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "¿Querés ver algo más?" },
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Volver al menú" } }
]
}
}
});
}

// ======================================================
// PRODUCTO → IMÁGENES + IA
// ======================================================
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

// IA automáticA DESCRIBE el producto
const descripcion = await procesarMensajeIA(nombreProducto);

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: descripcion }
});
}

// ======================================================
// FOOD TRUCK
// ======================================================
export async function sendFoodTruck(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"🚚 *Food Truck & Eventos*\n\n" +
"• Servicios para fiestas y empresas\n" +
"• Mesas frías\n" +
"• Picadas artesanales\n" +
"• Cocina alemana\n\n" +
`Contacto directo: https://wa.me/${VENTAS_PHONE}`
}
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
caption: "Catálogo General Nuevo Munich"
}
});
}

// ======================================================
// INICIO DE PEDIDO
// ======================================================
export async function sendInicioPedidoOpciones(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Nuevo Pedido" },
body: { text: "Elegí cómo querés continuar:" },
action: {
button: "Elegir",
sections: [
{
title: "Opciones",
rows: [
{ id: "REALIZAR_PEDIDO", title: "Hacer un pedido" },
{ id: "CHAT_VENTAS", title: "Hablar con ventas" }
]
}
]
}
}
});
}

// ======================================================
// PEDIR DATOS DEL CLIENTE
// ======================================================
export async function pedirDatosDelCliente(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Perfecto ✨\nPara avanzar enviame:\n\n" +
"• Nombre completo\n" +
"• Fecha del pedido / evento\n" +
"• Ubicación (podés enviar ubicación por WhatsApp)\n" +
"• Detalle del pedido\n\n" +
"Cuando lo envíes preparo el resumen final."
}
});
}

// ======================================================
// CONFIRMACIÓN DE PEDIDO
// ======================================================
export async function sendPedidoConfirmacionCliente(to, resumen) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"*Tu pedido quedó así:*\n\n" +
`${resumen}\n\n` +
"Lo envío ahora mismo al equipo de ventas. ¡Gracias por elegirnos!"
}
});

await enviarMensaje({
messaging_product: "whatsapp",
to: VENTAS_PHONE,
type: "text",
text: {
body:
"📦 *NUEVO PEDIDO DESDE EL BOT*\n\n" +
`${resumen}\n\n` +
`Responder al cliente: https://wa.me/${to}`
}
});
}

// ======================================================
// CHAT DIRECTO CON VENTAS
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
"Perfecto 👌\nAquí tenés el acceso directo para hablar ahora mismo con un representante de ventas."
},
action: {
buttons: [
{ type: "reply", reply: { id: "ABRIR_CHAT_VENTAS", title: "Abrir chat" } }
]
}
}
};

await enviarMensaje(data);

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body: `👉 Chat directo: https://wa.me/${VENTAS_PHONE}`
}
});
}

// ======================================================
// RESPUESTA IA GENERAL
// ======================================================
export async function sendRespuestaIA(to, mensajeUsuario) {
const respuesta = await procesarMensajeIA(mensajeUsuario || "");

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: respuesta }
});
}
// ======================================================
// CHAT DIRECTO CON VENTAS
// ======================================================
export async function sendChatVentas(to) {
const numero = process.env.VENTAS_PHONE || "5493517010545";

const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text:
"Te comunico ahora mismo con nuestro equipo de ventas para atención personalizada.",
},
action: {
buttons: [
{
type: "url",
url: `https://wa.me/${numero}`,
title: "Abrir chat con ventas"
}
]
}
}
};

await enviarMensaje(data);
}