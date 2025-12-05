import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { sendText, sendImage, sendMenuPrincipal } from "./bot.js";
import { procesarMensajeIA } from "./ia.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
console.log("✅ Webhook verificado");
res.status(200).send(challenge);
} else {
res.sendStatus(403);
}
});

app.post("/webhook", async (req, res) => {
try {
const data = req.body;

if (data?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
const msg = data.entry[0].changes[0].value.messages[0];
const from = msg.from;
const text = msg.text?.body?.toLowerCase() || "";

// Bienvenida inicial
if (text === "hola" || text === "buenas" || text === "hey") {
await sendImage(from, process.env.LOGO_URL);
await sendText(from, `Bienvenido/a a *Nuevo Munich*\nArtesanos del sabor desde 1972\n\n🌐 ${process.env.WEB_URL}\n📸 ${process.env.INSTAGRAM_URL}`);
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// Botón Picadas
if (msg?.interactive?.button_reply?.id === "PICADAS") {
await sendText(from, "Contame para cuántas personas es la picada y si es familiar, evento o regalo.");
return res.sendStatus(200);
}

// Botón Productos
if (msg?.interactive?.button_reply?.id === "PRODUCTOS") {
await sendText(from, "Decime qué producto estás buscando (bondiola, jamón bávaro, alpino, kassler, etc.).");
return res.sendStatus(200);
}

// Botón Pedido
if (msg?.interactive?.button_reply?.id === "PEDIDO") {
await sendText(from, "Perfecto. Decime qué productos querés y en qué cantidad. Nuestro equipo te confirmará disponibilidad y precio.");
return res.sendStatus(200);
}

// IA para todo lo demás
const respuesta = await procesarMensajeIA(text);
await sendText(from, respuesta);
}

res.sendStatus(200);

} catch (e) {
console.error("❌ Error:", e);
res.sendStatus(500);
}
});

app.listen(3000, () => console.log("🚀 BOT listo en puerto 3000"));

