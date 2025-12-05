import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { handleIncoming } from "./responses.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

// Verificación Webhook (Meta)
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];
if (mode === "subscribe" && token === VERIFY_TOKEN) return res.status(200).send(challenge);
return res.sendStatus(403);
});

// Recepción de mensajes
app.post("/webhook", async (req, res) => {
try {
const value = req.body.entry?.[0]?.changes?.[0]?.value;
const message = value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body || "";
console.log("📩 Mensaje recibido:", text);

await handleIncoming(from, text);
res.sendStatus(200);
} catch (e) {
console.log("❌ ERROR webhook:", e?.response?.data || e.message);
res.sendStatus(200);
}
});

app.listen(PORT, () => {
console.log(`✅ BOT INICIADO en puerto ${PORT}`);
console.log(`👉 Abrí el túnel: npx localtunnel --port ${PORT}`);
});

