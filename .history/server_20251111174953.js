import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import {
sendMenuPrincipal,
sendProductosMenu,
sendCategoriaDetalle,
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

// VERIFICACIÓN WEBHOOK
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];
if (mode === "subscribe" && token === VERIFY_TOKEN) return res.send(challenge);
res.sendStatus(403);
});

// MENSAJES
app.post("/webhook", async (req, res) => {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.text?.body?.trim() || "";

console.log("🟢 MENSAJE:", msg);

if (["hola","menu","inicio"].includes(msg.toLowerCase())) return sendMenuPrincipal(from);

if (msg === "LEER_MAS") return replyIA(from, "Contame qué tipo de producto buscás 😊");

if (msg === "BTN_PRODUCTOS") return sendProductosMenu(from);
if (msg === "BTN_EVENTOS") return replyIA(from, "✨ Contame para cuántas personas es tu evento.");
if (msg === "BTN_PEDIDO") return iniciarPedido(from);

if (["feteados","salames","salchichas"].includes(msg.toLowerCase()))
return sendCategoriaDetalle(from, msg);

if (sessions.has(from)) return flujoPedido(from, msg);

return sendProductoDetalle(from, msg);
});

app.listen(process.env.PORT || 3000, () =>
console.log("✅ BOT LISTO → http://localhost:" + (process.env.PORT || 3000))
);

