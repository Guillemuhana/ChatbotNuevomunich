import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "guille1234";

// Endpoint para verificación del webhook (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("🔍 Verificación Webhook:");
  console.log("mode:", mode, "token:", token, "challenge:", challenge);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("⬆️ Webhook verificado correctamente");
    return res.status(200).send(challenge);
  }

  console.log("❌ Token incorrecto, verificación falló");
  return res.sendStatus(403);
});

// Endpoint para recibir mensajes (POST)
app.post("/webhook", (req, res) => {
  console.log("📩 Mensaje recibido:");
  console.log(JSON.stringify(req.body, null, 2));

  res.sendStatus(200);
});

// Puerto dinámico para Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en puerto ${PORT}`);
});
