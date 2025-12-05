// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendWelcomeBlock,
sendProductosMenu,
sendCategoriaDetalle,
initOrderSession,
handleOrderFlow
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// ---- Webhook verification ----
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
return res.send(req.query["hub.challenge"]);
}
return res.sendStatus(403);
});

// ---- Webhook message handler ----
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from; // teléfono
const text = message.text?.body;
const button = message.button?.payload;
const msg = button || text;

console.log("💬 Mensaje recibido:", msg);

if (!msg) return res.sendStatus(200);

// ✅ MENÚ PRINCIPAL
if (["hola", "Hola", "menu", "Menu", "inicio"].includes(msg)) {
await sendWelcomeBlock(from);
return res.sendStatus(200);
}

// ✅ PICADAS
if (msg === "BTN_PICADAS") {
await sendCategoriaDetalle(from, "PICADAS");
return res.sendStatus(200);
}

// ✅ PRODUCTOS → MENU
if (msg === "BTN_PRODUCTOS") {
await sendProductosMenu(from);
return res.sendStatus(200);
}

// ✅ HACER PEDIDO
if (msg === "BTN_PEDIDO") {
initOrderSession(from);
await handleOrderFlow(from, null);
return res.sendStatus(200);
}

// ✅ CONTINUAR FLUJO DE PEDIDO
await handleOrderFlow(from, msg);

res.sendStatus(200);
} catch (err) {
console.log("❌ Error:", err);
res.sendStatus(500);
}
});

app.listen(3000, () =>
console.log("🚀 BOT LISTO EN http://localhost:3000 (puerto 3000)")
);
