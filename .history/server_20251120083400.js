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

dotenv.config();

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

if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("🌍 WEBHOOK VERIFICADO CON META");
return res.status(200).send(challenge);
}

return res.sendStatus(403);
});

// ======================================================
// 🔹 RECEPCIÓN DE MENSAJES (POST)
// ======================================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const type = message.type;

let msg = null;

// --- TEXTO ---
if (type === "text") msg = message.text.body.trim();

// --- BOTONES ---
if (type === "interactive") {
if (message.interactive.button_reply)
msg = message.interactive.button_reply.id;

if (message.interactive.list_reply)
msg = message.interactive.list_reply.id;
}

console.log("📩 MENSAJE RECIBIDO:", msg);

// ================================
// 🟢 FLUJO PRINCIPAL
// ================================

if (msg === "HOLA" || msg.toLowerCase() === "hola") {
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

if (msg.startsWith("CAT_")) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

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

} catch (e) {
console.log("❌ ERROR SERVER:", e);
return res.sendStatus(500);
}
});

// ======================================================
app.listen(process.env.PORT || 3000, () => {
console.log("✅ BOT LISTO → http://localhost:3000");
});
