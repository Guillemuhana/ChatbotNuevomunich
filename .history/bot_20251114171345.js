import axios from "axios";
import dotenv from "dotenv";
import { IMAGENES } from "./imagenes.js";

dotenv.config();

const WHATSAPP_URL = `https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`;
const TOKEN = process.env.WHATSAPP_TOKEN;

// ======================================================
// FUNCIÓN BASE PARA ENVIAR MENSAJES
// ======================================================
async function enviar(to, data) {
try {
await axios.post(WHATSAPP_URL, data, {
headers: {
Authorization: `Bearer ${TOKEN}`,
"Content-Type": "application/json"
}
});
} catch (e) {
console.log("❌ ERROR ENVÍO:", e.response?.data || e);
}
}

// ======================================================
// BIENVENIDA
// ======================================================
export async function sendBienvenida(to) {
await enviar(to, {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text: "Bienvenidos a Nuevo Munich 🥨\nArtesanos del sabor desde 1972.\n🌐 https://nuevomunich.com.ar"
},
footer: { text: "Elegí una opción" },
action: {
buttons: [
{
type: "reply",
reply: { id: "LEER_MAS", title: "📘 Leer más" }
},
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" }
}
]
}
}
});
}

// ======================================================
// DESCRIPCIÓN EXTENDIDA
// ======================================================
export async function sendDescripcionExtendida(to) {
await enviar(to, {
messaging_product: "whatsapp",
to,
type: "text",
text: {
body:
"📘 *Artesanos del Sabor*\n\n" +
"Desde 1972 elaboramos embutidos y especialidades con recetas centroeuropeas transmitidas por generaciones.\n\n" +
"🥨 Tradición • Calidad • Sabor auténtico\n\n" +
"👉 Elegí *Menú principal* para continuar."
}
});
}

// ======================================================
// MENÚ PRINCIPAL
// ======================================================
export async function sendMenuPrincipal(to) {
await enviar(to, {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Nuevo Munich 🥨" },
body: { text: "Elegí una opción del menú principal:" },
action: {
button: "Ver opciones",
sections: [
{
title: "Productos",
rows: [
{ id: "P_FETEADOS", title: "Feteados", description: "Feteados artesanales" },
{ id: "P_SALAMES", title: "Salames", description: "Salames para picada" },
{ id: "P_SALCHICHAS", title: "Salchichas Alemanas", description: "Viena, Frankfurt, Húngara" },
{ id: "P_ESPECIALIDADES", title: "Especialidades", description: "Kassler, Leberkasse y más" }
]
},
{
title: "Servicios",
rows: [
{ id: "EVENTOS", title: "Food Truck / Eventos", description: "Cátering y más" },
{ id: "CONSULTA_PEDIDOS", title: "Consultar pedidos", description: "Cómo hacer o seguir un pedido" }
]
},
{
title: "Información",
rows: [
{ id: "CATALOGO", title: "Catálogo completo (PDF)", description: "Ver catálogo general" }
]
}
]
}
}
});
}

// ======================================================
// MOSTRAR PRODUCTOS SEGÚN LA CATEGORÍA
// ======================================================
export async function sendCategoriaProductos(to, categoria) {
const productos = {
P_FETEADOS: ["Jamón Cocido", "Jamón Crudo", "Bondiola"],
P_SALAMES: ["Salame Milan", "Salame Picado Grueso"],
P_SALCHICHAS: ["Viena", "Frankfurt", "Hungara"],
P_ESPECIALIDADES: ["Kassler", "Leberkasse"]
};

const lista = productos[categoria];

if (!lista) return;

await enviar(to, {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Productos" },
body: { text: "Elegí un producto:" },
action: {
button: "Ver productos",
sections: [
{
title: "Lista",
rows: lista.map((name) => ({
id: "PROD_" + name,
title: name,
description: "Ver detalle"
}))
}
]
}
}
});
}

// ======================================================
// MOSTRAR IMAGEN DEL PRODUCTO
// ======================================================
export async function sendProducto(to, nombre) {
const img = IMAGENES[nombre];

if (!img) {
await enviar(to, {
messaging_product: "whatsapp",
to,
type: "text",
text: { body: "No encontré la imagen de ese producto 😕" }
});
return;
}

await enviar(to, {
messaging_product: "whatsapp",
to,
type: "image",
image: { link: img },
});

await enviar(to, {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: `¿Querés volver al menú principal?` },
action: {
buttons: [
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" }
}
]
}
}
});
}

// ======================================================
// CATÁLOGO PDF
// ======================================================
export async function sendCatalogo(to) {
await enviar(to, {
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: "https://drive.google.com/uc?export=download&id=1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k",
caption: "📄 Catálogo completo Nuevo Munich"
}
});
}

