import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendMenuPrincipal,
sendProductosLista,
sendCategoriaDetalle,
iniciarPedido,
flujoPedido,
replyIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// ✅ Verificación Webhook (Meta)
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
return res.send(req.query["hub.challenge"]);
}
res.sendStatus(403);
});

// ✅ Recepción de mensajes
app.post("/webhook", async (req, res) => {
try {
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg =
message.button?.payload ||
message.interactive?.button_reply?.id ||
message.text?.body;

console.log("💬 MENSAJE:", msg);

// **MENU INICIAL**
if (["hola", "Hola", "menu", "Menu", "inicio"].includes(msg))
return sendMenuPrincipal(from);

// **MENU PRODUCTOS**
if (msg === "BTN_PRODUCTOS") return sendProductosLista(from);

// **CATEGORÍAS**
if (["CAT_FETEADOS", "CAT_SALAMES", "CAT_ALEMANAS", "CAT_ESPECIALIDADES"].includes(msg))
return sendCategoriaDetalle(from, msg);

// **PEDIDOS**
if (msg === "BTN_PEDIDO") return iniciarPedido(from);

await flujoPedido(from, msg);

// **IA PARA MENSAJES LIBRES**
return replyIA(from, msg);

} catch (e) {
console.log("❌ Error webhook:", e);
}

res.sendStatus(200);
});

// ✅ Servidor listo
app.listen(process.env.PORT, () =>
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`)
);

