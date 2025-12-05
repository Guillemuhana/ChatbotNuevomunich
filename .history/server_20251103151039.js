import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { sendGreeting, sendCatalog, sendAIResponse } from "./responses.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

app.get("/webhook", (req, res) => {
const verifyToken = process.env.VERIFY_TOKEN;
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token && mode === "subscribe" && token === verifyToken) {
return res.status(200).send(challenge);
} else {
return res.status(403).send("Verificación fallida");
}
});

app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0];
const message = changes?.value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body?.toLowerCase() || "";

console.log("📩 Mensaje recibido:", text);

// ✅ Respuesta de Saludo
if (text.includes("hola") || text.includes("buenas") || text.includes("hey")) {
await sendGreeting(from);
return res.sendStatus(200);
}

// ✅ Catálogo
if (text.includes("catalogo") || text.includes("catálogo")) {
await sendCatalog(from);
return res.sendStatus(200);
}

// ✅ Cualquier otra cosa → IA responde
await sendAIResponse(from, text);
return res.sendStatus(200);

} catch (error) {
console.log("❌ ERROR Webhook:", error);
return res.sendStatus(500);
}
});

app.listen(process.env.PORT || 3000, () =>
console.log(`🤖 BOT INICIADO en puerto ${process.env.PORT || 3000}`)
);
