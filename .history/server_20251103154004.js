import express from "express";
import bodyParser from "body-parser";
import { handleIncoming } from "./responses.js";

const app = express();
app.use(bodyParser.json());

const verifyToken = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

// VERIFICACIÓN WEBHOOK
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === verifyToken) {
return res.send(req.query["hub.challenge"]);
}
res.sendStatus(403);
});

// CUANDO LLEGA UN MENSAJE
app.post("/webhook", async (req, res) => {
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (message?.text?.body) {
const from = message.from;
const text = message.text.body;
console.log("📩 Mensaje recibido:", text);
await handleIncoming(from, text);
}
res.sendStatus(200);
});

app.listen(PORT, () =>
console.log(`✅ BOT ACTIVADO en puerto ${PORT}`)
);

