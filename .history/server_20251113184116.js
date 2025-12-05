// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import {
sendMenuPrincipal,
sendDescripcionAmpliada,
sendProductosMenu,
sendProductosDeCategoria,
sendProductoImagen,
replyIA
} from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// =============================
// VERIFICACIÓN DEL WEBHOOK
// =============================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("🟢 WEBHOOK VERIFICADO");
return res.status(200).send(challenge);
}

res.sendStatus(403);
});

// =============================
// RECEPCIÓN DE MENSAJES
// =============================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;

// Puede venir texto, button_reply o list_reply
let msg =
message.text?.body ||
message.interactive?.button_reply?.id ||
message.interactive?.list_reply?.id ||
"";

console.log("📩 MENSAJE:", msg);

// ---------------------------
// SALUDOS / MENÚ INICIAL
// ---------------------------
if (
["hola", "Hola", "holaa", "Holaa", "menu", "menú", "Menu", "Menú"].includes(
msg
)
) {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// ---------------------------
// LEER MÁS → DESCRIPCIÓN LARGA
// ---------------------------
if (msg === "LEER_MAS") {
await sendDescripcionAmpliada(from);
return res.sendStatus(200);
}

// ---------------------------
// BOTONES PRINCIPALES
// ---------------------------
if (msg === "BTN_PRODUCTOS") {
await sendProductosMenu(from);
return res.sendStatus(200);
}

if (msg === "BTN_EVENTOS") {
await replyIA(from, "Quiero información sobre eventos y catering.");
return res.sendStatus(200);
}

if (msg === "BTN_PEDIDO") {
await replyIA(from, "Quiero hacer un pedido.");
return res.sendStatus(200);
}

// ---------------------------
// CATEGORÍAS
// ---------------------------
if (["P_FETEADOS", "P_SALAMES", "P_SALCHICHAS"].includes(msg)) {
await sendProductosDeCategoria(from, msg);
return res.sendStatus(200);
}

// ---------------------------
// PRODUCTO SELECCIONADO (LISTA)
// ---------------------------
if (msg.startsWith("PROD_")) {
await sendProductoImagen(from, msg);
return res.sendStatus(200);
}

// ---------------------------
// IA POR DEFECTO
// ---------------------------
await replyIA(from, msg);
res.sendStatus(200);
} catch (error) {
console.log("❌ ERROR EN WEBHOOK:", error.response?.data || error);
res.sendStatus(500);
}
});

// =============================
// INICIAR SERVIDOR
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log("✅ BOT LISTO → http://localhost:" + PORT);
});

