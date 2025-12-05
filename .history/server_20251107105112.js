import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendMenuPrincipal,
sendProductosMenu,
sendCategoriasExtra, // <— ¡ahora existe y se exporta!
sendCategoriaDetalle,
iniciarPedido,
flujoPedido,
replyIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// Webhook verify
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
return res.send(req.query["hub.challenge"]);
}
res.sendStatus(403);
});

// Webhook receiver
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const change = entry?.changes?.[0];
const message = change?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;

// Normal text
const text = message.text?.body?.trim();

// Classic button (old)
const btnPayload = message.button?.payload;

// Interactive reply (new API)
const interactiveType = message.interactive?.type;
const interactiveId =
interactiveType === "button_reply"
? message.interactive?.button_reply?.id
: interactiveType === "list_reply"
? message.interactive?.list_reply?.id
: undefined;

const msg = interactiveId || btnPayload || text;

console.log("🟢 MENSAJE:", msg);

// Arranque / menú
if (["hola", "Hola", "menu", "Menu", "inicio", "Inicio"].includes(msg)) {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// Productos (1er bloque) y más categorías
if (msg === "BTN_PRODUCTOS") {
await sendProductosMenu(from);
return res.sendStatus(200);
}
if (msg === "BTN_MAS_CATEGORIAS") {
await sendCategoriasExtra(from);
return res.sendStatus(200);
}

// Categorías
const CATS = ["CAT_FETEADOS", "CAT_SALAMES", "CAT_ALEMANAS", "CAT_ESPECIALIDADES", "CAT_PICADAS", "CAT_GRILL"];
if (CATS.includes(msg)) {
await sendCategoriaDetalle(from, msg);
return res.sendStatus(200);
}

// Pedido
if (msg === "BTN_PEDIDO") {
await iniciarPedido(from);
return res.sendStatus(200);
}
await flujoPedido(from, msg); // si hay sesión de pedido abierta

// IA para lo demás
await replyIA(from, msg);
} catch (e) {
console.log("❌ Error webhook:", e);
}
res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`);
});
