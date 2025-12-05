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
res.sendStatus(403);
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

// Mostrar descripción extendida
if (msg === "LEER_MAS") {
await sendMenuPrincipalExpandido(from);
return res.sendStatus(200);
}

// =============================================================
// BOTONES PRINCIPALES
// =============================================================
if (msg === "BTN_PRODUCTOS") return await sendProductosMenu(from);

if (msg === "BTN_EVENTOS") {
await replyIA(from, "Contamos con tablas y picadas premium para eventos. ¿Para cuántas personas sería?");
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
// SI EL MENSAJE COINCIDE CON UN PRODUCTO → ENVIAR IMAGEN
// =============================================================
if (ultimoProducto.get(from) !== msg && msg in IMAGENES) {
await sendProductoDetalle(from, msg);
return res.sendStatus(200);
}

// =============================================================
// FLUJO DE PEDIDOS
// =============================================================
if (sessions.has(from)) {
await flujoPedido(from, msg);
return res.sendStatus(200);
}

// =============================================================
// IA PARA TODO LO DEMÁS
// =============================================================
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

