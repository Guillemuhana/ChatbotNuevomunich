// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendMenuPrincipal,
sendProductosMenu,
sendCategoria,
iniciarPedido
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// ✅ Verificación Webhook
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
return res.send(req.query["hub.challenge"]);
}
return res.sendStatus(403);
});

// ✅ Recepción de mensajes
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const msg = entry?.messages?.[0];
if (!msg) return res.sendStatus(200);

const from = msg.from;
const text = msg.text?.body;
const btn = msg.button?.payload;
const input = btn || text;

console.log("📩 Mensaje recibido:", input);

if (!input) return res.sendStatus(200);

if (["hola", "menu", "inicio", "Hola", "Menu"].includes(input)) {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

if (input === "BTN_PRODUCTOS") return sendProductosMenu(from);
if (input === "BTN_PICADAS") return sendCategoria(from, "P_PICADAS");
if (input === "P_PICADAS") return sendCategoria(from, "P_PICADAS");
if (input === "P_SALCHICHAS") return sendCategoria(from, "P_SALCHICHAS");
if (input === "P_GRILL") return sendCategoria(from, "P_GRILL");

if (input === "BTN_PEDIDO") return iniciarPedido(from);

res.sendStatus(200);
} catch (err) {
console.log("❌ Error webhook:", err);
res.sendStatus(500);
}
});

app.listen(3000, () =>
console.log("✅ BOT LISTO → http://localhost:3000")
);

