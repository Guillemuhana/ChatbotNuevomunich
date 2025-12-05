import express from "express";
import dotenv from "dotenv";
import { handleIncoming } from "./bot.js";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.WEBHOOK_VERIFY_TOKEN) {
return res.send(req.query["hub.challenge"]);
}
res.send("Token inválido");
});

app.post("/webhook", async (req, res) => {
try {
const data = req.body;
const message = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

if (message && message.type === "text") {
await handleIncoming(message);
}
} catch (e) {
console.log("Error:", e);
}
res.sendStatus(200);
});

app.listen(process.env.PORT, () =>
console.log(`✅ BOT LISTO en puerto ${process.env.PORT}`)
);

