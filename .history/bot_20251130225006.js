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

const LOGO_URL = process.env.LOGO_URL || IMAGENES.LOGO;
const WEB_URL = process.env.WEB_URL || "https://www.nuevomunich.com.ar";
const CATALOG_URL = process.env.CATALOG_URL || "https://www.nuevomunich.com.ar/catalogo.pdf";

// número del equipo de ventas
export const VENTAS_PHONE = "5493517010545";

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
// BIENVENIDA (LOGO + 2 BOTONES: MENÚ / PEDIDO)
// --------------------------------------------------
export async function sendBienvenida(to) {
await enviarMensaje({
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
"Bienvenidos a Nuevo Munich\n" +
"Artesanos del sabor desde 1972.\n" +
`Web: ${WEB_URL}\n\n` +
"Elegí una opción:"
},
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú" } },
{ type: "reply", reply: { id: "INICIO_PEDIDO", title: "Pedido" } }
]
}
}
});
}

// --------------------------------------------------
// MENÚ PRINCIPAL (3 BOTONES)
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
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "Food truck" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "Catálogo" } }
]
}
}
});
}

// --------------------------------------------------
// CATEGORÍAS (LIST INTERACTIVE)
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
{ id: "CAT_SALAMES", title: "Salames / picadas" },
{ id: "CAT_SALCHICHAS", title: "Salchichas" },
{ id: "CAT_ESPECIALIDADES", title: "Especialidades" }
]
}
]
}
}
});
}

// --------------------------------------------------
// SUBCATEGORÍA → ENVÍA TODOS LOS PRODUCTOS DE ESA CATEGORÍA
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
text: { body: "No hay productos cargados en esta categoría por el momento." }
});
return;
}

// Mensaje de introducción
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `${titulo}\nEstos son nuestros productos:` }
});

// Enviar productos uno por uno (imágenes + explicación IA)
for (const nombre of lista) {
await sendProducto(to, nombre);
}
}

// --------------------------------------------------
// PRODUCTO → ENVÍA IMÁGENES + TEXTO IA DEL PRODUCTO
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

// Enviar hasta 5 imágenes
for (const url of urls.slice(0, 5)) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: url }
});
}

// Pedimos a la IA que explique este producto como vendedor + chef
const explicacion = await procesarMensajeIA(
`Explicale al cliente el producto "${nombreProducto}" de Nuevo Munich.
Hacé:
- Descripción gourmet breve
- 1 receta express
- 2 combinaciones recomendadas (panes, quesos, cervezas, guarniciones, etc.)
- 1 consejo profesional
Respondé en un solo mensaje, de forma cálida y cercana.`
);

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
`🛒 ${nombreProducto}\n\n` +
explicacion +
`\n\nSi querés incluir este producto en tu pedido, podés usar el botón *Pedido* del menú o escribirnos a:\nhttps://wa.me/${VENTAS_PHONE}`
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
"Food truck / eventos\n\n" +
"Ofrecemos catering, mesas frías y servicio para eventos especiales.\n\n" +
`Consultas al WhatsApp de ventas:\nhttps://wa.me/${VENTAS_PHONE}`
}
});
}

// --------------------------------------------------
// CATÁLOGO PDF
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
// INICIO DE PEDIDO – ENVÍA OPCIONES
// --------------------------------------------------
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
{ id: "PEDIDO_FOODTRUCK", title: "Food truck" }
]
}
]
}
}
});
}

// --------------------------------------------------
// PEDIR DATOS DEL CLIENTE (PASO 2)
// --------------------------------------------------
export async function pedirDatosDelCliente(to, tipo) {
const tipoLindo = tipo.replace("_", " ");

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
`Perfecto, iniciamos un pedido ${tipoLindo}.\n\n` +
"Enviame por favor:\n" +
"• Nombre completo\n" +
"• Fecha (compra o evento)\n" +
"• Ubicación (podés enviar ubicación por WhatsApp)\n" +
"• Detalle del pedido\n\n" +
"Cuando me envíes todo, armo el resumen y lo mando a ventas. 😊"
}
});
}

// --------------------------------------------------
// CONFIRMACIÓN FINAL DEL PEDIDO (PASO 3)
// --------------------------------------------------
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
"Lo derivamos ahora mismo al equipo de ventas. ¡Gracias por elegir Nuevo Munich!"
}
});

// Mensaje al número de ventas
await enviarMensaje({
messaging_product: "whatsapp",
to: VENTAS_PHONE,
type: "text",
text: {
body:
"📩 NUEVO PEDIDO DESDE EL BOT:\n\n" +
`${resumen}\n\n` +
`Responder al cliente: https://wa.me/${to}`
}
});
}

// --------------------------------------------------
// RESPUESTA IA PARA CUALQUIER OTRA COSA
// --------------------------------------------------
export async function sendRespuestaIA(to, mensajeUsuario) {
const respuesta = await procesarMensajeIA(mensajeUsuario || "");

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: respuesta }
});
}
