// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import { routeMessage } from "./bot.js";

const app = express();
app.use(bodyParser.json());

/* =============================
* Webhook Verification
* ============================= */
app.get("/webhook", (req, res) => {
const token = process.env.WEBHOOK_VERIFY_TOKEN;
const mode = req.query["hub.mode"];
const challenge = req.query["hub.challenge"];
const verifyToken = req.query["hub.verify_token"];

if (mode && verifyToken && mode === "subscribe" && verifyToken === token) {
console.log("✅ Webhook verificado correctamente");
return res.status(200).send(challenge);
}

console.log("❌ Webhook NO autorizado");
return res.sendStatus(403);
});

/* =============================
* Webhook Receiver
* ============================= */
app.post("/webhook", async (req, res) => {
try {
const entry = req.body?.entry?.[0];
if (!entry) return res.sendStatus(200);

await routeMessage(entry);
return res.sendStatus(200);
} catch (err) {
console.log("❌ Error en webhook:", err?.response?.data || err.toString());
return res.sendStatus(500);
}
});

/* =============================
* Startup
* ============================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${PORT}`);
console.log("🟢 Esperando mensajes de WhatsApp...");
});

