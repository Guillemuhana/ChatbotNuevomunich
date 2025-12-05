// bot.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WAPI_BASE = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO_URL = process.env.LOGO_URL;
const WEB_URL = process.env.WEB_URL;
const IG = process.env.INSTAGRAM_HANDLE;
const CATALOG_URL = process.env.CATALOG_URL;
const SALES_NUMBER = process.env.SALES_NUMBER;

// ---- Sesiones de pedido (memoria en RAM) ----
const sessions = new Map();

export async function sendText(to, body) {
return axios.post(
`${WAPI_BASE}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
text: { body }
},
{ headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" } }
);
}

export async function sendImage(to, link) {
return axios.post(
`${WAPI_BASE}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "image",
image: { link }
},
{ headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" } }
);
}

export async function sendButtons(to, body, buttons) {
// buttons: [{ id: 'BTN_X', title: 'Texto' }, ...] (máx. 3)
const rows = buttons.map(b => ({
type: "reply",
reply: { id: b.id, title: b.title }
}));

return axios.post(
`${WAPI_BASE}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: body },
action: { buttons: rows }
}
},
{ headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" } }
);
}

// ---- BLOQUE DE BIENVENIDA (logo + texto + botones + footer) ----
export async function sendWelcomeBlock(to) {
// 1) Logo (imagen)
await sendImage(to, LOGO_URL);

// 2) Texto + botones
const body =
`Bienvenidos a Nuevo Munich
Artesanos del sabor desde 1972

¿En qué podemos ayudarte hoy?`;

await sendButtons(to, body, [
{ id: "BTN_PICADAS", title: "Picadas" },
{ id: "BTN_PRODUCTOS", title: "Productos" },
{ id: "BTN_PEDIDO", title: "Hacer pedido" }
]);

// 3) Footer limpio
const footer =
`Web: ${WEB_URL}
Instagram: ${IG}
Catálogo: ${CATALOG_URL}`;
await sendText(to, footer);
}

// ---- PRODUCTOS (menú minimalista) ----
export async function sendProductosMenu(to) {
const body = "Seleccioná una categoría:";
await sendButtons(to, body, [
{ id: "BTN_PROD_PICADAS", title: "Picadas & Tablas" },
{ id: "BTN_PROD_SANDWICHES", title: "Sandwiches" },
{ id: "BTN_PROD_MAS", title: "Más opciones →" }
]);
}

export async function sendProductosMas(to) {
const body = "Más categorías:";
await sendButtons(to, body, [
{ id: "BTN_PROD_COCINAR", title: "Cocinar" },
{ id: "BTN_PROD_PARRILLA", title: "Parrilla / Grill" },
{ id: "BTN_VOLVER", title: "Volver" }
]);
}

// ---- Resúmenes de categorías (texto plano, sin precios) ----
export async function sendCategoriaDetalle(to, cat) {
let body = "";

if (cat === "PICADAS") {
body =
`Picadas & Tablas
• Feteados artesanales (bondiola, jamón, lomo, panceta).
• Salames (Alpino/Colonia/Holstein).
• Acompañan pan de campo y aderezos a elección.
Se entregan en presentaciones cerradas/fraccionadas, no sueltas.`;
}
if (cat === "SANDWICHES") {
body =
`Sandwiches
• Frankfurt Tipo / Viena / Húngara / Knackwurst / Weisswurst.
• Opcionales: chucrut, mostaza, pepinillos.
Ideales para Food Truck, eventos y servicio rápido.`;
}
if (cat === "COCINAR") {
body =
`Para Cocinar
• Lomo de cerdo (horneado o ahumado a las finas hierbas).
• Kassler (costeleta horneada/ahumada).
• Leberkasse, Cracovia, Arrollados.
Rinden muy bien en horno/sartén; sugerencias según tu evento.`;
}
if (cat === "PARRILLA") {
body =
`Parrilla / Grill
• Kassler, salchichas tipo alemán (Frankfurt/Viena/Húngara/Knackwurst).
• Rosca Polaca.
Textura y sabor ahumado clásico, perfectos para tabla caliente.`;
}

await sendText(to, body);
await sendText(to, `Catálogo completo: ${CATALOG_URL}`);
}

// ---- Pedido (flujo guiado) ----
const steps = {
START: "START",
TIPO: "TIPO",
ITEMS: "ITEMS",
ENTREGA: "ENTREGA",
CUANDO: "CUANDO",
NOMBRE: "NOMBRE",
CONFIRM: "CONFIRM",
DONE: "DONE"
};

export function initOrderSession(user) {
sessions.set(user, {
step: steps.TIPO,
data: { tipo: "", items: "", entrega: "", cuando: "", nombre: "" }
});
}

export async function handleOrderFlow(user, fromText) {
const s = sessions.get(user);
if (!s) {
initOrderSession(user);
return sendButtons(user, "¿Para qué es el pedido?", [
{ id: "ORD_TIPO_FAMILIAR", title: "Consumo familiar" },
{ id: "ORD_TIPO_EVENTO", title: "Evento" },
{ id: "ORD_TIPO_OTRO", title: "Hotel/Rest./Otro" }
]);
}

switch (s.step) {
case steps.TIPO: {
if (fromText?.startsWith("ORD_TIPO_")) {
const map = {
"ORD_TIPO_FAMILIAR": "Consumo familiar",
"ORD_TIPO_EVENTO": "Evento",
"ORD_TIPO_OTRO": "Hotel/Rest./Otro"
};
s.data.tipo = map[fromText] || "Consumo familiar";
} else {
s.data.tipo = fromText?.trim() || "Consumo familiar";
}
s.step = steps.ITEMS;
await sendText(user, "Decinos qué querés comprar (productos y cantidades). Ej: 1 Rosca Polaca + 2 Viena grandes + 1 Kassler.");
break;
}

case steps.ITEMS: {
s.data.items = fromText?.trim();
s.step = steps.ENTREGA;
await sendButtons(user, "¿Cómo preferís recibirlo?", [
{ id: "ORD_ENT_RETIRO", title: "Retiro en local" },
{ id: "ORD_ENT_ENVIO", title: "Envío/Delivery" },
{ id: "ORD_ENT_OTRO", title: "A coordinar" }
]);
break;
}

case steps.ENTREGA: {
const map = { "ORD_ENT_RETIRO": "Retiro en local", "ORD_ENT_ENVIO": "Envío/Delivery", "ORD_ENT_OTRO": "A coordinar" };
s.data.entrega = map[fromText] || fromText || "A coordinar";
s.step = steps.CUANDO;
await sendText(user, "¿Para qué fecha y horario lo necesitás?");
break;
}

case steps.CUANDO: {
s.data.cuando = fromText?.trim();
s.step = steps.NOMBRE;
await sendText(user, "¿A nombre de quién registramos el pedido?");
break;
}

case steps.NOMBRE: {
s.data.nombre = fromText?.trim();
s.step = steps.CONFIRM;

const resumen =
`Resumen del pedido:
• Tipo: ${s.data.tipo}
• Ítems: ${s.data.items}
• Entrega: ${s.data.entrega}
• Cuándo: ${s.data.cuando}
• Nombre: ${s.data.nombre}

¿Confirmamos el envío a ventas?`;

await sendButtons(user, resumen, [
{ id: "ORD_CONFIRM_SI", title: "Confirmar" },
{ id: "ORD_CONFIRM_NO", title: "Editar" },
{ id: "ORD_CANCEL", title: "Cancelar" }
]);
break;
}

case steps.CONFIRM: {
if (fromText === "ORD_CONFIRM_SI") {
// Enviar a ventas
const toSales =
`Nuevo pedido (WhatsApp):
De: ${s.data.nombre} — ${user}
Tipo: ${s.data.tipo}
Ítems: ${s.data.items}
Entrega: ${s.data.entrega}
Cuándo: ${s.data.cuando}`;

await sendText(SALES_NUMBER, toSales);
await sendText(user, "¡Listo! Enviamos tu pedido a ventas. Te respondemos a la brevedad con el detalle actualizado.");
s.step = steps.DONE;
sessions.delete(user);
} else if (fromText === "ORD_CANCEL") {
await sendText(user, "Pedido cancelado. Si necesitás, podés empezar de nuevo con “Hacer pedido”.");
sessions.delete(user);
} else {
// “Editar”: reiniciar desde ítems
s.step = steps.ITEMS;
await sendText(user, "Ok, contanos de nuevo los productos y cantidades que necesitás:");
}
break;
}

default:
sessions.delete(user);
await sendText(user, "Reiniciamos el pedido. Tocá “Hacer pedido” para empezar.");
}
}