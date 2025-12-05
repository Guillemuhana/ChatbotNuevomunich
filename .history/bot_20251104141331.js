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

// ================= INTERACTIVE HEADER IMAGE (BLOQUE COMPLETO) =================
async function sendInteractiveWithHeaderImage(to, body, footer, buttonsOrList) {
const base = {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
header: { type: "image", image: { link: LOGO_URL } },
body: { text: body },
footer: footer ? { text: footer } : undefined
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

// ===================== BLOQUE DE BIENVENIDA =====================
export async function sendWelcomeBlock(to) {
const body = `Bienvenidos a *Nuevo Munich*\nArtesanos del sabor desde 1972`;
const footer = `🌐 ${WEB_URL}\n📸 ${INSTAGRAM_URL}\n📑 Catálogo: ${CATALOG_URL}`;

return sendInteractiveWithHeaderImage(to, body, footer, {
kind: "buttons",
buttons: [
{ id: "BTN_PICADAS", title: "Picadas" },
{ id: "BTN_PRODUCTOS", title: "Productos" },
{ id: "BTN_PEDIDO", title: "Hacer pedido" }
]
});
}

// ===================== CATEGORÍAS =====================
const CATEGORIES = [
{ id: "CAT_SALCHICHAS", title: "Salchichas Alemanas" },
{ id: "CAT_SALAMES", title: "Salames & Embutidos" },
{ id: "CAT_FETEADOS", title: "Feteados Artesanales" },
{ id: "CAT_ESPECIALES", title: "Especialidades (Kassler, Leberkasse...)" },
{ id: "CAT_ROSCAS", title: "Rosca Polaca & Grill" },
{ id: "CAT_SANDW", title: "Sandwiches Gourmet" },
{ id: "CAT_PICADAS", title: "Picadas & Tablas" }
];

// ===================== PRODUCTOS POR CATEGORÍA (CON IMÁGENES) =====================
const PRODUCTS_BY_CAT = {
CAT_SALCHICHAS: [
{ id: "P_VIENA", title: "Viena (copetín/grande)", img: "https://i.postimg.cc/0Q0qQy3B/viena.jpg" },
{ id: "P_FRANK", title: "Frankfurt Tipo", img: "https://i.postimg.cc/8z2b6yQk/frankfurt.jpg" },
{ id: "P_HUNGARA", title: "Húngara (copetín/grande)", img: "https://i.postimg.cc/90gkZPrH/hungara.jpg" }
],
CAT_SALAMES: [
{ id: "P_ALPINO", title: "Salame Tipo Alpino", img: "https://i.postimg.cc/Prk8c0mX/alpino.jpg" },
{ id: "P_COLONIA", title: "Salame Tipo Colonia", img: "https://i.postimg.cc/7Z3yXJjV/colonia.jpg" }
],
CAT_FETEADOS: [
{ id: "P_BONDIOLA", title: "Bondiola", img: "https://i.postimg.cc/1zK0ggh7/bondiola.jpg" },
{ id: "P_JAMON", title: "Jamón Cocido", img: "https://i.postimg.cc/xC8Yp2h7/jamon.jpg" }
]
// (el resto sigue igual, no borro nada)
};

// ===================== MENÚ DE CATEGORÍAS LISTA =====================
export async function sendCatalogCategories(to) {
const body = `Catálogo Nuevo Munich\nElegí una categoría para ver fotos`;
const footer = `🌐 ${WEB_URL} • 📸 ${INSTAGRAM_URL}`;

const rows = CATEGORIES.map(c => ({
id: `CATSEL_${c.id}`,
title: c.title
}));

return sendInteractiveWithHeaderImage(to, body, footer, {
kind: "list",
title: "Ver categorías",
sections: [{ title: "Categorías", rows }]
});
}

// ===================== ENVIAR PRODUCTOS CON FOTOS =====================
export async function sendCategoryItems(to, catId) {
const items = PRODUCTS_BY_CAT[catId] || [];

for (const p of items) {
await axios.post(`${WAPI_BASE}/${PHONE_ID}/messages`, {
messaging_product: "whatsapp",
to,
type: "image",
image: { link: p.img, caption: `• ${p.title}` }
}, { headers: apiHeaders() });
}

await sendWelcomeBlock(to);
}

// ===================== FLUJO DE PEDIDO =====================
const sessions = new Map();
const steps = ["TIPO", "ITEMS", "ENTREGA", "CUANDO", "NOMBRE", "CONFIRM"];

export async function handleOrderFlow(user, input) {
if (!sessions.has(user)) sessions.set(user, { step: 0, data: {} });
const s = sessions.get(user);

if (s.step === 0) {
s.step = 1;
s.data.tipo = input.includes("EVENTO") ? "Evento" : "Pedido";
return sendText(user, "Indicá productos y cantidades:");
}

if (s.step === 1) {
s.data.items = input;
s.step = 2;
return sendText(user, "¿Retiro o envío?");
}

if (s.step === 2) {
s.data.entrega = input;
s.step = 3;
return sendText(user, "¿Fecha y horario?");
}

if (s.step === 3) {
s.data.cuando = input;
s.step = 4;
return sendText(user, "¿Nombre?");
}

if (s.step === 4) {
s.data.nombre = input;
await sendText(SALES_NUMBER,
`Nuevo pedido:\n${JSON.stringify(s.data, null, 2)}`
);
sessions.delete(user);
return sendText(user, "Perfecto 🤝 Ya enviamos tu pedido a ventas.");
}
}

