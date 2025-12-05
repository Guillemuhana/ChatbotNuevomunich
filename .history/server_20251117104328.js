// =========================
// SERVER.JS FINAL
// =========================

import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const VERIFY_TOKEN = "guille1234";

// ==========================
// 1) VALIDACIÓN DEL WEBHOOK
// ==========================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token === VERIFY_TOKEN) {
console.log("🔵 WEBHOOK VALIDADO CORRECTAMENTE");
return res.status(200).send(challenge);
}

console.log("🔴 ERROR: TOKEN DE VERIFICACIÓN INCORRECTO");
return res.sendStatus(403);
});

// ==========================
// 2) RECEPCIÓN DE MENSAJES
// ==========================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0];
const message = changes?.value?.messages?.[0];

if (!message) {
return res.sendStatus(200);
}

const from = message.from;
const text = message.text?.body?.toLowerCase() || "";

console.log("📩 MENSAJE RECIBIDO:", text);

// RESPUESTA SIMPLE — SOLO PARA PROBAR
if (text === "hola") {
await sendText(from, "Hola 🙌 Bienvenido a Nuevo Munich. ¿En qué puedo ayudarte?");
} else {
await sendText(from, "No entendí. Escribí *hola* para comenzar.");
}

res.sendStatus(200);

} catch (err) {
console.error("❌ ERROR EN WEBHOOK:", err.response?.data || err);
res.sendStatus(500);
}
});

// ==========================
// 3) FUNCIÓN PARA ENVIAR TEXTO
// ==========================
async function sendText(to, body) {
try {
const url = `https://graph.facebook.com/v17.0/${PHONE_ID}/messages`;

const data = {
messaging_product: "whatsapp",
to,
type: "text",
text: { body }
};

await axios.post(url, data, {
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${TOKEN}`
}
});

console.log("✅ MENSAJE ENVIADO:", body);

} catch (err) {
console.error("❌ ERROR AL ENVIAR:", err.response?.data || err);
}
}

// ==========================
// 4) INICIAR SERVIDOR
// ==========================
app.listen(3000, () => {
console.log("🚀 BOT LISTO → http://localhost:3000");
});
