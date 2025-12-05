import axios from "axios";
import { IMAGENES, SUBCATEGORIAS } from "./imagenes.js";

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const URL = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;

// =======================================
// ENVIAR MENSAJE GENÉRICO
// =======================================
async function enviarMensaje(data) {
try {
const res = await axios({
method: "POST",
url: URL,
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${TOKEN}`
},
data
});

console.log("📤 ENVÍO OK:", res.status);
} catch (error) {
console.log("❌ ERROR ENVÍO:", error.response?.data || error);
}
}

// =======================================
// 1. BIENVENIDA
// =======================================
export async function sendBienvenida(to) {
const data = {
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
"Elegí una opción"
},
action: {
buttons: [
{
type: "reply",
reply: { id: "LEER_MAS", title: "📖 Leer más" }
},
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" }
}
]
}
}
};

await enviarMensaje(data);
}

// =======================================
// 2. LEER MÁS
// =======================================
export async function sendLeerMas(to) {
const data = {
messaging_product: "whatsapp",
to,
text: {
body:
"Somos una empresa familiar con más de 50 años de tradición artesanal.\n" +
"Conocé más en:\n👉 https://nuevomunich.com.ar"
}
};
await enviarMensaje(data);
}

// =======================================
// 3. MENÚ PRINCIPAL
// =======================================
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
reply: { id: "CAT_PRODUCTOS", title: "🛒 Productos" }
},
{
type: "reply",
reply: { id: "FOOD_TRUCK", title: "🚚 Food Truck" }
},
{
type: "reply",
reply: { id: "CATALOGO_PDF", title: "📄 Catálogo Completo" }
}
]
}
}
};

await enviarMensaje(data);
}

// =======================================
// 4. CATEGORÍAS DE PRODUCTOS
// =======================================
export async function sendCategoriaProductos(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "🛒 Productos" },
body: { text: "Elegí una categoría" },
action: {
button: "Ver categorías",
sections: [
{
title: "Categorías",
rows: [
{ id: "FETEADOS", title: "🥓 Feteados" },
{ id: "SALAMES", title: "🍖 Salames" },
{ id: "SALCHICHAS", title: "🌭 Salchichas" },
{ id: "ESPECIALIDADES", title: "⭐ Especialidades" }
]
}
]
}
}
};

await enviarMensaje(data);
}

// =======================================
// 5. SUBCATEGORÍAS
// =======================================
export async function sendSubcategoria(to, categoria) {
const opciones = SUBCATEGORIAS[categoria];

const rows = opciones.map((item) => ({
id: `PROD_${item}`,
title: item
}));

const data = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: `Categoria: ${categoria}` },
body: { text: "Elegí un producto" },
action: {
button: "Ver productos",
sections: [{ title: "Productos", rows }]
}
}
};

await enviarMensaje(data);
}

// =======================================
// 6. PRODUCTO FINAL (MUESTRA IMAGEN)
// =======================================
export async function sendProducto(to, nombre) {
const url = IMAGENES[nombre];

const data = {
messaging_product: "whatsapp",
to,
type: "image",
image: {
link: url,
caption: `📦 ${nombre}\n\nSi querés volver al menú principal, tocá el botón 👇`
}
};

await enviarMensaje(data);

await sendMenuPrincipal(to);
}

// =======================================
// 7. FOOD TRUCK
// =======================================
export async function sendFoodTruck(to) {
const data = {
messaging_product: "whatsapp",
to,
text: { body: "🚚 Nuestro Food Truck está disponible para eventos.\nConsultas al: +54 9 351 123 4567" }
};
await enviarMensaje(data);
}

// =======================================
// 8. CONSULTAR PEDIDO
// =======================================
export async function sendConsultarPedido(to) {
const data = {
messaging_product: "whatsapp",
to,
text: { body: "📝 Esta función estará disponible próximamente." }
};
await enviarMensaje(data);
}

// =======================================
// 9. CATÁLOGO PDF
// =======================================
export async function sendCatalogoCompleto(to) {
const data = {
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: "https://nuevomunich.com.ar/catalogo.pdf",
filename: "Catalogo-Nuevo-Munich.pdf"
}
};

await enviarMensaje(data);
}
