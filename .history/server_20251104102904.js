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
return res.status(200).send(challenge);
}
res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!msg) return res.sendStatus(200);

const from = msg.from;
const text = msg.text?.body?.toLowerCase() || "";
const reply = msg?.interactive?.button_reply?.id;

// Bienvenida
if (["hola", "buenas", "hey"].includes(text)) {
await sendImage(from, process.env.LOGO_URL);
await sendText(from, `Bienvenido/a a *Nuevo Munich*\nArtesanos del sabor desde 1972.\n\n🌍 ${process.env.WEB_URL}\n📸 ${process.env.INSTAGRAM_URL}`);
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// Botones
if (reply === "PICADAS") return await sendText(from, "Perfecto 🙌 ¿Para cuántas personas sería la picada?");
if (reply === "PRODUCTOS") return await sendText(from, "Decime qué producto estás buscando.");
if (reply === "PEDIDO") return await sendText(from, "Decime qué querés pedir y lo preparamos ✅");

// IA para lo demás
const respuesta = await procesarMensajeIA(text);
await sendText(from, respuesta);

res.sendStatus(200);
});

app.listen(3000, () => console.log("🚀 BOT LISTO en puerto 3000"));

