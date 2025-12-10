import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

// VARIABLES ENV
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

// ------------ VERIFICACIÓN DEL WEBHOOK --------------- //
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado!!!");
    return res.status(200).send(challenge);
  } else {
    console.log("Token incorrecto:", token);
    return res.sendStatus(403);
  }
});

// ------------ RECEPCIÓN MENSAJES WHATSAPP ------------- //
app.post("/webhook", (req, res) => {
  console.log("Mensaje recibido:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// ------------ HOME ---------------- //
app.get("/", (req, res) => {
  res.status(200).send("Servidor funcionando!!!");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en puerto ${PORT}`);
});
