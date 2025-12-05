// ==========================================
// SERVER.JS - NUEVO MUNICH
// ==========================================

import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import {
sendBienvenida,
sendDescripcionAmpliada,
sendMenuPrincipal,
sendMenuProductos,
sendProductosDeCategoria,
sendProductoImagen,
replyIA
} from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;


// ==========================================
// 1) VERIFICACIÓN DEL WEBHOOK
// ==========================================
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



// ==========================================
// 2) RECEPCIÓN DE MENSAJES
// ==========================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const msg =
message.text?.body ||
message.interactive?.button_reply?.id ||
message.interactive?.list_reply?.id ||
"";

console.log("📩 MENSAJE:", msg);


// ======================================
// SALUDOS → Enviar bienvenida
// ======================================
if (["hola", "Hola", "menu", "Menu", "menú", "Menú"].includes(msg)) {
await sendBienvenida(from);
return res.sendStatus(200);
}


// ======================================
// LEER MÁS → Mostrar descripción larga
// ======================================
if (msg === "LEER_MAS") {
await sendDescripcionAmpliada(from);
return res.sendStatus(200);
}


// ======================================
// MENÚ PRINCIPAL
// ======================================
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}


// ======================================
// BOTÓN → PRODUCTOS
// ======================================
if (msg === "BTN_PRODUCTOS") {
await sendMenuProductos(from);
return res.sendStatus(200);
}


// ======================================
// BOTÓN → EVENTOS
// ======================================
if (msg === "BTN_EVENTOS") {
await replyIA(from, "Quiero información sobre eventos y catering");
return res.sendStatus(200);
}


// ======================================
// BOTÓN → PEDIDO
// ======================================
if (msg === "BTN_PEDIDO") {
await replyIA(from, "Quiero hacer un pedido");
return res.sendStatus(200);
}


// ======================================
// CATEGORÍAS DE PRODUCTOS
// ======================================
if (["P_FETEADOS", "P_SALAMES", "P_SALCHICHAS"].includes(msg)) {
await sendProductosDeCategoria(from, msg);
return res.sendStatus(200);
}


// ======================================
// PRODUCTO → Mostrar imagen
// ======================================
const productoSolicitado = msg.toLowerCase();
await sendProductoImagen(from, productoSolicitado);
return res.sendStatus(200);


} catch (e) {
console.log("❌ ERROR EN WEBHOOK:", e.response?.data || e);
return res.sendStatus(500);
}
});



// ==========================================
// 3) INICIO DEL SERVIDOR
// ==========================================
app.listen(process.env.PORT || 3000, () => {
console.log("🚀 BOT NUEVO MUNICH LISTO → http://localhost:" + (process.env.PORT || 3000));
});
