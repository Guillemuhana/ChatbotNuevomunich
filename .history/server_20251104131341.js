// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { sendWelcomeBlock, handleIncomingLogic } from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// ====== WEBHOOK VERIFICATION (GET) ======
app.get("/webhook", (req, res) => {
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente");
return res.status(200).send(challenge);
}
console.log("❌ Error de verificación de webhook");
return res.sendStatus(403);
});

// ====== RECEPCIÓN DE MENSAJES (POST) ======
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0];
const value = changes?.value;
const messages = value?.messages;

if (!messages || messages.length === 0) {
return res.sendStatus(200);
}

const msg = messages[0];
const from = msg.from;
const type = msg.type;

console.log("💬 Mensaje recibido:", JSON.stringify(msg, null, 2));

// Si el usuario envía Hola → Menú principal
if (type === "text") {
const text = msg.text?.body?.trim() || "";
if (/^(hola|buenas|buen día|menu|menú|inicio|start|volver)$/i.test(text)) {
await sendWelcomeBlock(from);
} else {
await handleIncomingLogic({ from, message: msg });
}
}
// Si el usuario toca botones o listas
else if (type === "interactive") {
await handleIncomingLogic({ from, message: msg });
}
// Todo lo demás → Se procesa igual
else {
await handleIncomingLogic({ from, message: msg });
}

return res.sendStatus(200);
} catch (err) {
console.error("❌ Error procesando mensaje:", err);
return res.sendStatus(200);
}
});

// ====== LEVANTAR SERVIDOR ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 BOT ACTIVO en http://localhost:${PORT}`));

