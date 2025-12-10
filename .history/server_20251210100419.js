const express = require("express");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = "guille1234"; // TOKEN que pusiste en Facebook

// ➤ GET para VERIFICACIÓN del webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("🌐 Entrada GET Webhook:", req.query);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("🟢 Facebook verificó el webhook correctamente");
    return res.status(200).send(challenge);
  } else {
    console.log("🔴 Error en validación del token");
    return res.sendStatus(403);
  }
});

// ➤ POST para recibir mensajes de WhatsApp
app.post("/webhook", (req, res) => {
  console.log("📩 Mensaje recibido desde WhatsApp:");
  console.log(JSON.stringify(req.body, null, 2));

  res.sendStatus(200); // Facebook exige 200 ALWAYS
});

// ➤ PORT que da Railway (OBLIGATORIO)
const PORT = process.env.PORT || 3000;

// ➤ BIND A 0.0.0.0 (Sin esto Railway rechaza)
app.listen(PORT, "0.0.0.0", () => {
  console.log("⚡ Servidor corriendo en puerto =>", PORT);
});
