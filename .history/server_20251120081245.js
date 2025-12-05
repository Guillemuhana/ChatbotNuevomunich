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
sendCatalogoCompleto
} from "./bot.js";

// 🔥 PRIMERO cargamos las variables del .env
dotenv.config();

const app = express();
app.use(bodyParser.json());

// =========================
// VERIFICACIÓN WEBHOOK GET
// =========================
app.get("/webhook", (req, res) => {
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("🌍 WEBHOOK VERIFICADO CORRECTAMENTE");
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
}
});

// =========================
// WEBHOOK POST (MENSAJES)
// =========================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0];
const message = changes?.value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.text?.body?.trim() || "";

console.log("🟦 MENSAJE RECIBIDO:", msg);

// COMANDOS
if (msg.toLowerCase() === "hola") {
await sendBienvenida(from);
return res.sendStatus(200);
}

if (msg === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// CATEGORÍAS
if (msg.startsWith("CAT_")) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// PRODUCTOS INDIVIDUALES
if (msg.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

return res.sendStatus(200);
} catch (error) {
console.error("❌ ERROR EN WEBHOOK:", error);
return res.sendStatus(500);
}
});

// =========================
// INICIAR SERVIDOR
// =========================
app.listen(3000, () => {
console.log("🟢 BOT LISTO → http://localhost:3000");
});

