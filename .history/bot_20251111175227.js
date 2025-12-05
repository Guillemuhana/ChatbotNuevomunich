import axios from "axios";
import dotenv from "dotenv";
import { procesarMensajeIA } from "./ia.js";
import { IMAGENES } from "./imagenes.js";
dotenv.config();

// ============================================
// CONFIG
// ============================================
const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL;
const WEB = process.env.WEB_URL;

// Estado de pedidos
export const sessions = new Map();
export const ultimoProducto = new Map();

// ============================================
// FUNCIÓN GENERAL DE ENVÍO
// ============================================
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// ============================================
// MENÚ PRINCIPAL (LOGO + LEER MÁS + BOTONES)
// ============================================
export async function sendMenuPrincipal(to) {

// Bienvenida
await send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: { text: "*Nuevo Munich 🥨*\nArtesanos del sabor desde 1972." },
footer: { text: WEB },
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "Leer más 📖" } }
]
}
}
});

// Botones principales
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una opción:" },
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos 🥓" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos & Catering 🍽️" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido 📝" } }
]
}
}
});
}

// ============================================
// PRODUCTOS → CATEGORÍAS
// ============================================
const categorias = {
"feteados": ["Bondiola", "Jamón Cocido", "Lomo Ahumado a las Finas Hierbas", "Panceta Ahumada"],
"salames": ["Salame Holstein", "Salame Tipo Alpino (Ahumado)", "Salame Tipo Colonia"],
"salchichas": ["Salchicha Viena Grande", "Salchicha Frankfurt Tipo Alemán", "Salchicha Húngara Grande", "Salchicha Knackwurst", "Rosca Polaca"]
};

export async function sendProductosMenu(to) {
return send({
messaging_product: "whatsapp",
to,
text: { body: "Elegí una categoría:\n\n• Feteados\n• Salames\n• Salchichas" }
});
}

export async function sendCategoriaDetalle(to, msg) {
const lista = categorias[msg.toLowerCase()];
if (!lista) return send({ messaging_product: "whatsapp", to, text: { body: "No entendí esa categoría 😅" } });

return send({
messaging_product: "whatsapp",
to,
text: { body: `Elegí un producto:\n\n${lista.map(p => `• ${p}`).join("\n")}` }
});
}

// ============================================
// ENVÍA IMAGEN DEL PRODUCTO SELECCIONADO
// ============================================
export async function sendProductoDetalle(to, nombre) {

const img = IMAGENES[nombre];

// Si no hay imagen → pasa a la IA
if (!img) return replyIA(to, nombre);

ultimoProducto.set(to, nombre);

// Imagen del producto
await send({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: img }
});

// Mensaje descriptivo
return send({
messaging_product: "whatsapp",
to,
text: { body: `${nombre}\nProducto artesanal.\n¿Querés combinarlo en una picada o armar un pedido? 😊` }
});
}

// ============================================
// FLUJO DE PEDIDO PROFESIONAL
// ============================================
export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEM" });
return send({ messaging_product: "whatsapp", to, text: { body: "Decime qué producto querés pedir 😊" } });
}

export async function flujoPedido(to, msg) {
const s = sessions.get(to);
if (!s) return;

if (s.paso === "ITEM") {
s.item = msg;
s.paso = "CANTIDAD";
return send({ messaging_product: "whatsapp", to, text: { body: "¿Cantidad? (Ej: 300g o 1 unidad)" } });
}

if (s.paso === "CANTIDAD") {
s.cantidad = msg;
s.paso = "NOMBRE";
return send({ messaging_product: "whatsapp", to, text: { body: "¿A nombre de quién registramos el pedido?" } });
}

if (s.paso === "NOMBRE") {
s.nombre = msg;
s.paso = "CONFIRM";
return send({
messaging_product: "whatsapp",
to,
text: {
body:
`Confirmamos pedido? 👇

📦 ${s.item}
⚖️ ${s.cantidad}
👤 ${s.nombre}

Responder: Confirmar ✅ o Cancelar ❌`
}
});
}

if (msg.toLowerCase().includes("confirm")) {
sessions.delete(to);
return send({ messaging_product: "whatsapp", to, text: { body: "✅ Pedido registrado. ¡Gracias! Nos comunicamos para coordinar entrega." } });
}

sessions.delete(to);
return send({ messaging_product: "whatsapp", to, text: { body: "❌ Pedido cancelado." } });
}

// ============================================
// IA RESPONDE CONSULTAS
// ============================================
export async function replyIA(to, msg) {
const r = await procesarMensajeIA(msg);
return send({ messaging_product: "whatsapp", to, text: { body: r } });
}

