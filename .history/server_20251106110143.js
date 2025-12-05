import express from "express";
import dotenv from "dotenv";
import { routeMessage } from "./bot.js";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/webhook", (req, res) =>
req.query["hub.verify_token"] === process.env.WEBHOOK_VERIFY_TOKEN
? res.send(req.query["hub.challenge"])
: res.sendStatus(401)
);

app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (entry && entry.from && entry.text?.body) {
await routeMessage(entry.from, entry.text.body);
}
} catch (e) {
console.log("❌ Error en webhook:", e.response?.data || e);
}
res.sendStatus(200);
});

app.listen(process.env.PORT, () =>
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`)
);

