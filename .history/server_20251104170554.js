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

// Mensajes Entrantes
app.post("/webhook", async (req, res) => {
const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!msg) return res.sendStatus(200);

const from = msg.from;
const text = msg.text?.body;
const button = msg.button?.payload;
const m = button || text;

console.log("💬", from, "→", m);

if (!m) return res.sendStatus(200);

if (["hola","Hola","menu","Menu","inicio"].includes(m))
return sendMenuPrincipal(from).then(() => res.sendStatus(200));

if (m === "BTN_PICADAS")
return sendCategoriaDetalle(from, "PICADAS").then(() => res.sendStatus(200));

if (m === "BTN_PRODUCTOS")
return sendProductosMenu(from).then(() => res.sendStatus(200));

if (m === "BTN_PEDIDO")
return iniciarPedido(from).then(() => res.sendStatus(200));

await flujoPedido(from, m);
return res.sendStatus(200);
});

// Iniciar Servidor
app.listen(process.env.PORT || 3000, () =>
console.log("✅ BOT LISTO en puerto", process.env.PORT || 3000)
);

