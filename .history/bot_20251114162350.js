// ======================================================
// BOT OFICIAL — NUEVO MUNICH
// ======================================================

import axios from "axios";
import dotenv from "dotenv";
import { IMAGENES } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

dotenv.config();

// ------------------------
// CONFIG
// ------------------------
const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

export const sessions = new Map();

// ------------------------
// LOGO Y LINKS
// ------------------------
const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const WEB = "https://nuevomunich.com.ar";
const CATALOGO = "https://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view";

// ------------------------
// FUNCIÓN GENERAL WHATSAPP
// ------------------------
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }
});
}

// ======================================================
// MENSAJE DE BIENVENIDA (CON LOGO)
// ======================================================
export async function sendBienvenida(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: LOGO }
},
body: {
text: `*Bienvenidos a Nuevo Munich 🥨*\nArtesanos del sabor desde 1972.\n\n🌐 ${WEB}`
},
footer: { text: "Elegí una opción" },
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "📖 Leer más" } },
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" } }
]
}
}
});
}

// ======================================================
// DESCRIPCIÓN AMPLIADA
// ======================================================
export async function sendDescripcionAmpliada(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
`*Artesanos del Sabor*\n\n` +
`Fue en *1972* cuando los primeros dueños, de origen austríaco, ` +
`trajeron sus recetas heredadas de generaciones y generaciones ` +
`de sabores centroeuropeos.\n\n` +
`Hoy mantenemos ese legado en cada elaboración.\n\n` +
`👉 Escribí *Menú* para volver al inicio.`
}
});
}

// ======================================================
// MENÚ PRINCIPAL COMPLETO
// ======================================================
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Nuevo Munich 🥨" },
body: { text: "Elegí una opción del menú principal:" },
footer: { text: "Seleccioná para continuar" },
action: {
button: "Ver opciones",
sections: [
{
title: "Nuestros productos",
rows: [
{ id: "MENU_PRODUCTOS", title: "🍽️ Productos" },
{ id: "MENU_CATALOGO", title: "📄 Catálogo PDF" }
]
},
{
title: "Servicios",
rows: [
{ id: "MENU_EVENTOS", title: "🎉 Food Truck / Eventos" }
]
},
{
title: "Contacto",
rows: [
{ id: "MENU_CONTACTO", title: "📞 Contacto" },
{ id: "MENU_PEDIDO", title: "📝 Realizar Pedido" }
]
}
]
}
}
});
}

// ======================================================
// CATEGORÍAS DE PRODUCTOS
// ======================================================
export const CATEGORIAS = {
FETEADOS: [
"Bondiola",
"Jamón Cocido",
"Jamón Cocido Tipo Bávaro",
"Lomo Cocido",
"Lomo Ahumado a las Finas Hierbas",
"Panceta Ahumada",
"Panceta Salada Ahumada"
],
SALAMES: [
"Salame Holstein",
"Salame Tipo Alpino",
"Salame Tipo Colonia",
"Salchichón Ahumado"
],
SALCHICHAS: [
"Salchicha Viena",
"Salchicha Frankfurt",
"Salchicha Húngara",
"Salchicha Knackwurst",
"Rosca Polaca"
]
};

// ======================================================
// MENÚ DE PRODUCTOS (LISTA)
// ======================================================
export async function sendMenuProductos(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Productos Nuevo Munich" },
body: { text: "Seleccioná una categoría:" },
action: {
button: "Ver categorías",
sections: [
{
title: "Categorías",
rows: [
{ id: "CAT_FETEADOS", title: "🥓 Feteados" },
{ id: "CAT_SALAMES", title: "🍖 Salames" },
{ id: "CAT_SALCHICHAS", title: "🌭 Salchichas Alemanas" }
]
}
]
}
}
});
}

// ======================================================
// LISTA DE PRODUCTOS DENTRO DE UNA CATEGORÍA
// ======================================================
export async function sendProductosDeCategoria(to, categoria) {
const lista = CATEGORIAS[categoria];
if (!lista) return;

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: categoria },
body: { text: "Elegí un producto para ver su imagen:" },
action: {
button: "Ver productos",
sections: [
{
title: "Productos",
rows: lista.map(p => ({
id: `PROD_${p}`,
title: p
}))
}
]
}
}
});
}

// ======================================================
// IMAGEN DE PRODUCTO
// ======================================================
export async function sendProductoImagen(to, producto) {
const url = IMAGENES[producto];

if (!url) {
return send({
messaging_product: "whatsapp",
to,
text: { body: "❌ No encontré la imagen de ese producto." }
});
}

// Mandar imagen
await send({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: url }
});

// Botón para volver al menú
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "¿Querés seguir viendo opciones?" },
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" } }
]
}
}
});
}

// ======================================================
// CATÁLOGO
// ======================================================
export async function sendCatalogoInfo(to) {
return send({
messaging_product: "whatsapp",
to,
text: { body: `📄 *Catálogo completo*: \n${CATALOGO}` }
});
}

// ======================================================
// EVENTOS
// ======================================================
export async function sendEventosInfo(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
"🎉 *Food Truck & Eventos*\n\n" +
"Llevamos el auténtico sabor centroeuropeo a tu evento.\n\n" +
"Consultanos para cumpleaños, empresas o eventos especiales."
}
});
}

// ======================================================
// CONTACTO
// ======================================================
export async function sendContactoInfo(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
"📞 *Contacto Nuevo Munich*\n" +
"Email: info@nuevomunich.com.ar\n" +
"Web: https://nuevomunich.com.ar"
}
});
}

// ======================================================
// PEDIDO — INICIO
// ======================================================
export async function iniciarPedido(user) {
sessions.set(user, { paso: "NOMBRE" });

return send({
messaging_product: "whatsapp",
to: user,
text: { body: "📝 *Vamos a armar tu pedido*\n\n¿Tu nombre y apellido?" }
});
}

// ======================================================
// FLUJO DEL PEDIDO
// ======================================================
export async function flujoPedido(user, msg) {
const s = sessions.get(user);
if (!s) return;

// nombre
if (s.paso === "NOMBRE") {
s.nombre = msg;
s.paso = "TELEFONO";

return send({ messaging_product: "whatsapp", to: user, text: { body: "📱 ¿Tu teléfono?" } });
}

// telefono
if (s.paso === "TELEFONO") {
s.telefono = msg;
s.paso = "UBICACION";
return send({ messaging_product: "whatsapp", to: user, text: { body: "📍 ¿Dónde se entrega el pedido?" } });
}

// ubicación
if (s.paso === "UBICACION") {
s.ubicacion = msg;
s.paso = "DETALLE";
return send({ messaging_product: "whatsapp", to: user, text: { body: "🧾 ¿Qué te gustaría pedir?" } });
}

// pedido
if (s.paso === "DETALLE") {
s.detalle = msg;
s.paso = "CONFIRMAR";

return send({
messaging_product: "whatsapp",
to: user,
type: "interactive",
interactive: {
type: "button",
body: {
text:
"📝 *Confirmá tu pedido*\n\n" +
`👤 *Nombre:* ${s.nombre}\n` +
`📱 *Tel:* ${s.telefono}\n` +
`📍 *Ubicación:* ${s.ubicacion}\n` +
`🧾 *Pedido:* ${s.detalle}\n\n¿Confirmamos?`
},
action: {
buttons: [
{ type: "reply", reply: { id: "PEDIDO_OK", title: "✅ Confirmar" } },
{ type: "reply", reply: { id: "PEDIDO_CANCEL", title: "❌ Cancelar" } }
]
}
}
});
}
}

// ======================================================
// CONFIRMAR PEDIDO
// ======================================================
export async function confirmarPedido(user, accion) {
const s = sessions.get(user);
if (!s) return;

if (accion === "PEDIDO_OK") {
await send({
messaging_product: "whatsapp",
to: user,
text: { body: "✅ ¡Gracias! Tu pedido quedó registrado. Pronto nos contactaremos." }
});
} else {
await send({
messaging_product: "whatsapp",
to: user,
text: { body: "❌ Pedido cancelado. Podés hacer uno nuevo cuando quieras." }
});
}

sessions.delete(user);
return sendMenuPrincipal(user);
}

// ======================================================
// IA fallback
// ======================================================
export async function replyIA(to, msg) {
const r = await procesarMensajeIA(msg);
return send({ messaging_product: "whatsapp", to, text: { body: r } });
}

