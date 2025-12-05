import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import {
sendWelcome,
sendPicadasInfo,
sendPicadaPorPersonas,
sendCatalogo,
sendContacto
} from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// ✅ VERIFICACIÓN DEL WEBHOOK (GET)
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente!");
res.status(200).send(challenge);
} else {
console.log("❌ Falló la verificación del webhook.");
res.sendStatus(403);
}
});

// ✅ RECEPCIÓN DE MENSAJES (POST)
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const change = entry?.changes?.[0];
const message = change?.value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body?.toLowerCase() || "";

console.log("📩 Mensaje recibido:", text);

// 📌 LÓGICA DEL FLUJO
if (["hola", "buenas", "holaa", "hey"].includes(text)) {
await sendWelcome(from);
} else if (text === "catalogo" || text === "📦 catálogo") {
await sendCatalogo(from);
} else if (text === "contacto" || text === "📞 contacto") {
await sendContacto(from);
} else if (text === "picadas" || text === "🥨 picadas") {
await sendPicadasInfo(from);
} else if (!isNaN(text)) {
await sendPicadaPorPersonas(from, Number(text));
} else {
await sendWelcome(from);
}

res.sendStatus(200);

} catch (err) {
console.log("❌ Error en POST webhook:", err);
res.sendStatus(500);
}
});

// ✅ SERVIDOR ONLINE
app.listen(process.env.PORT || 3000, () => {
console.log(`🚀 BOT INICIADO EN PUERTO ${process.env.PORT || 3000}`);
});

