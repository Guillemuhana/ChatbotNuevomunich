import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import { sendText, sendButtons } from "./bot.js"; // 👈 Asegurate que el archivo se llama bot.js
import { procesarMensajeIA } from "./ia.js"; // 👈 Antes era conocimiento.js, ahora es ia.js

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "miwebhook";
const PORT = process.env.PORT || 3000;

// ✅ Webhook GET (verificación con Meta)
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente!");
return res.status(200).send(challenge);
} else {
console.log("❌ Falló la verificación del webhook.");
return res.sendStatus(403);
}
});

// ✅ Webhook POST (manejo de mensajes entrantes)
app.post("/webhook", async (req, res) => {
try {
const data = req.body;

if (!data.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
return res.sendStatus(200);
}

const message = data.entry[0].changes[0].value.messages[0];
const from = message.from;
const text = message.text?.body?.toLowerCase() || "";

console.log("📩 Mensaje recibido:", text);

// ✅ MENÚ AUTOMÁTICO CUANDO DICEN "hola", "menu", "buenas", etc.
if (text.includes("hola") || text.includes("menú") || text.includes("menu") || text.includes("buenas")) {
await sendButtons(from);
return res.sendStatus(200);
}

// ✅ BOTÓN: Catálogo
if (message.type === "interactive" && message.interactive.button_reply?.id === "ver_catalogo") {
await sendText(from, "📦 Catálogo digital:\nhttps://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view");
return res.sendStatus(200);
}

// ✅ BOTÓN: Picadas
if (message.type === "interactive" && message.interactive.button_reply?.id === "ver_picadas") {
await sendText(from, "🥨 ¡Perfecto! Decime para cuántas personas pensabas la picada.");
return res.sendStatus(200);
}

// ✅ BOTÓN: Contacto
if (message.type === "interactive" && message.interactive.button_reply?.id === "contacto") {
await sendText(from, "📞 Podés escribirnos en Instagram:\nhttps://instagram.com/nuevomunich.oficial");
return res.sendStatus(200);
}

// ✅ SI EL USUARIO ESCRIBE "picadas" SIN BOTÓN → respondemos igual
if (text.includes("picada") || text.includes("picadas")) {
await sendText(from, "🥨 ¡Genial! ¿Para cuántas personas sería?");
return res.sendStatus(200);
}

// ✅ RESPUESTA CON IA
const respuestaIA = await procesarMensajeIA(text);
await sendText(from, respuestaIA);

return res.sendStatus(200);

} catch (e) {
console.error("❌ Error en POST webhook:", e);
return res.sendStatus(500);
}
});

// ✅ Iniciar servidor
app.listen(PORT, () => {
console.log(`🚀 BOT INICIADO EN PUERTO ${PORT}`);
});
