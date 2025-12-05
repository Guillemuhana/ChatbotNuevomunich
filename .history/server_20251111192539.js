import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import {
sendMenuPrincipal,
sendProductosMenu,
sendProductoDetalle,
iniciarPedido,
flujoPedido,
replyIA,
sessions
} from "./bot.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) return res.status(200).send(challenge);
return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
try {
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.text?.body?.toLowerCase();

console.log("🟢 MENSAJE:", msg);

if (["hola", "buenas", "menu"].includes(msg)) return sendMenuPrincipal(from);
if (msg === "btn_productos") return sendProductosMenu(from);
if (msg === "btn_pedido") return iniciarPedido(from);

if (sessions.has(from)) return flujoPedido(from, msg);

await sendProductoDetalle(from, msg);
res.sendStatus(200);

} catch (e) {
console.log("❌ ERROR WEBHOOK:", e);
res.sendStatus(500);
}
});

app.listen(process.env.PORT || 3000, () =>
console.log("✅ BOT LISTO → http://localhost:" + (process.env.PORT || 3000))
);

