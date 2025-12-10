import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "guille1234";
const PORT = process.env.PORT || 3000;

// Webhook GET - Validación
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    return res.status(200).send(challenge);
  }

  console.log("Webhook verification failed");
  res.sendStatus(403);
});

// Webhook POST - Mensajes
app.post("/webhook", (req, res) => {
  console.log("Mensaje entrante:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// Home Test
app.get("/", (req, res) => {
  res.send("🚀 Nuevo Munich Bot corriendo correctamente!");
});

// Escuchar
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
