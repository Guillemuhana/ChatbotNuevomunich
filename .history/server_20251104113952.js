// server.js
import express from "express";
import dotenv from "dotenv";
import {
sendText,
sendImage,
sendButtons,
sendWelcomeBlock,
sendProductosMenu,
sendProductosMas,
sendCategoriaDetalle,
initOrderSession,
handleOrderFlow,
sessions
} from "./bot.js";
import { procesarMensajeIA } from "./ia.js";

dotenv.config();

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "miwebhook";

// ---------- Webhook verify ----------
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente!");
return res.status(200).send(challenge);
}
return res.sendStatus(403);
});

// ---------- Webhook receive ----------
app.post("/webhook", async (req, res) => {
try {
const entry = req.body?.entry?.[0];
const changes = entry?.changes?.[0];
const message = changes?.value?.messages?.[0];

// WhatsApp envía ACK aunque no haya mensaje
if (!message) {
return res.sendStatus(200);
}

const from = message.from; // teléfono del usuario (string)
let text = "";
let buttonId = "";

if (message.type === "text") {
text = message.text?.body?.trim() || "";
} else if (message.type === "interactive") {
const interactive = message.interactive;
if (interactive?.type === "button_reply") {
buttonId = interactive.button_reply?.id;
} else if (interactive?.type === "list_reply") {
buttonId = interactive.list_reply?.id;
}
}
console.log("📩 Mensaje recibido:", buttonId || text || "(vacío)");

// -------- Routing principal --------
// Menú / hola
const t = (text || "").toLowerCase();
if (["hola", "menu", "menú", "inicio", "start"].includes(t)) {
await sendWelcomeBlock(from);
return res.sendStatus(200);
}

// Botones principales
if (buttonId === "BTN_PICADAS") {
await sendText(from, "¿Para cuántas personas aproximadamente pensabas la picada?");
return res.sendStatus(200);
}
if (buttonId === "BTN_PRODUCTOS") {
await sendProductosMenu(from);
return res.sendStatus(200);
}
if (buttonId === "BTN_PEDIDO") {
initOrderSession(from);
await sendButtons(from, "¿Para qué es el pedido?", [
{ id: "ORD_TIPO_FAMILIAR", title: "Consumo familiar" },
{ id: "ORD_TIPO_EVENTO", title: "Evento" },
{ id: "ORD_TIPO_OTRO", title: "Hotel/Rest./Otro" }
]);
return res.sendStatus(200);
}

// Botones de productos
if (buttonId === "BTN_PROD_PICADAS") {
await sendCategoriaDetalle(from, "PICADAS");
return res.sendStatus(200);
}
if (buttonId === "BTN_PROD_SALCHICHAS") {
await sendCategoriaDetalle(from, "SALCHICHAS");
return res.sendStatus(200);
}
if (buttonId === "BTN_PROD_MAS") {
await sendProductosMas(from);
return res.sendStatus(200);
}
if (buttonId === "BTN_VOLVER") {
await sendProductosMenu(from);
return res.sendStatus(200);
}
if (["BTN_PROD_COCINAR", "BTN_PROD_PARRILLA"].includes(buttonId)) {
await sendCategoriaDetalle(from, buttonId === "BTN_PROD_COCINAR" ? "COCINAR" : "PARRILLA");
return res.sendStatus(200);
}

// Flujo de pedido (si el user está en sesión o toca botones ORD_)
if (buttonId.startsWith?.("ORD_") || sessions.has(from)) {
await handleOrderFlow(from, buttonId || text);
return res.sendStatus(200);
}

// IA para consultas libres (productos, usos, picadas, etc.)
if (text) {
const r = await procesarMensajeIA(text);
await sendText(from, r);
await sendText(from, "Escribí *menu* para volver al inicio.");
return res.sendStatus(200);
}

return res.sendStatus(200);
} catch (e) {
console.error("❌ Error en POST webhook:", e);
return res.sendStatus(200);
}
});

// ---------- Start ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 BOT LISTO en puerto ${PORT}`));

