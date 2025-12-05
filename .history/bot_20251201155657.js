// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendBienvenida,
sendMenuPrincipal,
sendCategoriaProductos,
sendSubcategoria,
sendFoodTruck,
sendCatalogoCompleto,
sendChatVentas,
sendRespuestaIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// VERIFICACIÓN WEBHOOK
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
return res.status(200).send(challenge);
}

return res.sendStatus(403);
});

// RECEPCIÓN MENSAJES
app.post("/webhook", async (req, res) => {
try {
const msgObj = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!msgObj) return res.sendStatus(200);

const from = msgObj.from;
let msg = "";

if (msgObj.type === "text") msg = msgObj.text.body;
if (msgObj.type === "interactive") {
const inter = msgObj.interactive;
if (inter.type === "button_reply") msg = inter.button_reply.id;
if (inter.type === "list_reply") msg = inter.list_reply.id;
}

const lower = msg.toLowerCase();

// Comandos
if (["menu", "menú", "hola", "buenas"].includes(lower)) {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

if (msg === "CAT_PRODUCTOS") return await sendCategoriaProductos(from);
if (msg === "FOOD_TRUCK") return await sendFoodTruck(from);
if (msg === "CATALOGO_PDF") return await sendCatalogoCompleto(from);
if (msg === "CHAT_VENTAS") return await sendChatVentas(from);

// Derivación automática a ventas
if (
lower.includes("precio") ||
lower.includes("pedido") ||
lower.includes("venta") ||
lower.includes("presupuesto")
) {
await sendChatVentas(from);
return res.sendStatus(200);
}

// IA
await sendRespuestaIA(from, msg);
return res.sendStatus(200);

} catch (err) {
console.error("❌ Error webhook:", err);
res.sendStatus(500);
}
});

// LEVANTAR SERVIDOR
app.listen(3000, () => console.log("BOT LISTO → http://localhost:3000"));
