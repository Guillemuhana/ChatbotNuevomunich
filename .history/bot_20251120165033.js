// bot.js
import axios from "axios";
import { IMAGENES, CATEGORIAS } from "./imagenes.js";

const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

const LOGO_URL = process.env.LOGO_URL;
const WEB_URL = process.env.WEB_URL;
const CATALOG_URL = process.env.CATALOG_URL;
const VENTAS_PHONE = "5493517010545"; // número de ventas

/* ======================================================
🔹 FUNCIÓN BASE PARA ENVIAR MENSAJES
====================================================== */
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

/* ======================================================
🔹 BIENVENIDA (UN SOLO BLOQUE CON LOGO + BOTONES)
====================================================== */
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
"Bienvenidos a Nuevo Munich 🥨\n" +
"Artesanos del sabor desde 1972.\n" +
`🌐 ${WEB_URL}\n\n` +
"Elegí una opción 👇",
},
action: {
buttons: [
{
type: "reply",
reply: { id: "LEER_MAS", title: "📖 Leer más" },
},
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" },
},
],
},
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 LEER MÁS
====================================================== */
export async function sendLeerMas(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"Somos una empresa familiar con raíces alemanas y más de 50 años de historia.\n" +
"Elaboramos productos artesanales, picadas y realizamos catering y eventos.\n\n" +
"Usá el *Menú principal* para seguir navegando 👇",
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 MENÚ PRINCIPAL
====================================================== */
export async function sendMenuPrincipal(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una opción 👇" },
action: {
buttons: [
{
type: "reply",
reply: { id: "CAT_PRODUCTOS", title: "🛒 Productos" },
},
{
type: "reply",
reply: { id: "FOOD_TRUCK", title: "🚚 Food Truck / Eventos" },
},
{
type: "reply",
reply: { id: "CONSULTAR_PEDIDO", title: "📦 Realizar Pedido" },
},
{
type: "reply",
reply: { id: "CATALOGO_PDF", title: "📄 Catálogo completo" },
},
],
},
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 LISTA DE CATEGORÍAS DE PRODUCTOS
====================================================== */
export async function sendCategoriaProductos(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Productos Nuevo Munich" },
body: { text: "Elegí una categoría 👇" },
action: {
button: "Ver categorías",
sections: [
{
title: "Productos",
rows: [
{ id: "CAT_FETEADOS", title: "🥩 Feteados" },
{ id: "CAT_SALAMES", title: "🧀 Salames / Picadas" },
{ id: "CAT_SALCHICHAS", title: "🌭 Salchichas" },
{ id: "CAT_ESPECIALIDADES", title: "🍖 Especialidades" },
],
},
],
},
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 SUBCATEGORÍA → CARRUSEL DE PRODUCTOS (CATALOG MESSAGE)
====================================================== */
export async function sendSubcategoria(to, categoriaID) {
let lista = [];

if (categoriaID === "CAT_FETEADOS") lista = CATEGORIAS.FETEADOS;
if (categoriaID === "CAT_SALAMES") lista = CATEGORIAS.SALAMES;
if (categoriaID === "CAT_SALCHICHAS") lista = CATEGORIAS.SALCHICHAS;
if (categoriaID === "CAT_ESPECIALIDADES") lista = CATEGORIAS.ESPECIALIDADES;

// WhatsApp limita la cantidad de productos, tomamos hasta 10
const productos = lista.slice(0, 10);

const items = productos.map((nombre) => ({
id: `PROD_${nombre}`, // ID que después recibimos en el webhook
name: nombre,
image_url: IMAGENES[nombre],
}));

const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "product",
body: { text: "Seleccioná un producto 👇" },
action: {
sections: [
{
title: "Productos",
product_items: items,
},
],
},
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 PRODUCTO INDIVIDUAL (IMAGEN + TEXTO)
====================================================== */
export async function sendProducto(to, nombreProducto) {
const urlImagen = IMAGENES[nombreProducto];

const data = {
messaging_product: "whatsapp",
to,
type: "image",
image: {
link: urlImagen,
caption: `🛒 ${nombreProducto}\n\nSi querés pedirlo, elegí *Realizar Pedido* en el menú principal.`,
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 FOOD TRUCK / EVENTOS
====================================================== */
export async function sendFoodTruck(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"🚚 *Food Truck / Eventos*\n\n" +
"Ofrecemos catering, mesas frías y servicio para eventos.\n\n" +
`Para coordinar escribinos al número de ventas:\nhttps://wa.me/${VENTAS_PHONE}`,
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 CONSULTAR / REALIZAR PEDIDO
====================================================== */
export async function sendConsultarPedido(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"📦 *Realizar Pedido*\n\n" +
"Podés armar tu pedido viendo los productos en el menú.\n\n" +
`Cuando lo tengas listo, mandanos un mensaje directo al número de ventas:\nhttps://wa.me/${VENTAS_PHONE}`,
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 CATÁLOGO COMPLETO (PDF)
====================================================== */
export async function sendCatalogoCompleto(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: CATALOG_URL,
caption: "📄 Catálogo General Nuevo Munich",
},
};

await enviarMensaje(data);
}

