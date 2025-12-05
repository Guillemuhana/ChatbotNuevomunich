import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import { handleIncoming } from "./responses.js";

const app = express();
app.use(bodyParser.json());

const verifyToken = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

// ✅ VERIFICAR WEBHOOK (solo una vez al configurar en Meta)
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === verifyToken) {
console.log("✅ Webhook confirmado por Meta");
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
});

// ✅ RECIBIR MENSAJES DE WHATSAPP
app.post("/webhook", async (req, res) => {
try {
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const texto = message.text?.body?.toLowerCase();
const from = message.from;

if (texto) {
console.log("📩 Mensaje recibido:", texto);
await handleIncoming(from, texto);
}
} catch (err) {
console.log("❌ ERROR:", err);
}

res.sendStatus(200);
});

// ✅ INICIAR SERVIDOR
app.listen(PORT, () => {
console.log(`✅ BOT INICIADO en puerto ${PORT}`);
console.log(`👉 Ahora ejecutá el túnel: npx localtunnel --port ${PORT}`);
});

