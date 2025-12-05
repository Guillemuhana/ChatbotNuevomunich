import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendMenuPrincipal,
sendProductosMenu,
sendCategoria,
iniciarPedido,
flujoPedido
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// ✅ Webhook verification
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.WEBHOOK_VERIFY_TOKEN) {
return res.send(req.query["hub.challenge"]);
}
return res.sendStatus(403);
});

// ✅ Webhook messages
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body;
const btn = message.button?.payload;

const msg = btn || text;

switch (msg) {
case "hola":
case "menu":
case "Hola":
case "Menu":
await sendMenuPrincipal(from);
break;

case "BTN_PRODUCTOS":
await sendProductosMenu(from);
break;

case "P_PICADAS":
case "P_SALCHICHAS":
case "P_GRILL":
await sendCategoria(from, msg);
break;

case "BTN_PEDIDO":
await iniciarPedido(from);
break;

default:
await flujoPedido(from, msg);
break;
}

res.sendStatus(200);
} catch (err) {
console.log("❌ Error en webhook:", err?.response?.data || err);
res.sendStatus(500);
}
});

app.listen(process.env.PORT, () =>
console.log(`🚀 BOT LISTO → http://localhost:${process.env.PORT}`)
);

