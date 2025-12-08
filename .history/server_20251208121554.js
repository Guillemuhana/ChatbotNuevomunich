// server.js - versión mínima solo para probar el webhook

import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Para leer JSON en los POST
app.use(express.json());

// 🔑 Token que tenés en Railway (WEBHOOK_VERIFY_TOKEN)
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "NO_TOKEN_SET";

console.log("🚀 Iniciando servidor...");
console.log("WEBHOOK_VERIFY_TOKEN =", VERIFY_TOKEN);

// --------------------------------------------------
// RUTA DE TEST
// --------------------------------------------------
app.get("/", (req, res) => {
  console.log("GET /");
  res.status(200).send("✅ Nuevo Munich bot online (test simple)");
});

// --------------------------------------------------
// VERIFICACIÓN WEBHOOK (GET /webhook)
// --------------------------------------------------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("👉 GET /webhook (verificación)", {
    mode,
    token,
    challenge,
    VERIFY_TOKEN,
  });

  if (!mode || !token) {
    return res.status(400).send("Faltan parámetros");
  }

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    console.log("✅ Webhook verificado correctamente");
    // Meta espera que respondamos SOLO el challenge como texto plano
    return res.status(200).send(challenge);
  }

  console.log("❌ Token o modo incorrecto");
  return res.status(403).send("Token inválido");
});

// --------------------------------------------------
// RECEPCIÓN MENSAJES (POST /webhook) – por ahora solo log
// --------------------------------------------------
app.post("/webhook", (req, res) => {
  console.log("📩 POST /webhook body =", JSON.stringify(req.body, null, 2));
  // De momento solo respondemos 200 para que Meta no se queje
  return res.sendStatus(200);
});

// --------------------------------------------------
// MANEJO DE ERRORES GLOBALES (para ver por qué se cae)
// --------------------------------------------------
process.on("uncaughtException", (err) => {
  console.error("💥 uncaughtException:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 unhandledRejection:", reason);
});

// --------------------------------------------------
// LEVANTAR SERVIDOR EN RAILWAY
// --------------------------------------------------
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
