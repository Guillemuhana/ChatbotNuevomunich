import express from "express";
import bodyParser from "body-parser";
import { sendGreeting, sendCatalog, sendAIResponse } from "./responses.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

app.get("/webhook", (req, res) => {
const verifyToken = process.env.VERIFY_TOKEN;
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token === verifyToken) {
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
});

app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0];
const value = changes?.value;
const message = value?.messages?.[0];

if (message && message.type === "text") {
const from = message.from;
const text = message.text.body.trim().toLowerCase();

console.log("💬 Mensaje recibido:", text);

if (text === "hola" || text === "buenas" || text === "qué tal") {
await sendGreeting(from);
}
else if (text.includes("catalogo") || text.includes("catálogo")) {
await sendCatalog(from);
}
else {
await sendAIResponse(from, text);
}
}

return res.sendStatus(200);
} catch (error) {
console.log("❌ ERROR webhook:", error);
return res.sendStatus(500);
}
});

app.listen(process.env.PORT || 3000, () =>
console.log("✅ BOT INICIADO en puerto", process.env.PORT || 3000)
);

