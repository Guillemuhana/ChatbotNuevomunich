import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

// Variables del entorno
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// 👇 Ruta de verificación del webhook (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("📥 GET webhook verify:", mode, token, challenge);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✔ Webhook verificado correctamente!");
    res.status(200).send(challenge);
  } else {
    console.log("❌ Webhook verificación fallida!");
    res.sendStatus(403);
  }
});

// 👇 Ruta que recibirá los mensajes (POST)
app.post("/webhook", (req, res) => {
  console.log("📥 POST webhook recibido:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// Endpoint raíz
app.get("/", (_req, res) => res.send("💡 Chatbot Nuevo Munich ONLINE 🚀"));

// PORT para Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 Servidor activo en puerto:", PORT);
});
