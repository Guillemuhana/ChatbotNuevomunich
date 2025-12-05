import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { replyIA } from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// ✅ Webhook de verificación
app.get("/webhook", (req, res) => {
const verifyToken = process.env.VERIFY_TOKEN;
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token && mode === "subscribe" && token === verifyToken) {
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
});

// ✅ Webhook para recibir mensajes
app.post("/webhook", async (req, res) => {
try {
const data = req.body;

const messageObj = data?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!messageObj) return res.sendStatus(200);

const from = messageObj.from;
const text = messageObj.text?.body;
const buttonPayload = messageObj.button?.payload;
const interactiveReply = messageObj.interactive?.button_reply?.id;
const listReply = messageObj.interactive?.list_reply?.id;

// ✅ Siempre obtenemos un mensaje correcto
const msg = interactiveReply || listReply || buttonPayload || text;

if (!msg || msg.trim() === "") {
await replyIA(from, "¿En qué puedo ayudarte? 😊");
return res.sendStatus(200);
}

console.log("🟢 MENSAJE:", msg);
await replyIA(from, msg);

} catch (error) {
console.log("❌ ERROR WEBHOOK:", error);
}

res.sendStatus(200);
});

app.listen(PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${PORT}`);
});

