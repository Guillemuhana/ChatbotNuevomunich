import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

// --- VARIABLES DE ENTORNO ---
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Chatbot Nuevo Munich funcionando en Railway");
});

// 📌 VALIDACIÓN WEBHOOK - GET
app.get("/webhook", (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✔️ Webhook verificado correctamente");
      res.status(200).send(challenge);
    } else {
      console.log("❌ Token incorrecto");
      res.sendStatus(403);
    }
  } catch (e) {
    console.error("❌ Error en GET /webhook:", e);
    res.sendStatus(500);
  }
});

// 📌 RECEPCIÓN DE MENSAJES - POST
app.post("/webhook", (req, res) => {
  console.log("📩 Webhook recibido:", JSON.stringify(req.body, null, 2));
  // SIEMPRE RESPONDER 200
  res.sendStatus(200);
});

// 🔥 Railway Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
