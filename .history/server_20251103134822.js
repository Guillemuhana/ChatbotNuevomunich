import express from "express";
import bodyParser from "body-parser";
import { handleIncoming } from "./responses.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "miwebhook";
const PORT = process.env.PORT || 3000;

/* =============================
VERIFICAR WEBHOOK (META)
============================= */
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente.");
return res.status(200).send(challenge);
} else {
return res.status(403).send("Token inválido");
}
});

/* =============================
RECIBIR MENSAJES
============================= */
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0];
const messageObject = changes?.value?.messages?.[0];

if (messageObject) {
const from = messageObject.from;
await handleIncoming(from, messageObject);
}

return res.sendStatus(200);
} catch (err) {
console.log("❌ ERROR en webhook:", err);
return res.sendStatus(500);
}
});

/* =============================
INICIAR BOT
============================= */
app.listen(PORT, () => {
console.log(`✅ BOT INICIADO en puerto ${PORT}`);
console.log(`👉 Ahora ejecutá el túnel: npx localtunnel --port ${PORT}`);
});
