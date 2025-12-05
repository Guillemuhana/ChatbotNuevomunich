// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const WAPI_BASE = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO_URL = process.env.LOGO_URL;
const WEB_URL = process.env.WEB_URL;
const INSTAGRAM_URL = process.env.INSTAGRAM_URL;
const CATALOG_URL = process.env.CATALOG_URL;
const SALES_NUMBER = process.env.SALES_NUMBER;

// ===== Helpers HTTP =====
function apiHeaders() {
return {
Authorization: `Bearer ${TOKEN}`,
"Content-Type": "application/json"
};
}

export async function sendText(to, body) {
return axios.post(
`${WAPI_BASE}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
text: { body }
},
{ headers: apiHeaders() }
);
}

// Interactive con HEADER IMAGEN (logo) para que sea "un solo bloque"
async function sendInteractiveWithHeaderImage(to, body, footer, buttonsOrList) {
// buttonsOrList:
// { kind: 'buttons', buttons: [{id,title}, ...max 3] }
// { kind: 'list', title, sections: [{title, rows:[{id,title,desc?}]}] }
const base = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
header: { type: "image", image: { link: LOGO_URL } },
body: { text: body },
footer: footer ? { text: footer } : undefined,
}
};

if (buttonsOrList.kind === "buttons") {
base.interactive.type = "button";
base.interactive.action = {
buttons: buttonsOrList.buttons.map(b => ({
type: "reply",
reply: { id: b.id, title: b.title }
}))
};
} else if (buttonsOrList.kind === "list") {
base.interactive.type = "list";
base.interactive.action = {
button: buttonsOrList.title || "Ver",
sections: buttonsOrList.sections
};
}

return axios.post(`${WAPI_BASE}/${PHONE_ID}/messages`, base, { headers: apiHeaders() });
}

// ===== Bienvenida (logo + texto + 3 botones + footer con web/ig/catálogo) =====
export async function sendWelcomeBlock(to) {
const body =
`Bienvenidos a Nuevo Munich
Artesanos del sabor desde 1972`;

const footer =
`Web: ${WEB_URL}
Instagram: ${INSTAGRAM_URL}
Catálogo: ${CATALOG_URL}`;

return sendInteractiveWithHeaderImage(to, body, footer, {
kind: "buttons",
buttons: [
{ id: "BTN_PICADAS", title: "Picadas" },
{ id: "BTN_PRODUCTOS", title: "Productos" },
{ id: "BTN_PEDIDO", title: "Hacer pedido" }
]
});
}

// ====== Catálogo (Instagram) ======
// Definimos categorías y productos con URLs de imagen (usá posts de Instagram en calidad directa o CDN propio)
const CATEGORIES = [
{ id: "CAT_SALCHICHAS", title: "Salchichas Alemanas" },
{ id: "CAT_SALAMES", title: "Salames & Embutidos" },
{ id: "CAT_FETEADOS", title: "Feteados Artesanales" },
{ id: "CAT_ESPECIALES", title: "Especialidades (Kassler, Leberkasse...)" },
{ id: "CAT_ROSCAS", title: "Rosca Polaca & Grill" },
{ id: "CAT_SANDW", title: "Sandwiches Gourmet" },
{ id: "CAT_PICADAS", title: "Picadas & Tablas" }
];

// Placeholders de fotos (reemplazá por tus URLs de IG o CDN)
const PRODUCTS_BY_CAT = {
CAT_SALCHICHAS: [
{ id: "P_VIENA", title: "Viena (copetín/grande)", img: "https://i.postimg.cc/0Q0qQy3B/viena.jpg" },
{ id: "P_FRANK", title: "Frankfurt Tipo", img: "https://i.postimg.cc/8z2b6yQk/frankfurt.jpg" },
{ id: "P_HUNGARA", title: "Húngara (copetín/grande)", img: "https://i.postimg.cc/90gkZPrH/hungara.jpg" },
{ id: "P_KNACK", title: "Knackwurst Tipo", img: "https://i.postimg.cc/kXb2kR7f/knack.jpg" },
{ id: "P_WEISS", title: "Weisswurst Tipo", img: "https://i.postimg.cc/6Q2p6Ytq/weiss.jpg" }
],
CAT_SALAMES: [
{ id: "P_ALPINO", title: "Salame Tipo Alpino", img: "https://i.postimg.cc/Prk8c0mX/alpino.jpg" },
{ id: "P_COLONIA", title: "Salame Tipo Colonia", img: "https://i.postimg.cc/7Z3yXJjV/colonia.jpg" },
{ id: "P_HOLSTEIN", title: "Salame Holstein", img: "https://i.postimg.cc/XNzx5fYH/holstein.jpg" }
],
CAT_FETEADOS: [
{ id: "P_BONDIOLA", title: "Bondiola", img: "https://i.postimg.cc/1zK0ggh7/bondiola.jpg" },
{ id: "P_JAMON", title: "Jamón Cocido (Bávaro/Común/Asado)", img: "https://i.postimg.cc/xC8Yp2h7/jamon.jpg" },
{ id: "P_LOMO", title: "Lomo de Cerdo (horneado/ahumado)", img: "https://i.postimg.cc/52G9yWZf/lomo.jpg" },
{ id: "P_PANCETA", title: "Panceta Salada Cocida Ahumada", img: "https://i.postimg.cc/TY3yWm7v/panceta.jpg" }
],
CAT_ESPECIALES: [
{ id: "P_KASSLER", title: "Kassler (costeleta ahumada)", img: "https://i.postimg.cc/1tY8X5vM/kassler.jpg" },
{ id: "P_LEBERKASSE", title: "Leberkasse", img: "https://i.postimg.cc/zGQ6gVw2/leberkasse.jpg" },
{ id: "P_CRACOVIA", title: "Cracovia", img: "https://i.postimg.cc/BbQ0P8mB/cracovia.jpg" }
],
CAT_ROSCAS: [
{ id: "P_ROSCA", title: "Rosca Polaca", img: "https://i.postimg.cc/MHcSnkP5/rosca.jpg" }
],
CAT_SANDW: [
{ id: "P_SDOG", title: "Super Pancho Alemán", img: "https://i.postimg.cc/HskJ7y3k/hotdog.jpg" },
{ id: "P_SANDWCH", title: "Sandwich Gourmet", img: "https://i.postimg.cc/0y6yQj1w/sandwich.jpg" }
],
CAT_PICADAS: [
{ id: "P_PIC2", title: "Picada para 2", img: "https://i.postimg.cc/zv8x3Vd7/picada2.jpg" },
{ id: "P_PIC4", title: "Picada para 4", img: "https://i.postimg.cc/pL8VbFYw/picada4.jpg" },
{ id: "P_PIC6", title: "Picada para 6+", img: "https://i.postimg.cc/4Nw7Wm8m/picada6.jpg" }
]
};

// Menú de categorías (lista interactiva, minimalista)
export async function sendCatalogCategories(to) {
const body =
`Catálogo Nuevo Munich
Elegí una categoría para ver fotos`;

const footer =
`Web: ${WEB_URL} • Instagram: ${INSTAGRAM_URL}`;

const rows = CATEGORIES.map(c => ({
id: `CATSEL_${c.id}`,
title: c.title
}));

return sendInteractiveWithHeaderImage(to, body, footer, {
kind: "list",
title: "Ver categorías",
sections: [
{ title: "Categorías", rows }
]
});
}

// Muestra los productos de una categoría (envía imágenes una por una, + CTA minimalista)
async function sendCategoryItems(to, catId) {
const items = PRODUCTS_BY_CAT[catId] || [];
if (items.length === 0) {
await sendText(to, "No hay productos en esta categoría por el momento.");
return;
}

// Enviamos hasta 8 imágenes por tanda (WhatsApp limita el ritmo; mantenemos simple)
for (const p of items) {
// Foto
await axios.post(
`${WAPI_BASE}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "image",
image: { link: p.img, caption: `• ${p.title}\n(Se entregan en piezas enteras o presentaciones fraccionadas cerradas)` }
},
{ headers: apiHeaders() }
);
}

// Botones de navegación
await sendInteractiveWithHeaderImage(
to,
"¿Querés ver otra categoría o hacer un pedido?",
`Catálogo: ${CATALOG_URL}`,
{
kind: "buttons",
buttons: [
{ id: "BTN_VER_CATS", title: "◁ Categorías" },
{ id: "BTN_PEDIDO", title: "Hacer pedido" },
{ id: "BTN_INICIO", title: "Inicio" }
]
}
);
}

// ====== Pedido (flujo guiado, minimalista) ======
const sessions = new Map();
const steps = {
TIPO: "TIPO",
ITEMS: "ITEMS",
ENTREGA: "ENTREGA",
CUANDO: "CUANDO",
NOMBRE: "NOMBRE",
CONFIRM: "CONFIRM"
};

function initOrderSession(user) {
sessions.set(user, {
step: steps.TIPO,
data: { tipo: "", items: "", entrega: "", cuando: "", nombre: "" }
});
}

async function handleOrderFlow(user, payloadOrText) {
const s = sessions.get(user);
if (!s) {
initOrderSession(user);
return sendInteractiveWithHeaderImage(
user,
"¿Para qué es el pedido?",
"",
{
kind: "buttons",
buttons: [
{ id: "ORD_TIPO_FAMILIAR", title: "Consumo familiar" },
{ id: "ORD_TIPO_EVENTO", title: "Evento" },
{ id: "ORD_TIPO_OTRO", title: "Hotel/Rest./Otro" }
]
}
);
}

switch (s.step) {
case steps.TIPO: {
const map = {
"ORD_TIPO_FAMILIAR": "Consumo familiar",
"ORD_TIPO_EVENTO": "Evento",
"ORD_TIPO_OTRO": "Hotel/Rest./Otro"
};
s.data.tipo = map[payloadOrText] || "Consumo familiar";
s.step = steps.ITEMS;
await sendText(user, "Indicá productos y cantidades (sin precios por ahora). Ej: 1 Rosca Polaca + 2 Viena grandes + 1 Kassler.");
break;
}

case steps.ITEMS: {
s.data.items = (payloadOrText || "").trim();
s.step = steps.ENTREGA;
await sendInteractiveWithHeaderImage(
user,
"¿Cómo preferís recibirlo?",
"",
{
kind: "buttons",
buttons: [
{ id: "ORD_ENT_RETIRO", title: "Retiro en local" },
{ id: "ORD_ENT_ENVIO", title: "Envío/Delivery" },
{ id: "ORD_ENT_OTRO", title: "A coordinar" }
]
}
);
break;
}

case steps.ENTREGA: {
const map = {
"ORD_ENT_RETIRO": "Retiro en local",
"ORD_ENT_ENVIO": "Envío/Delivery",
"ORD_ENT_OTRO": "A coordinar"
};
s.data.entrega = map[payloadOrText] || (payloadOrText || "A coordinar");
s.step = steps.CUANDO;
await sendText(user, "¿Para qué fecha y horario lo necesitás?");
break;
}

case steps.CUANDO: {
s.data.cuando = (payloadOrText || "").trim();
s.step = steps.NOMBRE;
await sendText(user, "¿A nombre de quién registramos el pedido?");
break;
}

case steps.NOMBRE: {
s.data.nombre = (payloadOrText || "").trim();
s.step = steps.CONFIRM;
const resumen =
`Resumen del pedido:
• Tipo: ${s.data.tipo}
• Ítems: ${s.data.items}
• Entrega: ${s.data.entrega}
• Cuándo: ${s.data.cuando}
• Nombre: ${s.data.nombre}

¿Confirmamos el envío a ventas?`;
await sendInteractiveWithHeaderImage(
user,
resumen,
"",
{
kind: "buttons",
buttons: [
{ id: "ORD_CONFIRM_SI", title: "Confirmar" },
{ id: "ORD_CONFIRM_NO", title: "Editar" },
{ id: "ORD_CANCEL", title: "Cancelar" }
]
}
);
break;
}

case steps.CONFIRM: {
if (payloadOrText === "ORD_CONFIRM_SI") {
const toSales =
`Nuevo pedido (WhatsApp)
De: ${s.data.nombre} — ${user}
Tipo: ${s.data.tipo}
Ítems: ${s.data.items}
Entrega: ${s.data.entrega}
Cuándo: ${s.data.cuando}`;
await sendText(SALES_NUMBER, toSales);
await sendText(user, "¡Listo! Enviamos tu pedido a ventas. Te respondemos a la brevedad con el detalle actualizado.");
sessions.delete(user);
} else if (payloadOrText === "ORD_CANCEL") {
await sendText(user, "Pedido cancelado. Podés iniciar uno nuevo desde “Hacer pedido”.");
sessions.delete(user);
} else {
// Editar
s.step = steps.ITEMS;
await sendText(user, "Ok, contanos de nuevo los productos y cantidades:");
}
break;
}

default:
sessions.delete(user);
await sendText(user, "Reiniciamos el pedido. Tocá “Hacer pedido” para empezar.");
}
}

// ====== Ruteo central ======
export async function handleIncomingLogic({ from, message }) {
try {
const type = message.type;

// BUTTON REPLY
if (type === "interactive" && message.interactive?.type === "button_reply") {
const btnId = message.interactive.button_reply.id;

if (btnId === "BTN_INICIO") {
return sendWelcomeBlock(from);
}
if (btnId === "BTN_PRODUCTOS") {
return sendCatalogCategories(from);
}
if (btnId === "BTN_PICADAS") {
// Atajo: mostramos la categoría de picadas directamente
return sendCategoryItems(from, "CAT_PICADAS");
}
if (btnId === "BTN_PEDIDO") {
initOrderSession(from);
return handleOrderFlow(from, null);
}
if (btnId === "BTN_VER_CATS") {
return sendCatalogCategories(from);
}

// Flujo pedido:
if (btnId.startsWith("ORD_")) {
return handleOrderFlow(from, btnId);
}

return sendText(from, "Opción no reconocida. Probá nuevamente.");
}

// LIST REPLY (categorías)
if (type === "interactive" && message.interactive?.type === "list_reply") {
const rowId = message.interactive.list_reply.id || "";
if (rowId.startsWith("CATSEL_")) {
const catId = rowId.replace("CATSEL_", "");
return sendCategoryItems(from, catId);
}
return sendText(from, "Selección no reconocida. Probá nuevamente.");
}

// TEXTO LIBRE: si hay sesión de pedido, continúa; si no, ofrecemos menú
if (type === "text") {
if (sessions.has(from)) {
return handleOrderFlow(from, message.text?.body || "");
}
// texto genérico -> mostramos categorías para ayudar
return sendCatalogCategories(from);
}

// Cualquier otro tipo
return sendCatalogCategories(from);
} catch (e) {
console.error("❌ Error en handleIncomingLogic:", e?.response?.data || e);
try { await sendText(from, "Tuvimos un inconveniente. Probá nuevamente en unos segundos."); } catch {}
}
}

