import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

// ✅ VERIFICACIÓN INICIAL DEL WEBHOOK
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente.");
res.status(200).send(challenge);
} else {
res.sendStatus(403);
}
});

// 📨 FUNCIÓN PARA ENVIAR MENSAJES DE TEXTO
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
type: "text",
text: { body: text },
}),
});

const data = await response.json();
if (data.error) console.log("❌ ERROR sendMessage:", data.error);
}

// 📦 FUNCIÓN PARA ENVIAR MENÚ (CATÁLOGO)
async function sendCatalogMenu(to) {
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
type: "interactive",
interactive: {
type: "list",
body: { text: "📦 *Catálogo Nuevo Munich*\nElegí una categoría:" },
footer: { text: "Hecho con ❤️ por Studio B2B" },
action: {
button: "Ver opciones",
sections: [
{
title: "Categorías",
rows: [
{ id: "fiambres", title: "🥓 Fiambres" },
{ id: "embutidos", title: "🥩 Embutidos" },
{ id: "congelados", title: "❄️ Congelados" }
]
}
]
}
}
})
});

const data = await response.json();
if (data.error) console.log("❌ ERROR sendCatalogMenu:", data.error);
else console.log("✅ Menú enviado!");
}

// 🤖 RECIBIR MENSAJES
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

if (entry) {
const from = entry.from;
const msg = entry.text?.body?.toLowerCase() || "";

console.log(`📩 Mensaje recibido de ${from}: ${msg}`);

if (msg.includes("hola") || msg.includes("buenas")) {
await sendMessage(from, "¡Hola! 👋 Soy tu Bot 🤖\n¿En qué puedo ayudarte?");
}
else if (msg.includes("catalogo") || msg.includes("catálogo") || msg.includes("menu") || msg.includes("productos")) {
await sendCatalogMenu(from);
}
else {
await sendMessage(from, "No entendí 🤔\nEscribí *catálogo* para ver nuestros productos 📦");
}
}

res.sendStatus(200);
} catch (e) {
console.error("❌ ERROR WEBHOOK:", e);
res.sendStatus(500);
}
});

// ✅ INICIAR SERVIDOR
app.listen(PORT, () => {
console.log(`🚀 BOT INICIADO en puerto ${PORT}`);
console.log(`👉 Ejecutá ahora: npx localtunnel --port ${PORT}`);
});

