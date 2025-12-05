import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import {
sendMenuPrincipal,
sendProductosMenu,
sendCategoriaDetalle,
iniciarPedido,
flujoPedido,
replyIA,
sessions
} from "./bot.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// =============================================================
// VERIFICACIÓN WEBHOOK
// =============================================================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
res.status(200).send(challenge);
} else {
res.sendStatus(403);
}
});

// =============================================================
// RECEPCIÓN DE MENSAJES
// =============================================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.text?.body || message.interactive?.button_reply?.id;

console.log("🟢 MENSAJE:", msg);

// --- MENÚ PRINCIPAL
if (msg === "hola" || msg === "Hola" || msg === "menu" || msg === "Menú") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// --- BOTONES PRINCIPALES
if (msg === "BTN_PRODUCTOS") return await sendProductosMenu(from);
if (msg === "BTN_EVENTOS") return await replyIA(from,
"✨ *Eventos & Catering*\nContamos con tablas gourmet, picadas premium y servicio personalizado.\n\n¿Para cuántas personas sería el evento?"
);
if (msg === "BTN_PEDIDO") return await iniciarPedido(from);

// --- CATEGORÍAS
if (["P_FETEADOS", "P_SALAMES", "P_SALCHICHAS"].includes(msg))
return await sendCategoriaDetalle(from, msg);

// --- FLUJO DE PEDIDOS
if (sessions.has(from)) return await flujoPedido(from, msg);

// --- RESPUESTA IA
await replyIA(from, msg);

res.sendStatus(200);

} catch (error) {
console.log("❌ ERROR WEBHOOK:", error);
res.sendStatus(500);
}
});

// =============================================================
app.listen(process.env.PORT || 3000, () =>
console.log("✅ BOT LISTO → http://localhost:" + (process.env.PORT || 3000))
);

