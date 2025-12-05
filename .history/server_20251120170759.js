// ======================================================
// SERVER.JS — COMPLETO, REVISADO, FUNCIONAL
// ======================================================

import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendBienvenida,
sendLeerMas,
sendMenuPrincipal,
sendCategoriaProductos,
sendSubcategoria,
sendProducto,
sendCatalogoCompleto
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ======================================================
// 🔹 VERIFICACIÓN DEL WEBHOOK (GET)
// ======================================================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ WEBHOOK VERIFICADO CON META");
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
}
});

// ======================================================
// 🔹 RECEPCIÓN DE MENSAJES (POST)
// ======================================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0];
const value = changes?.value;
const message = value?.messages?.[0];

if (!message) {
console.log("📭 MENSAJE RECIBIDO: null");
return res.sendStatus(200);
}

const from = message.from;
const type = message.type;
let msg = "";

if (type === "text") msg = message.text.body;
if (type === "button") msg = message.button.payload;
if (type === "interactive") msg = message.interactive.button_reply.id;

console.log("📩 MENSAJE RECIBIDO:", msg);

// --------------------------------------------------
// 1) SALUDO DE ENTRADA
// --------------------------------------------------
if (msg.toLowerCase() === "hola" || msg.toLowerCase() === "hola!") {
await sendBienvenida(from);
return res.sendStatus(200);
}

// --------------------------------------------------
// 2) LEER MÁS
// --------------------------------------------------
if (msg === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

// --------------------------------------------------
// 3) MENÚ PRINCIPAL
// --------------------------------------------------
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// --------------------------------------------------
// 4) CATEGORÍAS
// --------------------------------------------------
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// --------------------------------------------------
// 5) SUBCATEGORÍAS / LISTAS
// --------------------------------------------------
if (msg.startsWith("CAT_")) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// --------------------------------------------------
// 6) PRODUCTO SELECCIONADO
// --------------------------------------------------
if (msg.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

// --------------------------------------------------
// 7) CATÁLOGO PDF
// --------------------------------------------------
if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

return res.sendStatus(200);

} catch (err) {
console.error("❌ ERROR EN WEBHOOK:", err);
return res.sendStatus(500);
}
});

// ======================================================
// 🔹 INICIAR SERVIDOR
// ======================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${PORT}`);
});
