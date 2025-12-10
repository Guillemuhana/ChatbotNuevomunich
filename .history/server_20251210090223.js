import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

// PUERTO Railway
const PORT = process.env.PORT || 3000;

// 💚 VERIFICACIÓN WEBHOOK META
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log("Webhook verificado");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// 📩 RECEPCIÓN DE MENSAJES POST
app.post("/webhook", (req, res) => {
  console.log("Mensaje recibido:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// HOME TEST
app.get("/", (_req, res) => res.send("🚀 Bot Online!"));

// Iniciar servidor
app.listen(PORT, () => console.log("Servidor escuchando en puerto", PORT));
