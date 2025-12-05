// server.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import {
sendWelcomeBlock,
sendCatalogCategories,
sendCategoryItems,
handleOrderFlow
} from "./bot.js";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

// ========== WEBHOOK VERIFICACIÓN (GET) ==========
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente");
return res.status(200).send(challenge);
}

return res.sendStatus(403);
});

// ========== RECEPCIÓN DE MENSAJES (POST) ==========
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const message = entry?.changes?.[0]?.value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from; // Tel del usuario
console.log("💬 Mensaje recibido:", JSON.stringify(message, null, 2));

// Si entra texto simple → Bienvenida directa
if (message.type === "text") {
await sendWelcomeBlock(from);
return res.sendStatus(200);
}

// Si viene un botón o selección → Identificamos el ID
const payloadId =
message?.interactive?.button_reply?.id ||
message?.interactive?.list_reply?.id;

if (payloadId) {
console.log("🟦 Acción:", payloadId);

// Navegación inicio
if (payloadId === "BTN_INICIO") {
await sendWelcomeBlock(from);
}

// Ver catálogo
else if (payloadId === "BTN_PRODUCTOS" || payloadId === "BTN_VER_CATS") {
await sendCatalogCategories(from);
}

// Selección de categoría
else if (payloadId.startsWith("CATSEL_")) {
const catId = payloadId.replace("CATSEL_", "");
await sendCategoryItems(from, catId);
}

// Comenzar pedido
else if (payloadId === "BTN_PEDIDO") {
await handleOrderFlow(from, null);
}

// Flujo interno de pedido
else {
await handleOrderFlow(from, payloadId);
}
}

return res.sendStatus(200);

} catch (err) {
console.error("❌ Error procesando mensaje:", err);
return res.sendStatus(500);
}
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
console.log(`🚀 BOT ACTIVO en http://localhost:${PORT}`);
});

