import axios from "axios";
import dotenv from "dotenv";
import { procesarMensajeIA } from "./ia.js";
import { IMAGENES } from "./imagenes.js";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL;
const WEB = process.env.WEB_URL;

export const sessions = new Map();
export const ultimoProducto = new Map();

export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// =============================================================
// MENÚ PRINCIPAL → 2 MENSAJES (PARECE 1 BLOQUE)
// =============================================================
export async function sendMenuPrincipal(to) {

// Bloque superior con logo + bienvenida + leer más
await send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: { text: "*Nuevo Munich 🥨*\nArtesanos del sabor desde 1972.\n" },
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

// =============================================================
// LEER MÁS (DESCRIPCIÓN + MENÚ OTRA VEZ)
// =============================================================
export async function sendLeerMas(to) {
await send({
messaging_product: "whatsapp",
to,
text: { body:
`Somos una chacinería artesanal fundada en 1972.
Elaboramos embutidos y ahumados con recetas centroeuropeas tradicionales.

✔️ Elaboración propia
✔️ Materias primas seleccionadas
✔️ Certificación SENASA

Elegí una opción 👇`
}
});

return sendMenuPrincipal(to);
}

// =============================================================
// PRODUCTOS
// =============================================================
const categorias = {
"feteados": ["Bondiola", "Jamón Cocido"],
"salames": ["Salame Holstein", "Salame Tipo Alpino (Ahumado)", "Salame Tipo Colonia"],
"salchichas": ["Salchicha Viena Grande", "Salchicha Frankfurt Tipo Alemán", "Salchicha Húngara Grande", "Salchicha Knackwurst", "Rosca Polaca"]
};

export async function sendProductosMenu(to) {
return send({
messaging_product:"whatsapp",
to,
text:{ body:"Elegí una categoría:\n\n• Feteados\n• Salames\n• Salchichas Alemanas" }
});
}

export async function sendCategoriaDetalle(to, msg) {
const lista = categorias[msg.toLowerCase()];
if (!lista) return send({ messaging_product:"whatsapp", to, text:{ body:"No entendí esa categoría 😅" } });

return send({
messaging_product:"whatsapp",
to,
text:{ body:`Elegí un producto:\n\n${lista.map(p=>`• ${p}`).join("\n")}` }
});
}

// =============================================================
// ENVÍA FOTO DEL PRODUCTO SELECCIONADO
// =============================================================
export async function sendProductoDetalle(to, nombre) {
const img = IMAGENES[nombre];
if (!img) return replyIA(to, nombre);

ultimoProducto.set(to, nombre);

await send({
messaging_product:"whatsapp",
to,
type:"image",
image:{ link: img }
});

return send({
messaging_product:"whatsapp",
to,
text:{ body:`${nombre}\nProducto artesanal.\n¿Querés una recomendación de picada o armar un pedido? 😊` }
});
}

// =============================================================
// PEDIDOS (FLUJO SIMPLE Y PROFESIONAL)
// =============================================================
export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEM" });
return send({ messaging_product:"whatsapp", to, text:{ body:"Decime qué querés pedir 😊" } });
}

export async function flujoPedido(to, msg) {
const s = sessions.get(to);
if (!s) return;

if (s.paso === "ITEM") {
s.item = msg;
s.paso = "CANTIDAD";
return send({ messaging_product:"whatsapp", to, text:{ body:"¿Cantidad? (Ej: 300g o 1 unidad)" } });
}

if (s.paso === "CANTIDAD") {
s.cantidad = msg;
s.paso = "NOMBRE";
return send({ messaging_product:"whatsapp", to, text:{ body:"¿A nombre de quién?" } });
}

if (s.paso === "NOMBRE") {
s.nombre = msg;
s.paso = "CONFIRMAR";
return send({
messaging_product:"whatsapp",
to,
text:{ body:
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
return send({ messaging_product:"whatsapp", to, text:{ body:"✅ Pedido registrado. ¡Gracias!" } });
}

sessions.delete(to);
return send({ messaging_product:"whatsapp", to, text:{ body:"❌ Pedido cancelado." } });
}

// =============================================================
// IA
// =============================================================
export async function replyIA(to, msg) {
const r = await procesarMensajeIA(msg);
return send({ messaging_product:"whatsapp", to, text:{ body:r } });
}

