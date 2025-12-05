import axios from "axios";
import dotenv from "dotenv";
import { IMAGENES } from "./imagenes.js";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const LOGO = process.env.LOGO_URL;

// ---------- FUNCIÓN GENERAL PARA ENVIAR ----------
export async function send(payload) {
try {
const res = await axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
return res.data;
} catch (error) {
console.log("❌ ERROR ENVÍO:", error?.response?.data || error);
}
}

// =====================================================
// 1) BIENVENIDA
// =====================================================
export async function sendBienvenida(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: {
text: `*Bienvenidos a Nuevo Munich 🥨*\nArtesanos del sabor desde 1972.\n🌐 https://nuevomunich.com.ar\n\nElegí una opción`
},
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "📖 Leer más" } },
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" } }
]
}
}
});
}

// =====================================================
// 2) LEER MÁS
// =====================================================
export async function sendLeerMas(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
"*Artesanos del Sabor*\n\n" +
"Fue en 1972 cuando los primeros dueños austríacos trajeron recetas tradicionales europeas.\n" +
"Hoy mantenemos ese legado en cada producto.\n\n" +
"👉 Escribí *Menú* para volver al inicio."
}
});
}

// =====================================================
// 3) MENÚ PRINCIPAL
// =====================================================
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
title: "Menú Principal",
rows: [
{ id: "CAT_PRODUCTOS", title: "Productos", description: "Catálogo por categorías" },
{ id: "CATALOGO_PDF", title: "Catálogo completo (PDF)", description: "Ver catálogo digital" },
{ id: "FOOD_TRUCK", title: "Food Truck / Eventos", description: "Servicios y contrataciones" },
{ id: "CONSULTAR_PEDIDO", title: "Realizar pedido", description: "Empezar un pedido" }
]
}
]
}
}
});
}

// =====================================================
// 4) CATEGORÍAS DE PRODUCTOS
// =====================================================
export async function sendCategoriaProductos(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Productos 🥓" },
body: { text: "Seleccioná una categoría:" },
action: {
button: "Ver categorías",
sections: [
{
title: "Categorías",
rows: [
{ id: "FETEADOS", title: "Feteados artesanales" },
{ id: "SALAMES", title: "Salames europeos" },
{ id: "SALCHICHAS", title: "Salchichas alemanas" },
{ id: "ESPECIALIDADES", title: "Especialidades" }
]
}
]
}
}
});
}

// =====================================================
// 5) SUBCATEGORÍAS → Lista de productos
// =====================================================
const SUBCATS = {
FETEADOS: ["Bondiola", "Jamón Cocido", "Jamón Bávaro", "Lomo Cocido", "Lomo Ahumado"],
SALAMES: ["Salame Holstein", "Salame Colonia", "Salame Alpino"],
SALCHICHAS: ["Viena", "Frankfurt", "Hungara", "Knackwurst"],
ESPECIALIDADES: ["Kassler", "Leberkase", "Leberwurst"]
};

export async function sendSubcategoria(to, categoria) {
const productos = SUBCATS[categoria].map(item => ({
id: `PROD_${item}`,
title: item
}));

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Productos disponibles" },
body: { text: "Elegí un producto:" },
action: {
button: "Ver productos",
sections: [{ title: "Lista", rows: productos }]
}
}
});
}

// =====================================================
// 6) MOSTRAR UN PRODUCTO → IMAGEN
// =====================================================
export async function sendProducto(to, producto) {
const url = IMAGENES[producto];

if (!url) {
return send({
messaging_product: "whatsapp",
to,
text: { body: "No encontré la imagen de ese producto 😕" }
});
}

await send({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: url }
});

return send({
messaging_product: "whatsapp",
to,
text: {
body: `🧺 ¿Querés seguir viendo productos o volver al menú?\n\n👉 Escribí *Menú*`
}
});
}

// =====================================================
// 7) CATÁLOGO COMPLETO PDF
// =====================================================
export async function sendCatalogoCompleto(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body: "📘 *Catálogo completo en PDF*\n\nAbrir:\nhttps://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view?usp=sharing"
}
});
}

// =====================================================
// 8) FOOD TRUCK
// =====================================================
export async function sendFoodTruck(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
"🚚 *Food Truck & Eventos*\n\n" +
"Ofrecemos servicio para eventos, ferias y catering.\n" +
"Consultanos tu fecha y requerimientos.\n\n👉 Escribí *Menú*"
}
});
}

// =====================================================
// 9) CONSULTAR PEDIDO
// =====================================================
export async function sendConsultarPedido(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
"📝 *Iniciemos tu pedido*\n\n" +
"Por favor escribime:\n" +
"• Nombre y apellido\n" +
"• Teléfono\n" +
"• Ubicación\n" +
"• Productos que te interesan\n\n👉 Luego te confirmo todo!"
}
});
}

// =====================================================
// 10) RESUMEN
// =====================================================
export async function sendResumenPedido(to) {
return send({
messaging_product: "whatsapp",
to,
text: { body: "📦 Tu resumen de pedido estará disponible próximamente." }
});
}
