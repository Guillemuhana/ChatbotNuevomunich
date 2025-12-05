// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendBienvenida,
sendLeerMas,
sendMenuPrincipal,
sendCategoriaProductos,
sendSubcategoria,
sendProducto,
sendFoodTruck,
sendConsultarPedido,
sendCatalogoCompleto,
sendRespuestaIA,
sendInicioPedidoOpciones,
sendTextoSimple,
VENTAS_PHONE
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// Mapa para guardar el estado del formulario de pedido
const pedidos = new Map();
const VENTAS_PHONE_HUMANO = "+54 9 3517 01-0545";

/* ======================================================
VERIFICACIÓN DEL WEBHOOK (GET)
====================================================== */
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ WEBHOOK VERIFICADO CON META");
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
}

return res.sendStatus(400);
});

/* ======================================================
MANEJO DEL FLUJO DE PEDIDO (GUIADO / RÁPIDO)
====================================================== */
async function manejarFlujoPedido(from, msg) {
const ses = pedidos.get(from);
if (!ses) return;

// MODO RÁPIDO: un solo mensaje con todo
if (ses.modo === "RAPIDO") {
if (ses.paso === "DETALLE") {
ses.data = { detalle: msg };

const resumenVentas =
"📩 NUEVO PEDIDO / CONSULTA RÁPIDA\n\n" +
`📱 Cliente: https://wa.me/${from}\n\n` +
"Detalle enviado por el cliente:\n" +
msg +
"\n\n— Enviado automáticamente desde el bot de Nuevo Munich";

await sendTextoSimple(VENTAS_PHONE, resumenVentas);

await sendTextoSimple(
from,
"🙏 ¡Gracias! Ya recibimos tu mensaje y lo derivamos al equipo de ventas.\n" +
"Ellos te van a responder por WhatsApp para seguir con tu pedido 😊"
);

pedidos.delete(from);
}
return;
}

// MODO GUIADO: paso a paso
if (ses.modo === "GUIADO") {
const d = ses.data;

switch (ses.paso) {
case 1: {
const num = msg.trim();
const tipos = {
"1": "Particular",
"2": "Restaurante",
"3": "Hotel",
"4": "Evento",
"5": "Food Truck",
"6": "Otro"
};
d.tipoCliente = tipos[num] || msg;
ses.paso = 2;

await sendTextoSimple(
from,
"📅 ¿Para qué fecha necesitás el pedido o evento?\n" +
'Ej: "viernes 12", "lo antes posible", "fin de semana".'
);
break;
}

case 2: {
d.fecha = msg;
ses.paso = 3;

await sendTextoSimple(
from,
"📍 Contanos la ubicación o dirección.\n" +
"Podés escribirla o enviar tu ubicación desde WhatsApp."
);
break;
}

case 3: {
d.ubicacion = msg;
ses.paso = 4;

await sendTextoSimple(
from,
"🥨 ¿Qué productos te interesan?\n" +
'Ej: "bondiola", "salchichas Frankfurt", "picada para 20 personas", etc.'
);
break;
}

case 4: {
d.productos = msg;
ses.paso = 5;

await sendTextoSimple(
from,
"📦 ¿Qué cantidad aproximada estás pensando?\n" +
'Ej: "2 kg", "3 paquetes", "para 20 personas".'
);
break;
}

case 5: {
d.cantidad = msg;
ses.paso = 6;

await sendTextoSimple(
from,
"🚚 ¿Retiro por el local o necesitás envío?"
);
break;
}

case 6: {
d.envio = msg;
ses.paso = 7;

await sendTextoSimple(
from,
"📝 ¿Querés agregar algún detalle extra? (opcional)\n" +
'Si no, podés responder "No".'
);
break;
}

case 7: {
d.notas = msg;

const resumenCliente =
"✅ Gracias, ya tenemos los datos de tu pedido / presupuesto:\n\n" +
`👤 Tipo de cliente: ${d.tipoCliente}\n` +
`📅 Fecha: ${d.fecha}\n` +
`📍 Ubicación: ${d.ubicacion}\n` +
`🥨 Productos: ${d.productos}\n` +
`📦 Cantidad: ${d.cantidad}\n` +
`🚚 Retiro / Envío: ${d.envio}\n` +
`📝 Notas: ${d.notas}\n\n` +
`Este detalle se envió a nuestro equipo de ventas (${VENTAS_PHONE_HUMANO}).\n` +
"Te van a responder por WhatsApp para terminar de coordinar 😊";

const resumenVentas =
"📩 NUEVO PEDIDO / CONSULTA DESDE EL BOT\n\n" +
`📱 Cliente: https://wa.me/${from}\n` +
`👤 Tipo de cliente: ${d.tipoCliente}\n` +
`📅 Fecha: ${d.fecha}\n` +
`📍 Ubicación: ${d.ubicacion}\n` +
`🥨 Productos: ${d.productos}\n` +
`📦 Cantidad: ${d.cantidad}\n` +
`🚚 Retiro / Envío: ${d.envio}\n` +
`📝 Notas: ${d.notas}\n\n` +
"— Enviado automáticamente desde el bot de Nuevo Munich";

await sendTextoSimple(from, resumenCliente);
await sendTextoSimple(VENTAS_PHONE, resumenVentas);

pedidos.delete(from);
break;
}
}
}
}

/* ======================================================
RECEPCIÓN DE MENSAJES (POST)
====================================================== */
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0];
const value = changes?.value;
const message = value?.messages?.[0];

if (!message) {
console.log("📭 MENSAJE RECIBIDO: null");
return res.sendStatus(200);
}

const from = message.from;
const type = message.type;
let msg = null;

if (type === "text") {
msg = message.text?.body;
} else if (type === "interactive") {
const interactive = message.interactive;
if (interactive.type === "button_reply") {
msg = interactive.button_reply?.id;
} else if (interactive.type === "list_reply") {
msg = interactive.list_reply?.id;
}
} else if (type === "location") {
const loc = message.location;
msg =
`Ubicación compartida: ` +
`${loc.name || ""} ${loc.address || ""}`.trim() +
` (lat: ${loc.latitude}, lng: ${loc.longitude})`;
}

console.log("📩 MENSAJE RECIBIDO:", msg);

if (!msg) return res.sendStatus(200);

const lower = msg.toLowerCase();

// Si el usuario está en medio de un formulario de pedido → lo atendemos primero
if (pedidos.has(from)) {
await manejarFlujoPedido(from, msg);
return res.sendStatus(200);
}

// 1) SALUDOS → BIENVENIDA
if (
lower === "hola" ||
lower === "hola!" ||
lower === "buenas" ||
lower === "menu" ||
lower === "menú" ||
lower === "menu principal" ||
lower === "menú principal"
) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// 2) LEER MÁS
if (msg === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

// 3) MENÚ PRINCIPAL
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// 4) PRODUCTOS (CATEGORÍAS)
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// 5) SUBCATEGORÍAS
if (
msg === "CAT_FETEADOS" ||
msg === "CAT_SALAMES" ||
msg === "CAT_SALCHICHAS" ||
msg === "CAT_ESPECIALIDADES"
) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// 6) PRODUCTO SELECCIONADO DIRECTO (por si en el futuro usás IDs tipo PROD_)
if (msg.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

// 7) FOOD TRUCK
if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

// 8) CONSULTAR PEDIDO (texto simple heredado)
if (msg === "CONSULTAR_PEDIDO") {
await sendConsultarPedido(from);
return res.sendStatus(200);
}

// 9) CATÁLOGO PDF
if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

// 10) INICIAR PEDIDO (por palabras clave)
if (
msg === "INICIAR_PEDIDO" ||
lower.includes("realizar pedido") ||
lower.includes("hacer un pedido") ||
lower === "pedido" ||
lower.includes("presupuesto")
) {
await sendInicioPedidoOpciones(from);
return res.sendStatus(200);
}

// 11) ELECCIÓN DE MODO DE PEDIDO
if (msg === "FORM_PEDIDO_GUIADO") {
pedidos.set(from, { modo: "GUIADO", paso: 1, data: {} });

await sendTextoSimple(
from,
"Genial, vamos a armar tu pedido paso a paso 😊\n\n" +
"¿Para quién es el pedido?\n" +
"1) Particular\n" +
"2) Restaurante\n" +
"3) Hotel\n" +
"4) Evento\n" +
"5) Food Truck\n" +
"6) Otro\n\n" +
"Enviame sólo el número."
);
return res.sendStatus(200);
}

if (msg === "FORM_PEDIDO_RAPIDO") {
pedidos.set(from, { modo: "RAPIDO", paso: "DETALLE", data: {} });

await sendTextoSimple(
from,
"Perfecto 😊\n" +
"Escribime en un solo mensaje:\n" +
"- Para quién es (particular, restaurante, hotel, evento, etc.)\n" +
"- Fecha\n" +
"- Ubicación\n" +
"- Productos que querés\n" +
"- Cantidad aproximada\n" +
"- Si es retiro o envío\n" +
"- Algún detalle extra\n\n" +
"Todo junto en un único mensaje, así lo enviamos directo a ventas."
);
return res.sendStatus(200);
}

// 12) CUALQUIER OTRA COSA → IA
await sendRespuestaIA(from, msg);
return res.sendStatus(200);
} catch (err) {
console.error("❌ ERROR EN WEBHOOK:", err.response?.data || err);
return res.sendStatus(500);
}
});

/* ======================================================
INICIAR SERVIDOR
====================================================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${PORT}`);
});

