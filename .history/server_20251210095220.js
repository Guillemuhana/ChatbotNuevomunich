import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// WEBHOOK VERIFY
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
        console.log("Webhook verificado correctamente");
        return res.status(200).send(challenge);
    }

    console.error("Error de verificación del webhook");
    return res.sendStatus(403);
});

// WEBHOOK RECEIVE
app.post("/webhook", (req, res) => {
    console.log("BODY:", JSON.stringify(req.body, null, 2));
    return res.sendStatus(200);
});

// 🚀 PUERTO CORRECTO PARA RAILWAY
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Servidor escuchando en puerto ${PORT}`)
);
