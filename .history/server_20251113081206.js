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

// =============================
// VERIFICACIÓN DE WEBHOOK
// =============================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("🟢 WEBHOOK VERIFICADO");
return res.status(200).send(challenge);
}

res.sendStatus(403);
});

// =============================
// RECEPCIÓN DE MENSAJES
// =============================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg =
message.text?.body ||
message.interactive?.button_reply?.id ||
"";

console.log("🟢 MENSAJE:", msg);

// ————————————————————————————
// INICIO / SALUDO
// ————————————————————————————
if (
["hola", "Hola", "Holaa", "Menu", "menú", "Menú", "inicio", "Inicio"].includes(
msg
)
) {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// ————————————————————————————
// LEER MÁS → DESCRIPCIÓN AMPLIADA
// ————————————————————————————
if (msg === "LEER_MAS") {
await sendDescripcionAmpliada(from);
return res.sendStatus(200);
}

// ————————————————————————————
// BOTONES PRINCIPALES
// ————————————————————————————
if (msg === "BTN_PRODUCTOS") {
await sendProductosMenu(from);
return res.sendStatus(200);
}

if (msg === "BTN_EVENTOS") {
await replyIA(from, "Quiero info sobre eventos y catering");
return res.sendStatus(200);
}

if (msg === "BTN_PEDIDO") {
await replyIA(from, "Quiero hacer un pedido");
return res.sendStatus(200);
}

// ————————————————————————————
// CATEGORÍAS DE PRODUCTOS
// ————————————————————————————
if (["P_FETEADOS", "P_SALAMES", "P_SALCHICHAS"].includes(msg)) {
await sendProductosDeCategoria(from, msg);
return res.sendStatus(200);
}

// ————————————————————————————
// PRODUCTO SELECCIONADO
// ————————————————————————————
if (msg.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProductoImagen(from, nombre);
return res.sendStatus(200);
}

// ————————————————————————————
// IA POR DEFECTO
// ————————————————————————————
await replyIA(from, msg);
res.sendStatus(200);

} catch (error) {
console.log("❌ ERROR EN WEBHOOK:", error);
res.sendStatus(500);
}
});

// =============================
// INICIAR SERVIDOR
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log("✅ BOT LISTO → http://localhost:" + PORT);
});
