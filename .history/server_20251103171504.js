import express from "express";
import bodyParser from "body-parser";
import { handleIncoming } from "./responses.js";
import "dotenv/config";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// ✅ VERIFICAR WEBHOOK (GET)
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

// ✅ RECIBIR MENSAJES (POST)
app.post("/webhook", (req, res) => {
handleIncoming(req.body);
res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
console.log(`🚀 BOT INICIADO EN PUERTO ${process.env.PORT}`);
});
