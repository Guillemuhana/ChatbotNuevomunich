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
sendChatVentas,
sendRespuestaIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ============================
// VERIFY WEBHOOK
// ============================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
return res.status(200).send(challenge);
}
return res.sendStatus(403);
}
return res.sendStatus(400);
});

// ============================
// RECEIVE MESSAGES
// ============================
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

// bienvenida
if (["hola", "buenas", "menu", "menú"].includes(lower)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// menú
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// chat ventas
if (msg === "VENTAS_DIRECTO") {
await sendChatVentas(from);
return res.sendStatus(200);
}

// categorías
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// subcategorías
if (msg.startsWith("CAT_")) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// food truck
if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

// catálogo
if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

// pedidos
if (msg === "INICIO_PEDIDO") {
await sendInicioPedidoOpciones(from);
return res.sendStatus(200);
}

if (msg === "PEDIDO_FORM") {
await pedirDatosDelCliente(from);
return res.sendStatus(200);
}

if (msg.startsWith("CONFIRMAR_")) {
await sendPedidoConfirmacionCliente(
from,
msg.replace("CONFIRMAR_", "")
);
return res.sendStatus(200);
}

// IA general
await sendRespuestaIA(from, msg);
return res.sendStatus(200);

} catch (e) {
console.error("❌ WEBHOOK ERROR:", e);
return res.sendStatus(500);
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
console.log(`BOT LISTO → http://localhost:${PORT}`)
);

