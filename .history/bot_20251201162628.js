// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

// ======================================================
// CONFIG
// ======================================================
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

const LOGO_URL = process.env.LOGO_URL || IMAGENES.LOGO;
const WEB_URL = process.env.WEB_URL || "https://www.nuevomunich.com.ar";
const CATALOG_URL = process.env.CATALOG_URL || "https://www.nuevomunich.com.ar/catalogo.pdf";

// Teléfono ventas
export const VENTAS_PHONE = process.env.VENTAS_PHONE || "5493517010545";

// ======================================================
// FUNCIÓN PARA ENVIAR MENSAJES
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
image: { link: LOGO_URL },
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
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú" } },
{ type: "reply", reply: { id: "INICIO_PEDIDO", title: "Pedido" } }
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
body: { text: "Elegí una opción:" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "Food truck" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "Catálogo" } }
],
},
},
};

await enviarMensaje(data);
}

// ======================================================
// CATEGORÍAS PRODUCTOS
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
{ id: "CAT_SALCHICHAS", title: "Salchichas" },
{ id: "CAT_ESPECIALIDADES", title: "Especialidades" }
],
},
],
},
},
};

await enviarMensaje(data);
}

// ======================================================
// SUBCATEGORÍA
// ======================================================
export async function sendSubcategoria(to, categoriaID) {
let lista = [];
let titulo = "";

if (categoriaID === "CAT_FETEADOS") {
lista = CATEGORIAS.FETEADOS;
titulo = "Feteados";
} else if (categoriaID === "CAT_SALAMES") {
lista = CATEGORIAS.SALAMES;
titulo = "Salames y picadas";
} else if (categoriaID === "CAT_SALCHICHAS") {
lista = CATEGORIAS.SALCHICHAS;
titulo = "Salchichas artesanales";
} else if (categoriaID === "CAT_ESPECIALIDADES") {
lista = CATEGORIAS.ESPECIALIDADES;
titulo = "Especialidades";
}

if (!lista || !lista.length) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "Aún no hay productos cargados en esta categoría." },
});
return;
}

// Introducción
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `${titulo}\nEstos son nuestros productos:` },
});

// Enviar cada producto
for (const nombre of lista) {
await sendProducto(to, nombre);
}
}

// ======================================================
// ENVIAR PRODUCTO (1–5 imágenes)
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

for (const url of urls.slice(0, 5)) {
const data = {
messaging_product: "whatsapp",
to,
type: "image",
image: { link: url },
};
await enviarMensaje(data);
}

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
`${nombreProducto}\n\n` +
"Si querés sumar este producto a tu pedido, usá la opción *Pedido*.",
},
});
}

// ======================================================
// FOODTRUCK
// ======================================================
export async function sendFoodTruck(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Food Truck / Eventos\n\n" +
"Ofrecemos catering, mesas frías y servicio gastronómico.\n" +
`Consultas: https://wa.me/${VENTAS_PHONE}`,
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
caption: "Catálogo completo Nuevo Munich",
},
});
}

// ======================================================
// NUEVO — MENU PEDIDO
// ======================================================
export async function sendMenuPedido(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Pedido" },
body: { text: "Elegí cómo querés continuar:" },
action: {
button: "Opciones",
sections: [
{
title: "Pedido",
rows: [
{ id: "PEDIDO_INICIAR", title: "Realizar pedido" },
{ id: "CHAT_VENTAS", title: "Hablar con ventas" },
],
},
],
},
},
};

await enviarMensaje(data);
}

// ======================================================
// REALIZAR PEDIDO → SOLICITAR DATOS
// ======================================================
export async function pedirDatosDelCliente(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Perfecto, iniciamos tu pedido.\n\n" +
"Enviá por favor:\n" +
"• Nombre y apellido\n" +
"• Qué productos querés\n" +
"• Fecha del pedido / evento\n" +
"• Ubicación (podés enviar ubicación por WhatsApp)\n\n" +
"Apenas envíes todo, lo derivo a ventas.",
},
});
}

// ======================================================
// CHAT DIRECTO CON VENTAS
// ======================================================
export async function sendChatVentas(to) {
const numero = VENTAS_PHONE;

const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text: "Te conecto ahora mismo con nuestro equipo de ventas:",
},
action: {
buttons: [
{
type: "url",
url: `https://wa.me/${numero}`,
title: "Abrir chat con ventas",
},
],
},
},
};

await enviarMensaje(data);
}

// ======================================================
// RESUMEN FINAL DEL PEDIDO
// ======================================================
export async function sendPedidoConfirmacionCliente(to, resumen) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Tu pedido quedó así:\n\n" +
`${resumen}\n\n` +
"Ya lo envié a ventas. ¡Gracias!",
},
});

await enviarMensaje({
messaging_product: "whatsapp",
to: VENTAS_PHONE,
type: "text",
text: {
body:
"NUEVO PEDIDO:\n\n" +
`${resumen}\n\n` +
`Responder al cliente: https://wa.me/${to}`,
},
});
}

// ======================================================
// IA — RESPUESTAS GENERALES
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
