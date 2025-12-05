// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendBienvenida,
sendMenuPrincipal,
sendCategoriaProductos,
sendSubcategoria,
sendProducto,
sendFoodTruck,
sendCatalogoCompleto,
sendInicioPedidoOpciones,
pedirDatosDelCliente,
sendPedidoConfirmacionCliente,
sendRespuestaIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

/* ======================================================
VERIFICACIÓN DEL WEBHOOK (GET)
====================================================== */
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("Webhook verificado correctamente");
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
const value = entry?.changes?.[0]?.value;
const message = value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const type = message.type;
let msg = null;

// TEXTO
if (type === "text") {
msg = message.text?.body;
}

// BOTONES / LISTAS
if (type === "interactive") {
const inter = message.interactive;

if (inter.type === "button_reply") {
msg = inter.button_reply.id;
} else if (inter.type === "list_reply") {
msg = inter.list_reply.id;
}
}

if (!msg) return res.sendStatus(200);

const lower = msg.toLowerCase();

/* ======================================================
FLUJOS PRINCIPALES
======================================================= */

// → BIENVENIDA
if (
lower === "hola" ||
lower === "buenas" ||
lower === "menu" ||
lower === "menú"
) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// → MENÚ PRINCIPAL
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// → CATEGORÍAS
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// → SUBCATEGORÍAS
if (
msg === "CAT_FETEADOS" ||
msg === "CAT_SALAMES" ||
msg === "CAT_SALCHICHAS" ||
msg === "CAT_ESPECIALIDADES"
) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// → FOOD TRUCK
if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

// → CATÁLOGO PDF
if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

/* ======================================================
SISTEMA DE PEDIDOS
======================================================= */

// 1 → Iniciar pedido
if (msg === "INICIO_PEDIDO") {
await sendInicioPedidoOpciones(from);
return res.sendStatus(200);
}

// 2 → Selección del tipo de pedido
if (msg.startsWith("PEDIDO_")) {
const tipo = msg.replace("PEDIDO_", "").toLowerCase();
await pedirDatosDelCliente(from, tipo);
return res.sendStatus(200);
}

// 3 → Confirmación final (cliente manda un resumen)
if (msg.startsWith("CONFIRMAR_")) {
const resumen = msg.replace("CONFIRMAR_", "");
await sendPedidoConfirmacionCliente(from, resumen);
return res.sendStatus(200);
}

/* ======================================================
IA PARA TODO LO DEMÁS
======================================================= */
await sendRespuestaIA(from, msg);
return res.sendStatus(200);

} catch (err) {
console.error("❌ ERROR EN WEBHOOK:", err);
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

