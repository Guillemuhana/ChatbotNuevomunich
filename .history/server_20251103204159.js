import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import { sendWelcome, handleUserSelection, sendText } from "./bot.js";
import { procesarMensajeIA } from "./ia.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// ✅ GET (verificación del Webhook)
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente!");
return res.status(200).send(challenge);
}

console.log("❌ Falló la verificación del Webhook.");
return res.sendStatus(403);
});

// ✅ POST (mensajes entrantes)
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0];
const message = changes?.value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from; // Número del cliente
const text = message.text?.body?.toLowerCase(); // Texto recibido
console.log("📩 Mensaje recibido:", text);

// ✅ SALUDO → MENÚ
if (text === "hola" || text === "buenas" || text === "hello") {
await sendWelcome(from);
return res.sendStatus(200);
}

// ✅ INTERACCIONES DE BOTONES
if (message.type === "interactive") {
const selection = message?.interactive?.button_reply?.id;
await handleUserSelection(from, selection);
return res.sendStatus(200);
}

// ✅ Si pregunta sobre picadas → IA
if (text?.includes("picada") || text?.match(/\b\d+\b/)) {
const respuesta = await procesarMensajeIA(text);
await sendText(from, respuesta);
return res.sendStatus(200);
}

// ✅ Respuesta por defecto
await sendWelcome(from);
return res.sendStatus(200);

} catch (err) {
console.error("❌ Error en POST webhook:", err);
return res.sendStatus(200);
}
});

app.listen(process.env.PORT || 3000, () =>
console.log(`🚀 BOT INICIADO EN PUERTO ${process.env.PORT || 3000}`)
);

