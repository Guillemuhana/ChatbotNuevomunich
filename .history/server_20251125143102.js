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
sendRespuestaIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

/* ======================================================
VERIFICACIÓN DEL WEBHOOK
====================================================== */
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado");
return res.status(200).send(challenge);
}
return res.sendStatus(403);
}

res.sendStatus(400);
});

/* ======================================================
RECEPCIÓN DE MENSAJES
====================================================== */
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const message = entry?.changes?.[0]?.value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
let msg = null;

if (message.type === "text") msg = message.text.body;
if (message.type === "interactive") {
if (message.interactive.type === "button_reply")
msg = message.interactive.button_reply.id;
if (message.interactive.type === "list_reply")
msg = message.interactive.list_reply.id;
}

console.log("📩 Recibido:", msg);

if (!msg) return res.sendStatus(200);

const lower = msg.toLowerCase();

// SALUDOS
if (
["hola", "hola!", "buenas", "menu", "menú", "menu principal", "menú principal"]
.includes(lower)
) {
await sendBienvenida(from);
return res.sendStatus(200);
}

if (msg === "LEER_MAS") return (await sendLeerMas(from), res.sendStatus(200));
if (msg === "MENU_PRINCIPAL") return (await sendMenuPrincipal(from), res.sendStatus(200));
if (msg === "CAT_PRODUCTOS") return (await sendCategoriaProductos(from), res.sendStatus(200));

if (
["CAT_FETEADOS", "CAT_SALAMES", "CAT_SALCHICHAS", "CAT_ESPECIALIDADES"]
.includes(msg)
) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

if (msg === "FOOD_TRUCK") return (await sendFoodTruck(from), res.sendStatus(200));
if (msg === "CONSULTAR_PEDIDO") return (await sendConsultarPedido(from), res.sendStatus(200));
if (msg === "CATALOGO_PDF") return (await sendCatalogoCompleto(from), res.sendStatus(200));

// IA
await sendRespuestaIA(from, msg);
return res.sendStatus(200);

} catch (err) {
console.error("❌ ERROR WEBHOOK:", err);
return res.sendStatus(500);
}
});

/* ======================================================
INICIO DEL SERVIDOR
====================================================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 BOT LISTO → http://localhost:${PORT}`));

