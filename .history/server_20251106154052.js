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
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body;
const button = message.button?.payload;
const msg = button || text;

console.log("📩 Mensaje recibido:", msg);

if (["hola", "Hola", "menu", "Menu", "inicio"].includes(msg))
return sendMenuPrincipal(from);

if (msg === "BTN_PRODUCTOS") return sendProductosMenu(from);
if (["P_PICADAS", "P_SALCHICHAS", "P_GRILL"].includes(msg))
return sendCategoriaDetalle(from, msg);

if (msg === "BTN_PEDIDO") return iniciarPedido(from);
await flujoPedido(from, msg);

return replyIA(from, msg);
} catch (e) {
console.log("❌ Error webhook:", e);
}
res.sendStatus(200);
});

app.listen(process.env.PORT, () =>
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`)
);
