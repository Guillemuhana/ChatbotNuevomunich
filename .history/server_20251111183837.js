import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import {
sendMenuPrincipal,
sendMenuPrincipalExpandido,
sendProductosMenu,
sendCategoriaDetalle,
sendProductoDetalle,
iniciarPedido,
flujoPedido,
replyIA,
sessions,
ultimoProducto
} from "./bot.js";

import { IMAGENES } from "./imagenes.js"; // ✅ IMPORT NECESARIO
dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// =============================================================
// ✅ VERIFICACIÓN WEBHOOK
// =============================================================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
return res.status(200).send(challenge);
}
return res.sendStatus(403);
});

// =============================================================
// ✅ RECEPCIÓN DE MENSAJES
// =============================================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.text?.body || message.interactive?.button_reply?.id;
console.log("🟢 MENSAJE:", msg);

// =============================================================
// MENÚ PRINCIPAL
// =============================================================
if (/^(hola|menu|menú|inicio|volver)$/i.test(msg)) {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

if (msg === "LEER_MAS") {
await sendMenuPrincipalExpandido(from);
return res.sendStatus(200);
}

// =============================================================
// BOTONES PRINCIPALES
// =============================================================
if (msg === "BTN_PRODUCTOS") {
await sendProductosMenu(from);
return res.sendStatus(200);
}

if (msg === "BTN_EVENTOS") {
await replyIA(from, "✨ Organizamos picadas y eventos. ¿Para cuántas personas sería?");
return res.sendStatus(200);
}

if (msg === "BTN_PEDIDO") {
await iniciarPedido(from);
return res.sendStatus(200);
}

// =============================================================
// CATEGORÍAS DE PRODUCTOS
// =============================================================
if (["P_FETEADOS", "P_SALAMES", "P_SALCHICHAS"].includes(msg)) {
await sendCategoriaDetalle(from, msg);
return res.sendStatus(200);
}

// =============================================================
// SI EL MENSAJE ES EL NOMBRE DE UN PRODUCTO → ENVIAR IMAGEN
// =============================================================
if (msg in IMAGENES) {
await sendProductoDetalle(from, msg);
return res.sendStatus(200);
}

// =============================================================
// FLUJO DE PEDIDO
// =============================================================
if (sessions.has(from)) {
await flujoPedido(from, msg);
return res.sendStatus(200);
}

// =============================================================
// RESPUESTA CON IA
// =============================================================
await replyIA(from, msg);
return res.sendStatus(200);

} catch (error) {
console.log("❌ ERROR WEBHOOK:", error);
return res.sendStatus(500);
}
});

// =============================================================
// ✅ INICIAR SERVIDOR
// =============================================================
app.listen(process.env.PORT || 3000, () =>
console.log("✅ BOT LISTO → http://localhost:" + (process.env.PORT || 3000))
);

