import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { handleIncoming } from './responses.js';

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "miwebhook";
const PORT = process.env.PORT || 3000;

// ============ WEBHOOK VERIFY (NECESARIO PARA META) ============ //
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente.");
return res.status(200).send(challenge);
} else {
console.log("❌ Error verificando Webhook.");
return res.sendStatus(403);
}
});

// ============ RECEPCIÓN DE MENSAJES DE WHATSAPP ============ //
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!entry) return res.sendStatus(200);

const from = entry.from; // número
const text = entry.text?.body || entry.button?.text || "";

console.log("📩 Mensaje recibido:", text);

await handleIncoming(from, text);
res.sendStatus(200);

} catch (error) {
console.error("❌ ERROR:", error);
res.sendStatus(500);
}
});

// ============ INICIO DEL SERVIDOR ============ //
app.listen(PORT, () => {
console.log(`✅ BOT INICIADO en puerto ${PORT}`);
console.log(`👉 Ahora ejecutá el túnel: npx localtunnel --port ${PORT}`);
});

