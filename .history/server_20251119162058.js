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

dotenv.config();

const app = express();
app.use(bodyParser.json());

// ==========================
// 🔐 VARIABLES IMPORTANTES
// ==========================
const VERIFY_TOKEN = "guille1234";
const PORT = process.env.PORT || 3000;

// ==========================
// 🌍 VERIFICACIÓN DEL WEBHOOK (GET)
// ==========================
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

// ==========================
// 📩 RECEPCIÓN DE MENSAJES (POST)
// ==========================
app.post("/webhook", async (req, res) => {
try {
const data = req.body;

if (!data.entry?.[0]?.changes?.[0]?.value?.messages) {
return res.sendStatus(200);
}

const message = data.entry[0].changes[0].value.messages[0];
const from = message.from;
const msg = message.text?.body || message.button?.payload;

console.log("📩 MENSAJE RECIBIDO:", msg);

// ==========================
// 🟢 FLUJO PRINCIPAL
// ==========================

if (msg === "hola" || msg === "Hola" || msg === "HOLA") {
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

// ==========================
// 🟠 SUBCATEGORÍAS
// ==========================
if (msg?.startsWith("CAT_")) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// ==========================
// 🔵 PRODUCTO INDIVIDUAL
// ==========================
if (msg?.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

// ==========================
// 📄 CATÁLOGO PDF
// ==========================
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

// ==========================
// 🚀 INICIO DEL SERVIDOR
// ==========================
app.listen(PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${PORT}`);
});
