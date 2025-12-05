// server.js
import express from "express";
import dotenv from "dotenv";
import { sendWelcomeBlock, handleIncomingLogic } from "./bot.js";

dotenv.config();
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

// ========== WEBHOOK VERIFY (GET) ==========
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente");
return res.status(200).send(challenge);
}

console.log("❌ Token de verificación incorrecto");
return res.sendStatus(403);
});

// ========== HANDLER MENSAJES (POST) ==========
app.post("/webhook", async (req, res) => {
try {
const data = req.body;

const message = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body;

console.log("💬 Mensaje recibido:", message);

if (text && text.toLowerCase() === "hola") {
await sendWelcomeBlock(from);
} else {
await handleIncomingLogic(from, message);
}

res.sendStatus(200);
} catch (err) {
console.error("❌ Error procesando mensaje:", err);
res.sendStatus(500);
}
});

app.listen(PORT, () => console.log(`🚀 BOT ACTIVO en http://localhost:${PORT}`));
