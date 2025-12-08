import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "guille1234";

// --- VERIFICACIÓN FACEBOOK ---
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Solicitud GET desde Meta >>>", mode, token, challenge);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✔ Challenge enviado!");
    return res.status(200).send(challenge);
  }
  console.log("❌ Token incorrecto");
    return res.sendStatus(403);
});

// --- RECEPCIÓN MENSAJES ---
app.post("/webhook", (req, res) => {
  console.log("POST recibido:", JSON.stringify(req.body, null, 2));
  return res.sendStatus(200);
});

// Endpoint útil para comprobar online
app.get("/", (_req, res) => res.send("💡 Chatbot Nuevo Munich ONLINE 🚀"));

app.listen(process.env.PORT || 3000, () =>
  console.log("🔥 Servidor activo en puerto:", process.env.PORT || 3000)
);
