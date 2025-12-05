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
sendChatConVentas,
sendRespuestaIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ======================================================
// VERIFICACIÓN WEBHOOK
// ======================================================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
}
return res.sendStatus(400);
});

// ======================================================
// RECEPCIÓN DE MENSAJES
// ======================================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const value = entry?.changes?.[0]?.value;
const message = value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
let msg = null;

if (message.type === "text") msg = message.text.body;

if (message.type === "interactive") {
const i = message.interactive;
if (i.type === "button_reply") msg = i.button_reply.id;
if (i.type === "list_reply") msg = i.list_reply.id;
}

if (!msg) return res.sendStatus(200);

const lower = msg.toLowerCase();

// BIENVENIDA
if (["hola", "buenas", "menu", "menú"].includes(lower)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// MENÚ
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// PRODUCTOS
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

if (
msg === "CAT_FETEADOS" ||
msg === "CAT_SALAMES" ||
msg === "CAT_SALCHICHAS" ||
msg === "CAT_ESPECIALIDADES"
) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// FOOD TRUCK
if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

// CATALOGO
if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

// INICIO PEDIDO
if (msg === "INICIO_PEDIDO") {
await sendInicioPedidoOpciones(from);
return res.sendStatus(200);
}

// FORMULARIO PEDIDO
if (msg === "PEDIDO_FORMULARIO") {
await pedirDatosDelCliente(from);
return res.sendStatus(200);
}

// CHAT CON VENTAS
if (msg === "CHAT_VENTAS") {
await sendChatConVentas(from);
return res.sendStatus(200);
}

// CONFIRMAR PEDIDO
if (msg.startsWith("CONFIRMAR_")) {
const resumen = msg.replace("CONFIRMAR_", "");
await sendPedidoConfirmacionCliente(from, resumen);
return res.sendStatus(200);
}

// IA
await sendRespuestaIA(from, msg);
return res.sendStatus(200);

} catch (err) {
console.error("❌ ERROR WEBHOOK:", err);
return res.sendStatus(500);
}
});

// ======================================================
// SERVIDOR
// ======================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BOT LISTO → http://localhost:${PORT}`));

