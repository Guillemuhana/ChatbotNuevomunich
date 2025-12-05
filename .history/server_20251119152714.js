// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import {
sendBienvenida,
sendLeerMas,
sendMenuPrincipal,
sendCategoriaProductos,
sendSubcategoria,
sendProducto,
sendCatalogoCompleto,
} from "./bot.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

// ===============================
// 1. VERIFICACIÓN DEL WEBHOOK (GET)
// ===============================
app.get("/webhook", (req, res) => {
const VERIFY_TOKEN = "guille1234";

const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("🌍 WEBHOOK VERIFICADO CON META");
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
}
});

// ===============================
// 2. WEBHOOK POST (MENSAJES)
// ===============================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0];
const message = changes?.value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.text?.body || message.button?.payload;

console.log("📩 MENSAJE RECIBIDO:", msg);

// =====================
// FLUJO PRINCIPAL
// =====================

if (!msg) return res.sendStatus(200);

// BIENVENIDA
if (msg.toLowerCase() === "hola" || msg.toLowerCase() === "buenas") {
await sendBienvenida(from);
return res.sendStatus(200);
}

// LEER MÁS
if (msg === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

// MENÚ PRINCIPAL
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// CATEGORÍAS
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// SUBCATEGORÍAS
if (msg.startsWith("CAT_")) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// PRODUCTO INDIVIDUAL
if (msg.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

// CATÁLOGO COMPLETO PDF
if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

// FALLBACK
await sendBienvenida(from);
return res.sendStatus(200);

} catch (err) {
console.error("❌ ERROR EN WEBHOOK:", err);
return res.sendStatus(500);
}
});

// ===============================
// 3. INICIAR SERVIDOR
// ===============================
const PORT = 3000;
app.listen(PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${PORT}`);
});