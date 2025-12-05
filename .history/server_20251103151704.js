import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { sendGreeting, sendCatalog, sendAIResponse } from "./responses.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// ✅ Verificación del Webhook
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
});

// ✅ Recepción de mensajes
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0];
const message = changes?.value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from; // número del usuario
const text = message.text?.body?.toLowerCase().trim() || "";

console.log(`📩 Mensaje recibido de ${from}: ${text}`);

// ====== SALUDO ======
if (text === "hola" || text === "buenas" || text === "hola!" || text === "hola bot") {
await sendGreeting(from);
return res.sendStatus(200);
}

// ====== CATÁLOGO ======
if (text.includes("catalogo") || text.includes("catálogo")) {
await sendCatalog(from);
return res.sendStatus(200);
}

// ✅ TODO lo demás → lo responde la IA
await sendAIResponse(from, text);

return res.sendStatus(200);
} catch (err) {
console.log("❌ ERROR sendText:", err);
return res.sendStatus(200);
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`✅ BOT INICIADO en puerto ${PORT}`);
console.log(`👉 Ejecutá ahora: npx localtunnel --port ${PORT}`);
});

