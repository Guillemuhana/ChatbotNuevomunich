import axios from "axios";
import dotenv from "dotenv";
import productos from "./imagenes.js";
dotenv.config();

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const API_URL = `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`;

// =====================================
// ENVIAR MENSAJE BÁSICO DE TEXTO
// =====================================
async function sendText(to, text) {
return axios.post(
API_URL,
{
messaging_product: "whatsapp",
to,
text: { body: text }
},
{
headers: { Authorization: `Bearer ${TOKEN}` }
}
);
}

// =====================================
// ENVIAR BOTONES
// =====================================
async function sendButtons(to, body, buttons) {
return axios.post(
API_URL,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: body },
footer: { text: "" },
action: { buttons }
}
},
{
headers: { Authorization: `Bearer ${TOKEN}` }
}
);
}

// =====================================
// 1. BIENVENIDA (CON LOGO Y BOTONES)
// =====================================
export async function sendBienvenida(to) {
await axios.post(
API_URL,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: process.env.LOGO_URL }
},
body: {
text:
"*Bienvenidos a Nuevo Munich 🥨*\n" +
"Artesanos del sabor desde 1972.\n\n" +
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
},
{
headers: { Authorization: `Bearer ${TOKEN}` }
}
);
}

// =====================================
// 2. LEER MÁS — DESCRIPCIÓN LARGA
// =====================================
export async function sendLeerMas(to) {
await sendText(
to,
"🍺 *Artesanos del sabor desde 1972*\n\n" +
"Somos una empresa familiar con tradición centroeuropea que conserva recetas originales, sabores y técnicas artesanales."
);

return sendButtons(to, "¿Qué deseas hacer ahora?", [
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" }
}
]);
}

// =====================================
// 3. MENÚ PRINCIPAL (ANTES “VER OPCIONES”)
// =====================================
export async function sendMenuPrincipal(to) {
return sendButtons(
to,
"Nuevo Munich 🥨\nElegí una opción del menú principal:",
[
{ type: "reply", reply: { id: "CAT_PRODUCTOS", title: "🛒 Productos" } },
{
type: "reply",
reply: { id: "FOOD_TRUCK", title: "🚚 Food Truck / Eventos" }
},
{
type: "reply",
reply: { id: "CONSULTAR_PEDIDO", title: "📨 Consultar pedidos" }
},
{
type: "reply",
reply: { id: "CATALOGO_PDF", title: "📄 Catálogo completo (PDF)" }
}
]
);
}

// =====================================
// 4. CATEGORÍAS DE PRODUCTOS
// =====================================
export async function sendCategoriaProductos(to) {
return sendButtons(to, "¿Qué categoría de productos buscás?", [
{ type: "reply", reply: { id: "FETEADOS", title: "🥓 Feteados" } },
{ type: "reply", reply: { id: "SALAMES", title: "🍖 Salames" } },
{ type: "reply", reply: { id: "SALCHICHAS", title: "🌭 Salchichas Alemanas" } },
{ type: "reply", reply: { id: "ESPECIALIDADES", title: "⭐ Especialidades" } }
]);
}

// =====================================
// 5. SUBCATEGORÍAS SEGÚN CATEGORÍA
// =====================================
export async function sendSubcategoria(to, categoria) {
const lista = productos[categoria];

if (!lista) {
return sendText(to, "No encontré productos en esta categoría.");
}

const buttons = lista.map((p) => ({
type: "reply",
reply: { id: `PROD_${p.nombre}`, title: p.nombre }
}));

return sendButtons(to, "Elegí un producto:", buttons);
}

// =====================================
// 6. MOSTRAR UN PRODUCTO (CON IMAGEN)
// =====================================
export async function sendProducto(to, nombre) {
let prod;

for (const cat in productos) {
prod = productos[cat].find((p) => p.nombre === nombre);
if (prod) break;
}

if (!prod) {
return sendText(to, "No encontré la imagen de ese producto 🥲");
}

// ENVIAR IMAGEN DEL PRODUCTO
await axios.post(
API_URL,
{
messaging_product: "whatsapp",
to,
type: "image",
image: { link: prod.img }
},
{
headers: { Authorization: `Bearer ${TOKEN}` }
}
);

// BOTÓN PARA VOLVER
return sendButtons(to, prod.nombre + "\n" + prod.desc, [
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" }
}
]);
}

// =====================================
// 7. FOOD TRUCK
// =====================================
export async function sendFoodTruck(to) {
return sendText(
to,
"🚚 *Food Truck / Eventos*\n\n" +
"Catering, mesas frías, fiestas y más.\n\n" +
"Próximamente podrás solicitar fechas y presupuestos."
);
}

// =====================================
// 8. CONSULTAR PEDIDO
// =====================================
export async function sendConsultarPedido(to) {
return sendText(
to,
"📨 *Consultá tu pedido*\n\n" +
"Pronto podrás comunicarte con un asesor que recibirá tus datos y te ayudará con tu compra."
);
}

// =====================================
// 9. CATÁLOGO COMPLETO PDF
// =====================================
export async function sendCatalogoCompleto(to) {
return axios.post(
API_URL,
{
messaging_product: "whatsapp",
to,
type: "document",
document: {
link:
"https://drive.google.com/uc?export=download&id=1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k",
filename: "Catalogo_Nuevo_Munich.pdf"
}
},
{
headers: { Authorization: `Bearer ${TOKEN}` }
}
);
}