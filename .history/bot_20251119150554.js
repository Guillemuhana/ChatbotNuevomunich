import {
sendBienvenida,
sendLeerMas,
sendMenuPrincipal,
sendCategoriaProductos,
sendSubcategoria,
sendProducto,
sendCatalogoCompleto
} from "./bot.js";

import { IMAGENES, CATEGORIAS, SUBCATEGORIAS } from "./imagenes.js";

dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// Datos de contacto y links
const WEB_URL = process.env.WEB_URL || "https://nuevomunich.com.ar";
const INSTAGRAM_URL =
process.env.INSTAGRAM_URL || "https://instagram.com/nuevomunich.oficial";
const CATALOGO_URL =
process.env.CATALOG_URL ||
"https://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view";

const NUMERO_VENTAS = "5493517010545"; // SIN +

// =============================
// AYUDA: ENVIAR MENSAJE GENÉRICO
// =============================
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// =============================
// 1) BIENVENIDA
// =============================
export async function sendBienvenida(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: IMAGENES.LOGO }
},
body: {
text:
`Bienvenidos a Nuevo Munich\n` +
`Artesanos del sabor desde 1972.\n` +
`🌐 ${WEB_URL}\n\n` +
`Elegí una opción`
},
action: {
buttons: [
{
type: "reply",
reply: { id: "LEER_MAS", title: "Leer más" }
},
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "Menú principal" }
}
]
}
}
});
}

// =============================
// 2) LEER MÁS
// =============================
export async function sendLeerMas(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
`*Artesanos del Sabor*\n\n` +
`Fue en 1972 cuando los primeros dueños, de origen austríaco, ` +
`trajeron sus recetas heredadas de generaciones y generaciones ` +
`de sabores centroeuropeos.\n\n` +
`Hoy mantenemos ese legado en cada elaboración.\n\n` +
`👉 Escribí *Menú* o tocá *Menú principal* para ver todas las opciones.`
}
});
}

// =============================
// 3) MENÚ PRINCIPAL (LISTA)
// =============================
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
body: {
text: "Menú principal\n\nElegí una opción:"
},
action: {
button: "Ver opciones",
sections: [
{
title: "Menú principal",
rows: [
{
id: "MENU_PRODUCTOS",
title: "Productos",
description: "Ver categorías de productos"
},
{
id: "MENU_FOODTRUCK",
title: "Food Truck / Eventos",
description: "Consultas para eventos y catering"
},
{
id: "MENU_CATALOGO",
title: "Catálogo completo (PDF)",
description: "Ver catálogo general"
},
{
id: "MENU_PEDIDO",
title: "Realizar pedido",
description: "Iniciar un pedido y luego hablar con ventas"
},
{
id: "MENU_ZONAS",
title: "Zonas de reparto",
description: "Consultar zonas y condiciones de entrega"
},
{
id: "MENU_WEB",
title: "Web oficial",
description: WEB_URL
},
{
id: "MENU_INSTAGRAM",
title: "Instagram",
description: INSTAGRAM_URL
}
]
}
]
}
}
});
}

// =============================
// 4) MENÚ → PRODUCTOS (categorías)
// =============================
export async function sendCategoriaProductos(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
body: {
text: "Seleccioná una categoría de productos:"
},
action: {
button: "Ver categorías",
sections: [
{
title: "Categorías",
rows: [
{
id: "CAT_FETEADOS",
title: "Feteados",
description: "Bondiola, jamones, lomos, pancetas, matambres…"
},
{
id: "CAT_SALAMES",
title: "Salames",
description: "Holstein, Alpino, Colonia, Salchichón…"
},
{
id: "CAT_SALCHICHAS",
title: "Salchichas Alemanas",
description: "Viena, Frankfurt, Húngara, Knackwurst, Weisswurst…"
},
{
id: "CAT_ESPECIALIDADES",
title: "Especialidades",
description: "Kassler, Leberkasse y más clásicos centroeuropeos"
}
]
}
]
}
}
});
}

// =============================
// 5) SUBCATEGORÍA → LISTA DE PRODUCTOS
// =============================
export async function sendSubcategoria(to, claveCategoria) {
const lista = CATEGORIAS[claveCategoria];
if (!lista || !Array.isArray(lista) || lista.length === 0) {
return send({
messaging_product: "whatsapp",
to,
text: { body: "No tengo productos cargados en esa categoría por el momento." }
});
}

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
body: {
text: "Elegí un producto para ver la imagen:"
},
action: {
button: "Ver productos",
sections: [
{
title: claveCategoria,
rows: lista.map((nombre) => ({
id: nombre, // usamos el nombre como ID
title: nombre,
description: "Ver imagen y descripción"
}))
}
]
}
}
});
}

// =============================
// 6) PRODUCTO → IMAGEN + BOTONES
// =============================
export async function sendProducto(to, nombreProducto) {
const url = IMAGENES[nombreProducto];
if (!url) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
"No encontré la imagen de ese producto 😕\n" +
"Podés volver al *Menú principal* y elegir otra opción."
}
});
}

// 1) Mandamos la imagen
await send({
messaging_product: "whatsapp",
to,
type: "image",
image: {
link: url,
caption: nombreProducto
}
});

// 2) Mandamos botones para seguir
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text:
`${nombreProducto}\n\n` +
`Si querés avanzar con este producto podés hablar con ventas, ` +
`o volver al menú principal.`
},
action: {
buttons: [
{
type: "reply",
reply: { id: "IR_A_VENTAS", title: "Hablar con ventas" }
},
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "Menú principal" }
}
]
}
}
});
}

// =============================
// 7) IR A VENTAS
// =============================
export async function sendIrAVentas(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
`Para finalizar la compra comunicate directamente con nuestro equipo de ventas:\n\n` +
`📞 +54 9 3517 01-0545\n` +
`https://wa.me/${NUMERO_VENTAS}`
}
});
}

// =============================
// 8) FOOD TRUCK / EVENTOS
// =============================
export async function sendFoodTruck(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
`FOOD TRUCK / EVENTOS\n\n` +
`Contamos con propuestas para fiestas, empresas y reuniones: ` +
`picadas, tablas calientes, salchichas alemanas y más.\n\n` +
`Podés contarnos fecha, tipo de evento y cantidad de personas `
+ `y te asesoramos.`
}
});
}

// =============================
// 9) CONSULTAR / REALIZAR PEDIDO
// =============================
export async function sendConsultarPedido(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
`Para armar tu pedido, por favor indicá:\n\n` +
`1️⃣ Nombre y apellido\n` +
`2️⃣ Teléfono de contacto\n` +
`3️⃣ Zona de entrega\n` +
`4️⃣ Productos y cantidades aproximadas\n\n` +
`Luego podés escribir *VENTAS* y te envío el número directo `
+ `de nuestro equipo comercial.`
}
});
}

// =============================
// 10) CATÁLOGO COMPLETO (PDF)
// =============================
export async function sendCatalogoCompleto(to) {
return send({
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: CATALOGO_URL,
caption: "Catálogo completo Nuevo Munich"
}
});
}

// =============================
// 11) ZONAS DE REPARTO
// =============================
export async function sendZonasReparto(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
`ZONAS DE REPARTO\n\n` +
`Trabajamos con reparto en Córdoba capital y alrededores. ` +
`Consultá disponibilidad y mínimos de compra según tu zona.\n\n` +
`Podés indicarme tu barrio y te confirmo.`
}
});
}

// =============================
// 12) WEB OFICIAL
// =============================
export async function sendWebOficial(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body: `Podés conocer más sobre nosotros en nuestra web oficial:\n\n${WEB_URL}`
}
});
}

// =============================
// 13) INSTAGRAM
// =============================
export async function sendInstagram(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
`Te invito a seguirnos en Instagram para ver novedades, recetas y promos:\n\n` +
`${INSTAGRAM_URL}`
}
});
}

