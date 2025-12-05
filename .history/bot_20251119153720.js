// bot.js
import axios from "axios";
import { IMAGENES, CATEGORIAS } from "./imagenes.js";
import dotenv from "dotenv";
dotenv.config();

// ⚠️ En .env deben existir ESTAS variables:
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID; // ej: 830967510102571
const TOKEN = process.env.WHATSAPP_TOKEN; // tu token largo

const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

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
console.error(
"❌ ERROR EN ENVÍO:",
error.response?.data || error.message
);
}
}

/* ======================================================
🔹 BIENVENIDA (TARJETA INICIAL)
====================================================== */
export async function sendBienvenida(to) {
const texto =
"Bienvenidos a Nuevo Munich 🥨\n" +
"Artesanos del sabor desde 1972.\n" +
"🌐 https://nuevomunich.com.ar\n\n" +
"Elegí una opción";

const data = {
messaging_product: "whatsapp",
to,
type: "image",
image: {
link: IMAGENES.LOGO,
caption: texto,
},
};

await enviarMensaje(data);

// Botones Leer más / Menú principal
const botones = {
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

await enviarMensaje(botones);
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
"Somos una empresa familiar con tradición alemana desde 1972.\n" +
"Elaboramos embutidos y especialidades artesanales, y ofrecemos catering y Food Truck para eventos.\n\n" +
"Cuando quieras, tocá *Menú principal* para ver todas las opciones.",
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
body: { text: "Seleccioná una opción del menú 👇" },
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
reply: { id: "CATALOGO_PDF", title: "📄 Catálogo Completo" },
},
],
},
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 MENÚ → CATEGORÍAS DE PRODUCTOS
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
🔹 SUBCATEGORÍA → LISTA DE PRODUCTOS
(el usuario elige y luego mostramos IMAGEN)
====================================================== */
export async function sendSubcategoria(to, categoriaID) {
let categoriaNombre = "";
let productos = [];

if (categoriaID === "CAT_FETEADOS") {
categoriaNombre = "Feteados";
productos = CATEGORIAS.FETEADOS;
} else if (categoriaID === "CAT_SALAMES") {
categoriaNombre = "Salames / Picadas";
productos = CATEGORIAS.SALAMES;
} else if (categoriaID === "CAT_SALCHICHAS") {
categoriaNombre = "Salchichas";
productos = CATEGORIAS.SALCHICHAS;
} else if (categoriaID === "CAT_ESPECIALIDADES") {
categoriaNombre = "Especialidades";
productos = CATEGORIAS.ESPECIALIDADES;
}

if (!productos || productos.length === 0) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "No encontré productos en esta categoría." },
});
return;
}

const rows = productos.slice(0, 30).map((nombre) => ({
id: `PROD_${nombre}`,
title: nombre,
}));

const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: categoriaNombre },
body: { text: "Elegí un producto para ver la imagen 👇" },
action: {
button: "Ver productos",
sections: [
{
title: categoriaNombre,
rows,
},
],
},
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 ENVIAR PRODUCTO (IMAGEN + TEXTO)
====================================================== */
export async function sendProducto(to, nombreProducto) {
const urlImagen = IMAGENES[nombreProducto];

if (!urlImagen) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
`No encontré la imagen de *${nombreProducto}*.\n` +
"Podés ver todo nuestro catálogo en https://nuevomunich.com.ar",
},
});
return;
}

// 1) Imagen del producto
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "image",
image: {
link: urlImagen,
caption: `🛒 ${nombreProducto}`,
},
});

// 2) Botón para volver al menú principal
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "¿Querés seguir mirando opciones?" },
action: {
buttons: [
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" },
},
],
},
},
});
}

/* ======================================================
🔹 FOOD TRUCK / EVENTOS
====================================================== */
export async function sendFoodTruck(to) {
const body =
"🚚 *Food Truck / Eventos*\n\n" +
"Hacemos catering, mesas frías y servicio para eventos empresariales, cumpleaños y reuniones.\n\n" +
"Para coordinar detalles podés escribir a nuestro WhatsApp de ventas:\n" +
"📲 +54 9 3517 01-0545";

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body },
});
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
link: "https://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view",
caption: "📄 Catálogo Completo Nuevo Munich",
},
};

await enviarMensaje(data);
}

/* ======================================================
🔹 FLUJO DE PEDIDO
- iniciarPedido → cuando toca “Realizar Pedido”
- manejarPedido → paso a paso por texto
====================================================== */

const estadosPedido = {}; // { [numero]: { paso, datos } }

export async function iniciarPedido(to) {
estadosPedido[to] = {
paso: "nombre",
datos: {},
};

const body =
"📦 *Vamos a tomar tus datos para el pedido*\n\n" +
"1️⃣ Decime tu *nombre y apellido*.";

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body },
});
}

export async function manejarPedido(to, msg) {
const estado = estadosPedido[to];

// Si no hay pedido en curso, no hacemos nada
if (!estado) return false;

const texto = (msg || "").trim();
if (!texto) return true;

if (estado.paso === "nombre") {
estado.datos.nombre = texto;
estado.paso = "telefono";

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "2️⃣ Pasame tu *teléfono de contacto*." },
});
return true;
}

if (estado.paso === "telefono") {
estado.datos.telefono = texto;
estado.paso = "email";

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "3️⃣ Si querés, dejá tu *email* (o escribí - para saltear)." },
});
return true;
}

if (estado.paso === "email") {
estado.datos.email = texto === "-" ? "" : texto;
estado.paso = "ubicacion";

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "4️⃣ Indicá la *ubicación / zona* de entrega." },
});
return true;
}

if (estado.paso === "ubicacion") {
estado.datos.ubicacion = texto;
estado.paso = "detalle";

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"5️⃣ Contame el *detalle del pedido* (productos, cantidades, fecha aproximada, etc.).",
},
});
return true;
}

if (estado.paso === "detalle") {
estado.datos.detalle = texto;
estado.paso = "fin";

const ventasNumero = "5493517010545";

const resumen =
"✅ *Resumen de tu consulta de pedido:*\n\n" +
`• Nombre: ${estado.datos.nombre}\n` +
`• Teléfono: ${estado.datos.telefono}\n` +
(estado.datos.email ? `• Email: ${estado.datos.email}\n` : "") +
`• Ubicación: ${estado.datos.ubicacion}\n` +
`• Detalle: ${estado.datos.detalle}\n\n`;

const textoWA = encodeURIComponent(
`Hola, soy ${estado.datos.nombre} y quiero consultar este pedido:\n\n` +
`Teléfono: ${estado.datos.telefono}\n` +
(estado.datos.email ? `Email: ${estado.datos.email}\n` : "") +
`Ubicación: ${estado.datos.ubicacion}\n\n` +
`Detalle:\n${estado.datos.detalle}`
);

const linkWhatsApp = `https://wa.me/${ventasNumero}?text=${textoWA}`;

const body =
resumen +
"📲 Para coordinar y confirmar el pedido podés escribir directamente a nuestro WhatsApp de ventas:\n" +
`👉 ${linkWhatsApp}\n\n` +
"Cuando quieras, podés volver al *Menú principal* para seguir viendo productos.";

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body },
});

// limpiamos estado y mostramos menú
delete estadosPedido[to];
await sendMenuPrincipal(to);

return true;
}

return true;
}

