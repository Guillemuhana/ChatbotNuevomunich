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
sendCatalogoCompleto,
sendRespuestaIA,
sendInicioPedidoOpciones,
sendTextoSimple,
sendPedidoConfirmacionCliente,
sendPedidoNotificarVentas
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// Estado simple en memoria para el flujo de pedidos
// estructura: { paso, tipo, nombre, fecha, ubicacion, detalle }
const pedidos = new Map();

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
}

console.log("📩 MENSAJE RECIBIDO:", msg);

if (!msg) return res.sendStatus(200);

const lower = (msg || "").toLowerCase();

/* ==========================
1) SALUDOS → BIENVENIDA
========================== */
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

/* ==========================
2) LEER MÁS
========================== */
if (msg === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

/* ==========================
3) MENÚ PRINCIPAL
========================== */
if (msg === "MENU_PRINCIPAL") {
// si estaba en un flujo de pedido, lo cancelamos
if (pedidos.has(from)) pedidos.delete(from);
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

/* ==========================
4) PRODUCTOS (CATEGORÍAS)
========================== */
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

/* ==========================
5) SUBCATEGORÍAS
========================== */
if (
msg === "CAT_FETEADOS" ||
msg === "CAT_SALAMES" ||
msg === "CAT_SALCHICHAS" ||
msg === "CAT_ESPECIALIDADES"
) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

/* ==========================
6) PRODUCTO SELECCIONADO DIRECTO
(por si en el futuro usás IDs tipo PROD_)
========================== */
if (msg.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

/* ==========================
7) FOOD TRUCK
========================== */
if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

/* ==========================
8) CATÁLOGO PDF POR TEXTO
========================== */
if (
lower === "catalogo" ||
lower === "catálogo" ||
lower === "catalogo pdf" ||
lower === "catálogo pdf"
) {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

/* ==========================
9) INICIO FLUJO DE PEDIDO
- Botón "CONSULTAR_PEDIDO"
- O texto tipo "realizar pedido"
========================== */
if (
msg === "CONSULTAR_PEDIDO" ||
lower === "realizar pedido" ||
lower === "hacer pedido" ||
lower === "pedido" ||
lower === "armar pedido"
) {
pedidos.set(from, {
paso: 0,
tipo: "",
nombre: "",
fecha: "",
ubicacion: "",
detalle: ""
});

await sendInicioPedidoOpciones(from);
return res.sendStatus(200);
}

/* ==========================
10) ELECCIÓN DE TIPO DE PEDIDO (LISTA)
========================== */
if (
msg === "PEDIDO_PARTICULAR" ||
msg === "PEDIDO_EVENTO" ||
msg === "PEDIDO_EMPRESA" ||
msg === "PEDIDO_FOODTRUCK"
) {
const estado = pedidos.get(from) || {
paso: 0,
tipo: "",
nombre: "",
fecha: "",
ubicacion: "",
detalle: ""
};

let tipoTexto = "";
if (msg === "PEDIDO_PARTICULAR") tipoTexto = "Particular";
if (msg === "PEDIDO_EVENTO") tipoTexto = "Evento";
if (msg === "PEDIDO_EMPRESA") tipoTexto = "Restaurante / Hotel";
if (msg === "PEDIDO_FOODTRUCK") tipoTexto = "Food Truck";

estado.tipo = tipoTexto;
estado.paso = 1;
pedidos.set(from, estado);

await sendTextoSimple(
from,
`Perfecto, anotamos que es un pedido para *${tipoTexto}*.\n\n¿A nombre de quién hacemos el pedido? (Nombre y apellido)`
);
return res.sendStatus(200);
}

/* ==========================
11) SI HAY FLUJO DE PEDIDO ACTIVO → MANEJAR PASOS
========================== */
if (pedidos.has(from) && type === "text") {
const estado = pedidos.get(from);

if (estado.paso === 1) {
// nombre
estado.nombre = msg;
estado.paso = 2;
pedidos.set(from, estado);

await sendTextoSimple(
from,
"📅 Genial. ¿Para qué *fecha y horario aproximado* es el pedido?"
);
return res.sendStatus(200);
}

if (estado.paso === 2) {
// fecha / horario
estado.fecha = msg;
estado.paso = 3;
pedidos.set(from, estado);

await sendTextoSimple(
from,
"📍 Perfecto. ¿En qué *lugar / dirección* sería? Podés escribir barrio y ciudad o adjuntar ubicación."
);
return res.sendStatus(200);
}

if (estado.paso === 3) {
// ubicación
estado.ubicacion = msg;
estado.paso = 4;
pedidos.set(from, estado);

await sendTextoSimple(
from,
"🧀 Genial. Ahora contame *qué productos te interesan* o qué tipo de picada / servicio estás buscando."
);
return res.sendStatus(200);
}

if (estado.paso === 4) {
// detalle del pedido
estado.detalle = msg;
estado.paso = 5;
pedidos.set(from, estado);

// Armamos el resumen
const resumen =
`👤 Tipo de pedido: ${estado.tipo}\n` +
`🙋‍♂️ Nombre: ${estado.nombre}\n` +
`📅 Fecha / horario: ${estado.fecha}\n` +
`📍 Ubicación: ${estado.ubicacion}\n` +
`🧀 Detalle del pedido: ${estado.detalle}\n` +
`📱 Teléfono cliente: ${from}`;

// 1) Enviamos resumen al cliente
await sendPedidoConfirmacionCliente(from, resumen);

// 2) Notificamos al número de ventas
await sendPedidoNotificarVentas(resumen, from);

// 3) Limpiamos estado
pedidos.delete(from);

return res.sendStatus(200);
}
}

/* ==========================
12) CUALQUIER OTRA COSA → IA
========================== */
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

