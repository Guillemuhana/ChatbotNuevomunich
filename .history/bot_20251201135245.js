// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

// ======================================================
// CONFIG GLOBAL
// ======================================================
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

const LOGO_URL = process.env.LOGO_URL || IMAGENES.LOGO;
const WEB_URL = process.env.WEB_URL || "https://www.nuevomunich.com.ar";
const CATALOG_URL = process.env.CATALOG_URL;

export const VENTAS_PHONE = "5493517010545";

// ======================================================
// FUNCIÓN BASE PARA ENVIAR MENSAJES
// ======================================================
async function enviarMensaje(data) {
try {
await axios.post(WHATSAPP_API_URL, data, {
headers: {
Authorization: `Bearer ${TOKEN}`,
"Content-Type": "application/json",
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
"Bienvenidos a *Nuevo Munich* 🇩🇪\nTradición artesanal desde 1972.\n\n" +
`🌐 Web: ${WEB_URL}\n\nElegí una opción:`,
},
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú" } },
{ type: "reply", reply: { id: "INICIO_PEDIDO", title: "Pedido" } },
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
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "Catálogo" } },
],
},
},
});
}

// ======================================================
// CHAT CON VENTAS (nuevo)
// ======================================================
export async function sendChatConVentas(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"📞 *Contacto directo con ventas*\n\n" +
"Podés escribir ahora mismo al equipo comercial:\n" +
`👉 https://wa.me/${VENTAS_PHONE}\n\n` +
"¿En qué más puedo ayudarte?",
},
});
}

// ======================================================
// CATEGORÍAS
// ======================================================
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
{ id: "CAT_SALAMES", title: "Salames" },
{ id: "CAT_SALCHICHAS", title: "Salchichas" },
{ id: "CAT_ESPECIALIDADES", title: "Especialidades" },
],
},
],
},
},
});
}

// ======================================================
// SUBCATEGORÍAS
// ======================================================
export async function sendSubcategoria(to, categoriaID) {
const grupos = {
CAT_FETEADOS: { lista: CATEGORIAS.FETEADOS, titulo: "Feteados" },
CAT_SALAMES: { lista: CATEGORIAS.SALAMES, titulo: "Salames y picadas" },
CAT_SALCHICHAS: { lista: CATEGORIAS.SALCHICHAS, titulo: "Salchichas" },
CAT_ESPECIALIDADES: {
lista: CATEGORIAS.ESPECIALIDADES,
titulo: "Especialidades",
},
};

const grupo = grupos[categoriaID];

if (!grupo || !grupo.lista.length) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "No hay productos cargados en esta categoría." },
});
return;
}

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `*${grupo.titulo}*\nEstos son nuestros productos:` },
});

for (const nombre of grupo.lista) {
await sendProducto(to, nombre);
}
}

// ======================================================
// PRODUCTO INDIVIDUAL
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
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: url },
});
}

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
`*${nombreProducto}*\n\n` +
"Si querés incluir este producto en tu pedido, usá el botón *Pedido* del menú.",
},
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
"Catering, picadas, mesas frías y servicio para fiestas.\n\n" +
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
document: { link: CATALOG_URL, caption: "Catálogo Nuevo Munich" },
});
}

// ======================================================
// PEDIDO
// ======================================================
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
{ type: "reply", reply: { id: "PEDIDO_FORMULARIO", title: "Hacer pedido" } },
{ type: "reply", reply: { id: "CHAT_VENTAS", title: "Chat con ventas" } },
],
},
},
});
}

export async function pedirDatosDelCliente(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Perfecto, iniciemos tu pedido.\n\n" +
"Por favor enviá:\n" +
"• Nombre completo\n" +
"• Fecha (compra o evento)\n" +
"• Ubicación\n" +
"• Lista de productos\n\n" +
"Cuando me envíes todo, armo el resumen.",
},
});
}

export async function sendPedidoConfirmacionCliente(to, resumen) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: `Tu pedido quedó así:\n\n${resumen}\n\nLo paso al equipo de ventas.` },
});

await enviarMensaje({
messaging_product: "whatsapp",
to: VENTAS_PHONE,
type: "text",
text: {
body:
"📦 *NUEVO PEDIDO DESDE EL BOT*\n\n" +
`${resumen}\n\nResponder al cliente: https://wa.me/${to}`,
},
});
}

// ======================================================
// RESPUESTA IA
// ======================================================
export async function sendRespuestaIA(to, mensajeUsuario) {
const respuesta = await procesarMensajeIA(mensajeUsuario);
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: respuesta },
});
}

