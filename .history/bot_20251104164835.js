// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL;
const WEB = process.env.WEB_URL;
const IG = process.env.INSTAGRAM_URL;
const CATALOGO = process.env.CATALOGO_URL;
const SALES = process.env.SALES_NUMBER;

// ---- Sesiones de pedido ----
export const sessions = new Map();

// ---- Funciones Base ----
export async function sendText(to, body) {
return axios.post(
`${API}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
text: { body }
},
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

export async function sendImage(to, link) {
return axios.post(
`${API}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "image",
image: { link }
},
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

export async function sendButtons(to, body, buttons) {
const mapped = buttons.map(b => ({
type: "reply",
reply: { id: b.id, title: b.title }
}));
return axios.post(
`${API}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: body },
action: { buttons: mapped }
}
},
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

// ---- MENÚ PRINCIPAL ----
export async function sendMenuPrincipal(to) {
await sendImage(to, LOGO);

await sendButtons(
to,
`Bienvenido/a a *Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:`,
[
{ id: "BTN_PICADAS", title: "Picadas" },
{ id: "BTN_PRODUCTOS", title: "Productos" },
{ id: "BTN_PEDIDO", title: "Hacer pedido" }
]
);

await sendText(
to,
`🌐 ${WEB}\n📸 ${IG}\n📦 Catálogo: ${CATALOGO}`
);
}

// ---- PRODUCTOS ----
export async function sendProductosMenu(to) {
return sendButtons(to, "Seleccioná una categoría:", [
{ id: "P_PICADAS", title: "Picadas & Tablas" },
{ id: "P_SALCHICHAS", title: "Salchichas Alemanas" },
{ id: "P_GRILL", title: "Grill / Parrilla" }
]);
}

export async function sendCategoria(to, type) {
let txt = "";

if (type === "P_PICADAS") txt =
`Picadas & Tablas:
• Fiambres artesanales enteros o fraccionados.
• Salames Alpino / Colonia / Holstein.
• Pan casero o grisines.
No se vende por gramo suelto.`;

if (type === "P_SALCHICHAS") txt =
`Salchichas Alemanas:
• Frankfurt
• Viena
• Húngara
• Knackwurst
• Weisswurst
Ideales para sandwich, picada caliente o food truck.`;

if (type === "P_GRILL") txt =
`Parrilla / Grill:
• Kassler
• Rosca Polaca
• Salchichas Alemán estilo parrilla
Sabor ahumado clásico centroeuropeo.`;

await sendText(to, txt);
await sendText(to, `Catálogo completo: ${CATALOGO}`);
}

// ---- PEDIDOS ----
export function iniciarPedido(user) {
sessions.set(user, { paso: "TIPO", data: {} });
return sendButtons(user, "¿Para qué es el pedido?", [
{ id: "O_FAM", title: "Familiar" },
{ id: "O_EVENTO", title: "Evento" },
{ id: "O_OTRO", title: "Hotel/Rest/Otro" }
]);
}

export async function flujoPedido(user, msg) {
const s = sessions.get(user);
if (!s) return iniciarPedido(user);

switch (s.paso) {
case "TIPO":
s.data.tipo = msg;
s.paso = "ITEMS";
return sendText(user, "Decinos qué querés (ej: 1 rosca polaca + 2 viena grandes).");

case "ITEMS":
s.data.items = msg;
s.paso = "ENTREGA";
return sendButtons(user, "¿Cómo recibís?", [
{ id: "ENTREGA_LOCAL", title: "Retiro" },
{ id: "ENTREGA_ENVIO", title: "Envío" }
]);

case "ENTREGA":
s.data.entrega = msg;
s.paso = "CUANDO";
return sendText(user, "¿Para qué fecha y horario?");

case "CUANDO":
s.data.cuando = msg;
s.paso = "NOMBRE";
return sendText(user, "¿Nombre de quien retira / responsable?");

case "NOMBRE":
s.data.nombre = msg;
s.paso = "CONFIRM";

const resumen =
`Resumen pedido:
• Tipo: ${s.data.tipo}
• Ítems: ${s.data.items}
• Entrega: ${s.data.entrega}
• Fecha/Hora: ${s.data.cuando}
• Nombre: ${s.data.nombre}`;

return sendButtons(user, resumen, [
{ id: "CONFIRM_SI", title: "Confirmar" },
{ id: "CONFIRM_NO", title: "Cancelar" }
]);

case "CONFIRM":
if (msg === "CONFIRM_SI") {
await sendText(SALES, `Nuevo Pedido:\n${JSON.stringify(s.data, null, 2)}`);
await sendText(user, "✅ Pedido enviado a ventas. Te van a contactar pronto.");
sessions.delete(user);
} else {
await sendText(user, "Pedido cancelado.");
sessions.delete(user);
}
break;
}
}
