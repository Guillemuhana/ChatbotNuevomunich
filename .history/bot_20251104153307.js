// bot.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const WAPI = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
const TOKEN = process.env.WHATSAPP_TOKEN;

const LOGO_URL = process.env.LOGO_URL;
const WEB_URL = process.env.WEB_URL;
const INSTAGRAM_URL = process.env.INSTAGRAM_URL;
const CATALOG_URL = process.env.CATALOG_URL;
const SALES_NUMBER = process.env.SALES_NUMBER;

function api() {
return {
headers: {
Authorization: `Bearer ${TOKEN}`,
"Content-Type": "application/json"
}
};
}

/* ========================= ENVIAR CON LOGO (BLOQUE ÚNICO) ========================= */
export async function sendBlock(to, body, footer, buttons) {
return axios.post(WAPI, {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
header: { type: "image", image: { link: LOGO_URL } },
body: { text: body },
footer: footer ? { text: footer } : undefined,
type: "button",
action: {
buttons: buttons.map(b => ({
type: "reply",
reply: { id: b.id, title: b.title }
}))
}
}
}, api());
}

/* ========================= BIENVENIDA ========================= */
export async function sendWelcome(to) {
const body = `Bienvenidos a Nuevo Munich
Artesanos del sabor desde 1972`;

const footer = `Web: ${WEB_URL}
Instagram: ${INSTAGRAM_URL}
Catálogo: ${CATALOG_URL}`;

return sendBlock(to, body, footer, [
{ id: "BTN_PICADAS", title: "Picadas" },
{ id: "BTN_PRODUCTOS", title: "Productos" },
{ id: "BTN_PEDIDO", title: "Hacer pedido" }
]);
}

/* ========================= CATALOGO ========================= */
const CATEGORIES = [
{ id: "CAT_SALCHICHAS", title: "Salchichas Alemanas" },
{ id: "CAT_SALAMES", title: "Salames & Embutidos" },
{ id: "CAT_FETEADOS", title: "Feteados Artesanales" },
{ id: "CAT_PICADAS", title: "Picadas & Tablas" }
];

export async function sendCatalog(to) {
return axios.post(WAPI, {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
header: { type: "image", image: { link: LOGO_URL } },
body: { text: "Elegí una categoría para ver fotos:" },
type: "list",
action: {
button: "Ver categorías",
sections: [
{
title: "Catálogo",
rows: CATEGORIES.map(c => ({
id: `CAT_${c.id}`,
title: c.title
}))
}
]
},
footer: { text: `Web: ${WEB_URL} • Instagram: ${INSTAGRAM_URL}` }
}
}, api());
}

/* ========================= PEDIDO (FLUJO GUIADO) ========================= */
const sessions = new Map();

export function initOrder(user) {
sessions.set(user, {
step: 1,
data: { tipo: "", items: "", entrega: "", cuando: "", nombre: "" }
});

return sendBlock(user, "¿Para qué es el pedido?", "",
[
{ id: "ORD_TIPO_FAMILIAR", title: "Consumo familiar" },
{ id: "ORD_TIPO_EVENTO", title: "Evento" },
{ id: "ORD_TIPO_OTRO", title: "Hotel/Rest./Otro" }
]
);
}

export async function handleOrder(user, input) {
const s = sessions.get(user);

if (!s) return initOrder(user);

if (s.step === 1) {
const map = {
"ORD_TIPO_FAMILIAR": "Consumo familiar",
"ORD_TIPO_EVENTO": "Evento",
"ORD_TIPO_OTRO": "Hotel/Rest./Otro"
};
s.data.tipo = map[input] || input;
s.step = 2;
return axios.post(WAPI, {
messaging_product: "whatsapp",
to: user,
text: { body: "Decinos productos y cantidades:" }
}, api());
}

if (s.step === 2) {
s.data.items = input;
s.step = 3;
return sendBlock(user, "¿Cómo preferís recibirlo?", "",
[
{ id: "ORD_ENT_RETIRO", title: "Retiro" },
{ id: "ORD_ENT_ENVIO", title: "Envío" }
]
);
}

if (s.step === 3) {
s.data.entrega = input === "ORD_ENT_ENVIO" ? "Envío" : "Retiro";
s.step = 4;
return axios.post(WAPI, {
messaging_product: "whatsapp",
to: user,
text: { body: "¿Para qué fecha y horario?" }
}, api());
}

if (s.step === 4) {
s.data.cuando = input;
s.step = 5;
return axios.post(WAPI, {
messaging_product: "whatsapp",
to: user,
text: { body: "Nombre para registrar el pedido:" }
}, api());
}

if (s.step === 5) {
s.data.nombre = input;
s.step = 6;

const resumen = `🔥 *Nuevo Pedido Entrante*

👤 Cliente: ${s.data.nombre}
🎯 Tipo: ${s.data.tipo}

🛒 Pedido:
${s.data.items}

🚚 Entrega: ${s.data.entrega}
⏰ Fecha/Horario: ${s.data.cuando}

¿Confirmamos envío a ventas?`;

return sendBlock(user, resumen, "", [
{ id: "ORD_CONFIRM_SI", title: "Confirmar" },
{ id: "ORD_CONFIRM_NO", title: "Editar" }
]);
}

if (input === "ORD_CONFIRM_SI") {
await axios.post(WAPI, {
messaging_product: "whatsapp",
to: SALES_NUMBER,
text: { body: `🔥 *Nuevo Pedido Entrante*\n\n👤 Cliente: ${s.data.nombre}\n🎯 Tipo: ${s.data.tipo}\n\n🛒 Pedido:\n${s.data.items}\n\n🚚 Entrega: ${s.data.entrega}\n⏰ Fecha/Horario: ${s.data.cuando}\n\nPor favor confirmar stock y coordinar envío ✅` }
}, api());

sessions.delete(user);
return axios.post(WAPI, {
messaging_product: "whatsapp",
to: user,
text: { body: "¡Listo! Ya enviamos tu pedido ✅" }
}, api());
}
}

