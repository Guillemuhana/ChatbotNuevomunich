import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import {
sendMenuPrincipal,
sendDescripcionAmpliada,
sendProductosMenu,
sendProductosDeCategoria,
sendProductoImagen,
replyIA,
sessions
} from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// =============================
// VERIFICACIÓN
// =============================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
res.status(200).send(challenge);
} else {
res.sendStatus(403);
}
});

// =============================
// RECEPCIÓN
// =============================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.text?.body || message.interactive?.button_reply?.id;

console.log("🟢 MENSAJE:", msg);

// INICIO
if (["hola", "Hola", "menu", "Menú", "Menú Principal"].includes(msg)) {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// LEER MÁS
if (msg === "LEER_MAS") {
await sendDescripcionAmpliada(from);
return res.sendStatus(200);
}

// BOTONES PRINCIPALES
if (msg === "BTN_PRODUCTOS") return await sendProductosMenu(from);
if (msg === "BTN_EVENTOS")
return await replyIA(from, "Quiero info sobre eventos");
if (msg === "BTN_PEDIDO")
return await replyIA(from, "Quiero hacer un pedido");

// CATEGORÍAS
if (["P_FETEADOS", "P_SALAMES", "P_SALCHICHAS"].includes(msg))
return await sendProductosDeCategoria(from, msg);

// PRODUCTO SELECCIONADO
if (msg.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
return await sendProductoImagen(from, nombre);
}

// IA fallback
await replyIA(from, msg);

res.sendStatus(200);
} catch (e) {
console.log("❌ ERROR WEBHOOK:", e);
res.sendStatus(500);
}
});

// =============================
app.listen(process.env.PORT || 3000, () =>
console.log("✅ BOT LISTO → http://localhost:" + (process.env.PORT || 3000))
);

