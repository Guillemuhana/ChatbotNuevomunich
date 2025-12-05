// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import { routeMessage } from "./bot.js";

const app = express();
app.use(bodyParser.json());

// 🔎 Salud
app.get("/health", (_, res) => res.status(200).send("OK"));

// ✅ Verificación webhook (Meta)
app.get("/webhook", (req, res) => {
const verifyToken = process.env.VERIFY_TOKEN;
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === verifyToken) {
return res.status(200).send(challenge);
}
return res.sendStatus(403);
});

// 📩 Receptor de eventos WhatsApp
app.post("/webhook", async (req, res) => {
try {
const entry = req.body?.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from; // e.g., "5493515..."
const text = message.text?.body;
const button = message.button?.payload; // buttons.reply.id
const msg = button || text || "";

console.log("📩 Mensaje:", { from, msg });

await routeMessage(from, msg);
return res.sendStatus(200);
} catch (err) {
console.error("❌ Error en webhook:", err?.response?.data || err.message || err);
return res.sendStatus(200); // responder 200 para que Meta no reintente indefinido
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${PORT}`);
});

