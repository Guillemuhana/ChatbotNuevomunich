import axios from "axios";
import dotenv from "dotenv";
import { procesarMensajeIA } from "./ia.js";
import { IMAGENES } from "./imagenes.js";

dotenv.config();

// =========================
// CONFIG
// =========================
const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const WEB = "https://nuevomunich.com.ar";

// Sesiones
export const sessions = new Map();

// =========================
// FUNCIÓN DE ENVÍO
// =========================
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// =========================
// MENÚ PRINCIPAL
// =========================
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: {
text:
`*Nuevo Munich* 🥨
Artesanos del sabor desde 1972.

${WEB}`
},
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "Leer más 📖" } },
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos 🥓" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido 📝" } }
]
}
}
});
}

// =========================
// DESCRIPCIÓN AMPLIADA
// =========================
export async function sendDescripcionAmpliada(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
`*Artesanos del Sabor*

Fue en *1972* cuando los primeros dueños, de origen austríaco, trajeron sus recetas heredadas de generaciones y generaciones de sabores centroeuropeos.

Hoy mantenemos ese legado en cada elaboración.

👉 Escribí *Menú* para volver.`
}
});
}

// =========================
// MENÚ PRODUCTOS
// =========================
export async function sendProductosMenu(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Seleccioná una categoría:" },
action: {
buttons: [
{ type: "reply", reply: { id: "CAT_FETEADOS", title: "Feteados" } },
{ type: "reply", reply: { id: "CAT_SALAMES", title: "Salames" } },
{ type: "reply", reply: { id: "CAT_SALCHICHAS", title: "Salchichas Alemanas" } }
]
}
}
});
}

// =========================
// LISTADO DE PRODUCTOS POR CATEGORÍA
// =========================
export async function sendProductosDeCategoria(to, categoria) {
const MAP = {
CAT_FETEADOS: [
"Arrollado Criollo",
"Arrollado de Pollo",
"Bondiola",
"Jamón Cocido",
"Jamón Cocido Tipo Bávaro"
],
CAT_SALAMES: [
"Salame Holstein",
"Salame Tipo Alpino",
"Salame Tipo Colonia"
],
CAT_SALCHICHAS: [
"Salchicha Viena Grande",
"Salchicha Frankfurt Tipo Alemán",
"Salchicha Húngara Grande",
"Salchicha Knackwurst",
"Rosca Polaca"
]
};

const productos = MAP[categoria];

const texto = productos.map(p => `• ${p}`).join("\n");

return send({
messaging_product: "whatsapp",
to,
text: { body: `*Productos disponibles:*\n\n${texto}\n\nElegí uno para ver la imagen 👇` }
});
}

// =========================
// ENVÍO DE IMAGEN DE PRODUCTO
// =========================
export async function sendProductoImagen(to, nombre) {
const url = IMAGENES[nombre];

if (!url) {
return send({
messaging_product: "whatsapp",
to,
text: { body: "No encontré la imagen de ese producto 😕" }
});
}

return send({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: url }
});
}

// =========================
// FLUJO DE PEDIDO
// =========================
export async function iniciarPedido(user) {
sessions.set(user, { paso: "ITEMS", data: {} });

return send({
messaging_product: "whatsapp",
to: user,
text: { body: "Perfecto 😊 ¿Qué productos querés pedir?" }
});
}

export async function flujoPedido(user, msg) {
const s = sessions.get(user);
if (!s) return;

if (s.paso === "ITEMS") {
s.data.items = msg;
s.paso = "NOMBRE";
return send({
messaging_product: "whatsapp",
to: user,
text: { body: "¿A nombre de quién registramos el pedido?" }
});
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
s.paso = "CONFIRMAR";
return send({
messaging_product: "whatsapp",
to: user,
type: "interactive",
interactive: {
type: "button",
body: { text: `Confirmar pedido:\n\n📦 ${s.data.items}\n👤 Nombre: ${s.data.nombre}` },
action: {
buttons: [
{ type: "reply", reply: { id: "CONFIRMAR", title: "Confirmar ✅" } },
{ type: "reply", reply: { id: "CANCELAR", title: "Cancelar ❌" } }
]
}
}
});
}

if (s.paso === "CONFIRMAR") {
if (msg === "CONFIRMAR")
await send({ messaging_product: "whatsapp", to: user, text: { body: "✅ Pedido registrado. ¡Gracias!" } });
else
await send({ messaging_product: "whatsapp", to: user, text: { body: "❌ Pedido cancelado." } });

sessions.delete(user);
}
}

// =========================
// RESPUESTA IA
// =========================
export async function replyIA(to, msg) {
try {
const respuesta = await procesarMensajeIA(msg);
return send({ messaging_product: "whatsapp", to, text: { body: respuesta } });
} catch (error) {
console.log("❌ Error IA Nuevo Munich:", error);
return send({
messaging_product: "whatsapp",
to,
text: { body: "Hubo un error procesando tu consulta." }
});
}
}

