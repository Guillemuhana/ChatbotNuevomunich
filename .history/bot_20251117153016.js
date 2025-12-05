import axios from "axios";
import { IMAGENES, SUBCATEGORIAS } from "./imagenes.js";

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// ==============================================
// FUNCIONES BASE
// ==============================================
async function enviarMensaje(data) {
try {
const url = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;
const res = await axios.post(url, data, {
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${TOKEN}`,
},
});
console.log("⬆️ Enviado:", res.status);
} catch (e) {
console.log("❌ ERROR EN ENVÍO:", e.response?.data || e);
}
}

export async function enviarMensajeTexto(to, text) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: text },
});
}

// ==============================================
// BIENVENIDA
// ==============================================
export async function sendBienvenida(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text:
"Bienvenidos a Nuevo Munich 🥨\n" +
"Artesanos del sabor desde 1972.\n" +
"🌐 https://nuevomunich.com.ar\n\n" +
"Elegí una opción",
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
});
}

// ==============================================
// LEER MÁS
// ==============================================
export async function sendLeerMas(to) {
await enviarMensajeTexto(
to,
"Somos Nuevo Munich 🥨\nMás de 50 años elaborando productos artesanales.\n¿En qué podemos ayudarte?"
);
}

// ==============================================
// MENÚ PRINCIPAL
// ==============================================
export async function sendMenuPrincipal(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una opción del menú:" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "🛒 Productos" } },
{ type: "reply", reply: { id: "FOOD_TRUCK", title: "🚚 Food Truck / Eventos" } },
{ type: "reply", reply: { id: "CONSULTAR_PEDIDO", title: "📦 Realizar Pedido" } },
{ type: "reply", reply: { id: "CATALOGO_PDF", title: "📄 Catálogo Completo" } },
],
},
},
});
}

// ==============================================
// CATEGORÍAS
// ==============================================
export async function sendCategoriaProductos(to) {
await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una categoría:" },
action: {
buttons: [
{ type: "reply", reply: { id: "FETEADOS", title: "🥩 Feteados" } },
{ type: "reply", reply: { id: "SALAMES", title: "🍖 Salames" } },
{ type: "reply", reply: { id: "SALCHICHAS", title: "🌭 Salchichas" } },
{ type: "reply", reply: { id: "ESPECIALIDADES", title: "⭐ Especialidades" } },
],
},
},
});
}

// ==============================================
// SUBCATEGORÍAS
// ==============================================
export async function sendSubcategoria(to, categoria) {
const sub = SUBCATEGORIAS[categoria];
if (!sub) return enviarMensajeTexto(to, "No hay subcategorías para esta opción.");

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: categoria },
body: { text: "Elegí un producto:" },
action: {
button: "Ver productos",
sections: [
{
title: "Productos",
rows: sub.map((p) => ({
id: "PROD_" + p.id,
title: p.nombre,
})),
},
],
},
},
});
}

// ==============================================
// PRODUCTO FINAL — MUESTRA FOTO
// ==============================================
export async function sendProducto(to, id) {
const img = IMAGENES[id];
if (!img) return enviarMensajeTexto(to, "❌ No encontré la imagen del producto.");

await enviarMensaje({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: img },
});

await enviarMensajeTexto(to, "📋 Volver al menú: escribí *menu*");
}

// ==============================================
// FOOD TRUCK
// ==============================================
export async function sendFoodTruck(to) {
await enviarMensajeTexto(to, "🚚 Servicio de Food Truck.\nConsultanos para tu evento.");
}

// ==============================================
// CONSULTAR PEDIDO
// ==============================================
export async function sendConsultarPedido(to) {
await enviarMensajeTexto(to, "📦 Para realizar un pedido, escribinos qué deseas comprar.");
}

// ==============================================
// PEDIDO — FUNCIÓN NUEVA
// ==============================================
export async function manejarPedido(to, mensaje) {
await enviarMensajeTexto(
to,
"📝 Recibí tu pedido:\n" +
mensaje +
"\n\nUn asesor se comunicará con vos para confirmarlo."
);
}