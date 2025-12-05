import express from "express";
import bodyParser from "body-parser";
import { sendWelcome, sendPicadasInfo, sendPicadaPorPersonas } from "./bot.js";

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!entry) return res.sendStatus(200);

const from = entry.from;
const message = entry.text?.body?.toLowerCase() || "";

console.log("📩 Mensaje recibido:", message);

if (message === "hola" || message === "hi" || message === "buenas") {
return sendWelcome(from);
}

if (message.includes("picad")) {
return sendPicadasInfo(from);
}

if (/^\d+$/.test(message)) {
return sendPicadaPorPersonas(from, message);
}

// Mensaje default
await sendWelcome(from);

} catch (e) {
console.log("❌ Error en POST webhook:", e);
}

res.sendStatus(200);
});
