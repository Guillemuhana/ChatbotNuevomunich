import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { handleIncoming } from './responses.js';

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "miwebhook";
const PORT = process.env.PORT || 3000;

// VERIFY WEBHOOK
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente.");
return res.status(200).send(challenge);
}
return res.sendStatus(403);
});

// RECEIVE MESSAGES
app.post("/webhook", async (req, res) => {
try {
const value = req.body.entry?.[0]?.changes?.[0]?.value;
const message = value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from; // NUMERO DEL CLIENTE
const text = message.text?.body || message.button?.text || "";

console.log("📩 Mensaje recibido:", text, "De:", from);

await handleIncoming(from, text);

res.sendStatus(200);
} catch (e) {
console.error("❌ ERROR en webhook:", e);
res.sendStatus(500);
}
});

// START SERVER
app.listen(PORT, () => {
console.log(`✅ BOT INICIADO en puerto ${PORT}`);
console.log(`👉 Ahora ejecutá el túnel: npx localtunnel --port ${PORT}`);
});

