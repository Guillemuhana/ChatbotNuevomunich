import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendMenuPrincipal,
sendProductosMenu,
sendCategoriaDetalle,
iniciarPedido,
flujoPedido,
replyIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN)
return res.send(req.query["hub.challenge"]);
res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
try {
const msgData = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!msgData) return res.sendStatus(200);

const from = msgData.from;
const text = msgData.text?.body;
const button = msgData.button?.payload;
const msg = button || text;

console.log("📩 Mensaje recibido:", msg);

// MENÚ PRINCIPAL
if (["hola", "Hola", "menu", "Menu", "inicio"].includes(msg))
return sendMenuPrincipal(from);

// PRODUCTOS
if (msg === "BTN_PRODUCTOS") return sendProductosMenu(from);

// CATEGORÍAS
if (["P_PICADAS", "P_SALCHICHAS", "P_GRILL"].includes(msg))
return sendCategoriaDetalle(from, msg);

// PEDIDO
if (msg === "BTN_PEDIDO") return iniciarPedido(from);
await flujoPedido(from, msg);

// IA
return replyIA(from, msg);

} catch (err) {
console.log("❌ Error webhook:", err);
}
res.sendStatus(200);
});

app.listen(process.env.PORT, () =>
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`)
);