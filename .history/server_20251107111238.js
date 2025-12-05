import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendMenuPrincipal,
sendCategorias,
sendProductosCategoria,
iniciarPedido,
flujoPedido,
replyIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// ✅ Webhook para validación
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN)
return res.send(req.query["hub.challenge"]);
res.sendStatus(403);
});

// ✅ Webhook eventos entrantes
app.post("/webhook", async (req, res) => {
try {
const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!msg) return res.sendStatus(200);

const from = msg.from;
const text = msg.text?.body;
const payload = msg.interactive?.list_reply?.id || msg.button?.payload;
const content = payload || text;

console.log("📩 MENSAJE:", content);

if (["hola", "Hola", "menu", "Menu", "inicio"].includes(content))
return sendMenuPrincipal(from);

if (content === "BTN_PRODUCTOS") return sendCategorias(from);

if (content.startsWith("CAT_")) return sendProductosCategoria(from, content);

if (content === "BTN_PEDIDO") return iniciarPedido(from);

await flujoPedido(from, content);

return replyIA(from, content);
} catch (e) {
console.log("❌ Error:", e);
}
res.sendStatus(200);
});

app.listen(process.env.PORT, () =>
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`)
);

