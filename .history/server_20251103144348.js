import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// ✅ Webhook verification
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
res.send(req.query["hub.challenge"]);
} else {
res.sendStatus(403);
}
});

// ✅ Recibir mensajes
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (entry) {
const from = entry.from;
const msg = entry.text?.body || "";

console.log(`📩 Mensaje recibido de ${from}: ${msg}`);

await sendMessage(from, "Hola! Soy tu Bot 🤖 ¿En qué puedo ayudarte?");
}
res.sendStatus(200);
} catch (e) {
console.error("❌ ERROR:", e);
res.sendStatus(500);
}
});

// ✅ Función enviar mensaje
async function sendMessage(to, text) {
const url = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;

const response = await fetch(url, {
method: "POST",
headers: {
Authorization: `Bearer ${TOKEN}`,
"Content-Type": "application/json",
},
body: JSON.stringify({
messaging_product: "whatsapp",
to,
text: { body: text },
}),
});

const data = await response.json();
if (data.error) console.log("❌ ERROR ENVIANDO MENSAJE:", data.error);
else console.log("✅ Mensaje enviado!");
}

app.listen(process.env.PORT, () => {
console.log(`✅ BOT INICIADO EN PUERTO ${process.env.PORT}`);
});

