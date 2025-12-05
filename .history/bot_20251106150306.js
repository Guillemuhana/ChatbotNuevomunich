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
const CATALOGO = process.env.CATALOG_URL;

// ---- Envío base ----
async function sendInteractive(to, content) {
return axios.post(
`${API}/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: content
},
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

async function sendText(to, text) {
return axios.post(
`${API}/${PHONE_ID}/messages`,
{ messaging_product: "whatsapp", to, text: { body: text } },
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

// ---- MENÚ PRINCIPAL ----
export async function sendMenuPrincipal(to) {
return sendInteractive(to, {
type: "button",
header: {
type: "image",
image: { link: LOGO }
},
body: {
text: "*Bienvenidos a Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:"
},
footer: {
text: `🌐 ${WEB} | 📸 ${IG} | 📦 Catálogo: ${CATALOGO}`
},
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PICADAS", title: "Picadas" } },
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
]
}
});
}

// ---- MENÚ DE PRODUCTOS ----
export async function sendProductosMenu(to) {
return sendInteractive(to, {
type: "button",
body: { text: "Seleccioná una categoría:" },
footer: { text: `📦 Catálogo: ${CATALOGO}` },
action: {
buttons: [
{ type: "reply", reply: { id: "P_PICADAS", title: "Picadas y Tablas" } },
{ type: "reply", reply: { id: "P_SALCHICHAS", title: "Salchichas Alemanas" } },
{ type: "reply", reply: { id: "P_GRILL", title: "Grill / Parrilla" } }
]
}
});
}

// ---- DESCRIPCIÓN DE CATEGORÍAS ----
export async function sendCategoria(to, id) {
let text = "";

if (id === "P_PICADAS")
text = "🥓 *Picadas y Tablas*\nFiambres y pan artesanal.\n\nCatálogo: " + CATALOGO;

if (id === "P_SALCHICHAS")
text = "🌭 *Salchichas Alemanas*\nVienna, Frankfurt, Húngara.\n\nCatálogo: " + CATALOGO;

if (id === "P_GRILL")
text = "🔥 *Parrilla / Grill*\nKassler, rosca polaca, sabores ahumados.\n\nCatálogo: " + CATALOGO;

return sendText(to, text);
}

// ---- PEDIDOS ----
export async function iniciarPedido(to) {
return sendText(to, "Decime qué querés pedir 🙂");
}

