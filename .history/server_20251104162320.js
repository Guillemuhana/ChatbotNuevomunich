// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendWelcomeBlock,
sendProductosMenu,
sendPicadasInfo,
handleOrderFlow,
} from "./bot.js";

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

// ===== Webhook GET (verificación) =====
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) res.send(challenge);
else res.sendStatus(403);
});

// ===== Webhook POST (mensajes entrantes) =====
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const message = entry.changes?.[0].value.messages?.[0];

if (message) {
const from = message.from;
const type = message.type;

if (type === "text") {
const text = message.text.body.toLowerCase();

if (text.includes("hola") || text.includes("buen")) {
return await sendWelcomeBlock(from);
}

if (text.includes("picada")) return await sendPicadasInfo(from);
if (text.includes("producto")) return await sendProductosMenu(from);
if (text.includes("pedido")) return await handleOrderFlow(from, "start");

return await handleOrderFlow(from, text);
}

if (type === "interactive") {
const payload = message.interactive?.button_reply?.id;
if (payload === "BTN_PICADAS") return sendPicadasInfo(from);
if (payload === "BTN_PRODUCTOS") return sendProductosMenu(from);
if (payload === "BTN_PEDIDO") return handleOrderFlow(from, "start");
return handleOrderFlow(from, payload);
}
}

res.sendStatus(200);
} catch (e) {
console.log("Error:", e);
res.sendStatus(200);
}
});

app.listen(PORT, () => console.log(`✅ BOT LISTO en puerto ${PORT}`));

