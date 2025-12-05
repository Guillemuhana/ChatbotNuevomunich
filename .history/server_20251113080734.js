import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import {
sendMenuPrincipal,
sendDescripcionAmpliada,
sendProductosMenu,
sendProductosDeCategoria,
sendProductoImagen,
replyIA
} from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ⭐ WEBHOOK VERIFICACIÓN
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
return res.status(200).send(challenge);
}

res.sendStatus(403);
});

// ⭐ RECEPCIÓN
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.text?.body || message.interactive?.button_reply?.id;

console.log("📩 MENSAJE:", msg);

// Inicio
if (["hola", "Hola", "menu", "Menú"].includes(msg)) {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// Leer más
if (msg === "LEER_MAS") {
await sendDescripcionAmpliada(from);
return res.sendStatus(200);
}

// Productos
if (msg === "BTN_PRODUCTOS") return await sendProductosMenu(from);

if (["P_FETEADOS", "P_SALAMES", "P_SALCHICHAS"].includes(msg))
return await sendProductosDeCategoria(from, msg);

// Producto individual
if (msg?.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
return await sendProductoImagen(from, nombre);
}

// IA fallback
await replyIA(from, msg);
res.sendStatus(200);
} catch (e) {
console.log("❌ ERROR SERVER:", e);
res.sendStatus(500);
}
});

app.listen(process.env.PORT || 3000, () =>
console.log("🚀 BOT LISTO en http://localhost:" + (process.env.PORT || 3000))
);

