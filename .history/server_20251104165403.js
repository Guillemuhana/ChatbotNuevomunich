// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendMenuPrincipal,
sendProductosMenu,
sendCategoriaDetalle,
iniciarPedido,
flujoPedido
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// Verificación Webhook
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
return res.send(req.query["hub.challenge"]);
}
return res.sendStatus(403);
});

// Mensajes entrantes
app.post("/webhook", async (req, res) => {
try {
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.button?.payload || message.text?.body;

console.log("💬", from, "→", msg);

if (!msg) return res.sendStatus(200);

if (["hola","Hola","menu","Menu","inicio"].includes(msg))
return sendMenuPrincipal(from).then(() => res.sendStatus(200));

if (msg === "BTN_PICADAS")
return sendCategoriaDetalle(from, "PICADAS").then(() => res.sendStatus(200));

if (msg === "BTN_PRODUCTOS")
return sendProductosMenu(from).then(() => res.sendStatus(200));

if (msg === "BTN_PEDIDO") {
iniciarPedido(from);
return res.sendStatus(200);
}

await flujoPedido(from, msg);
res.sendStatus(200);

} catch (err) {
console.log("❌ Error:", err?.response?.data || err);
res.sendStatus(500);
}
});

app.listen(process.env.PORT || 3000, () =>
console.log("🚀 BOT ACTIVO en puerto", process.env.PORT || 3000)
);
