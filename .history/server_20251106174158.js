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

// ============ WEBHOOK VERIFICATION ============
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
return res.send(req.query["hub.challenge"]);
}
res.sendStatus(403);
});

// ============ RECEPCIÓN DE MENSAJES ============
app.post("/webhook", async (req, res) => {
try {
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;

// ✅ Captura correcta de texto + botones
const text = message.text?.body?.trim();
const btn = message.interactive?.button_reply?.id;
const list = message.interactive?.list_reply?.id;
const msg = btn || list || text;

console.log("🟢 TEXTO:", text);
console.log("🟡 PAYLOAD:", btn);
console.log("🔵 LIST:", list);

// ============ FLUJOS ============
if (["hola", "Hola", "menu", "Menu", "inicio"].includes(msg)) {
return sendMenuPrincipal(from);
}

// BOTONES PRINCIPALES
if (msg === "BTN_PRODUCTOS") return sendProductosMenu(from);
if (msg === "BTN_EVENTOS") return replyIA(from, "Eventos");
if (msg === "BTN_PEDIDO") return iniciarPedido(from);

// CATEGORÍAS DE PRODUCTOS
if (["P_PICADAS", "P_SALCHICHAS", "P_GRILL"].includes(msg)) {
return sendCategoriaDetalle(from, msg);
}

// FLUJO PEDIDO
await flujoPedido(from, msg);

// IA como última respuesta
return replyIA(from, msg);
} catch (e) {
console.log("❌ Error webhook:", e);
}

res.sendStatus(200);
});

// ============ START SERVER ============
app.listen(process.env.PORT, () =>
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`)
);
