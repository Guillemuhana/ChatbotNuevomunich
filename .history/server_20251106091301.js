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

// ---- VERIFICACIÓN WEBHOOK ----
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.WEBHOOK_VERIFY_TOKEN) {
return res.send(req.query["hub.challenge"]);
}
return res.sendStatus(403);
});

// ---- RECEPCIÓN DE MENSAJES ----
app.post("/webhook", async (req, res) => {
try {
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.text?.body || message.button?.payload;

console.log("📩 Mensaje:", msg);

if (["hola", "Hi", "menu", "inicio"].includes(msg?.toLowerCase())) {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

if (msg === "BTN_PRODUCTOS") return sendProductosMenu(from);
if (["P_PICADAS", "P_SALCHICHAS", "P_GRILL"].includes(msg)) return sendCategoria(from, msg);

if (msg === "BTN_PEDIDO") return iniciarPedido(from);

await flujoPedido(from, msg);

res.sendStatus(200);
} catch (e) {
console.log("❌ Error en webhook:", e);
res.sendStatus(500);
}
});

app.listen(process.env.PORT, () =>
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`)
);

