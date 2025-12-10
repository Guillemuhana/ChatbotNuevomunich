import express from "express";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "guille1234";

// GET para verificación del webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("🌐 GET Webhook Query:", req.query);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("🟢 Webhook verificado correctamente");
    return res.status(200).send(challenge);
  } else {
    console.log("🔴 Token incorrecto");
    return res.sendStatus(403);
  }
});

// POST para mensajes entrantes
app.post("/webhook", (req, res) => {
  console.log("📩 POST Webhook Body:");
  console.log(JSON.stringify(req.body, null, 2));
  return res.sendStatus(200);
});

// Railway exige 0.0.0.0
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("⚡ Servidor corriendo en puerto:", PORT);
});
