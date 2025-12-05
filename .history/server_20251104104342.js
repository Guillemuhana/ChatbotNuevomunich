import express from "express";
import dotenv from "dotenv";
import {
sendMenuPrincipal,
sendPicadasIntro,
sendProductosIntro,
sendPedidoInicio,
sendText
} from "./bot.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/webhook", (req, res) => {
const verifyToken = process.env.VERIFY_TOKEN;
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token && mode === "subscribe" && token === verifyToken) {
console.log("✅ Webhook verificado correctamente!");
return res.status(200).send(challenge);
}
return res.status(403).send("Error");
});

app.post("/webhook", async (req, res) => {
const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!entry) return res.sendStatus(200);

const from = entry.from;
const text = entry.text?.body?.toLowerCase();

console.log("📩 Mensaje recibido:", text);

// --- MENÚ PRINCIPAL ---
if (text === "hola" || text === "menu" || text === "inicio") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// --- BOTONES ---
const buttonId = entry.interactive?.button_reply?.id;

switch (buttonId) {
case "PICADAS":
await sendPicadasIntro(from);
break;
case "PRODUCTOS":
await sendProductosIntro(from);
break;
case "PEDIDO":
await sendPedidoInicio(from);
break;
default:
await sendText(from, "No comprendí 💭. Escribí *menu* para ver opciones.");
}

res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
console.log(`🚀 BOT LISTO en puerto ${process.env.PORT}`);
});
