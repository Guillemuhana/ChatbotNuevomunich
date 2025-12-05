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

// =============================================
// VERIFICACIÓN WEBHOOK
// =============================================
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

// =============================================
// MANEJO DE MENSAJES
// =============================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const message = entry?.changes?.[0]?.value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
let msg = null;

if (message.type === "text") msg = message.text.body;

if (message.type === "interactive") {
const inter = message.interactive;
if (inter.type === "button_reply") msg = inter.button_reply.id;
if (inter.type === "list_reply") msg = inter.list_reply.id;
}

if (!msg) return res.sendStatus(200);

const lower = msg.toLowerCase();

// --- Bienvenida
if (["hola", "buenas", "menu", "menú"].includes(lower)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// --- Menú principal
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// --- Chat con ventas
if (msg === "CHAT_CON_VENTAS") {
await sendChatConVentas(from);
return res.sendStatus(200);
}

// --- Productos
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

if (msg.startsWith("CAT_")) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// --- Food truck
if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

// --- Catálogo
if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

// --- Pedido
if (msg === "INICIO_PEDIDO") {
await sendInicioPedidoOpciones(from);
return res.sendStatus(200);
}

if (msg === "REALIZAR_PEDIDO") {
await pedirDatosDelCliente(from);
return res.sendStatus(200);
}

if (msg.startsWith("CONFIRMAR_")) {
const resumen = msg.replace("CONFIRMAR_", "");
await sendPedidoConfirmacionCliente(from, resumen);
return res.sendStatus(200);
}

// --- IA PARA TODO LO DEMÁS
await sendRespuestaIA(from, msg);
return res.sendStatus(200);

} catch (err) {
console.error("❌ ERROR WEBHOOK:", err);
return res.sendStatus(500);
}
});

// =============================================
// INICIAR SERVIDOR
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
console.log(`BOT LISTO → http://localhost:${PORT}`)
);

