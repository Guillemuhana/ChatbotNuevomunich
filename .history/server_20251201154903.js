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
sendProducto,
sendFoodTruck,
sendCatalogoCompleto,
sendChatVentas,
sendRespuestaIA,
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ======================================================
// VERIFICACIÓN DEL WEBHOOK
// ======================================================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ WEBHOOK VERIFICADO");
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
}
return res.sendStatus(400);
});

// ======================================================
// RECEPCIÓN DE MENSAJES
// ======================================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const value = entry?.changes?.[0]?.value;
const message = value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const type = message.type;
let msg = null;

if (type === "text") {
msg = message.text?.body;
}

if (type === "interactive") {
const inter = message.interactive;
if (inter.type === "button_reply") msg = inter.button_reply.id;
if (inter.type === "list_reply") msg = inter.list_reply.id;
}

if (!msg) return res.sendStatus(200);

const lower = msg.toLowerCase().trim();
console.log("📩 MENSAJE:", msg);

// -------------------------------
// SALUDOS → BIENVENIDA
// -------------------------------
if (
["hola", "hola!", "buenas", "menu", "menú"].includes(lower)
) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// -------------------------------
// MENÚ PRINCIPAL
// -------------------------------
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// -------------------------------
// CATEGORÍAS
// -------------------------------
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// -------------------------------
// SUBCATEGORÍAS
// -------------------------------
if (
msg === "CAT_FETEADOS" ||
msg === "CAT_SALAMES" ||
msg === "CAT_SALCHICHAS" ||
msg === "CAT_ESPECIALIDADES"
) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// -------------------------------
// FOOD TRUCK
// -------------------------------
if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

// -------------------------------
// CATÁLOGO (por palabra)
// -------------------------------
if (
msg === "CATALOGO_PDF" ||
lower.includes("catalogo") ||
lower.includes("catálogo") ||
lower.includes("pdf")
) {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

// -------------------------------
// CHAT CON VENTAS (botón)
// -------------------------------
if (msg === "CHAT_VENTAS") {
await sendChatVentas(from);
return res.sendStatus(200);
}

// -------------------------------
// CHAT CON VENTAS (por texto)
// Derivamos cuando hablan de ventas, pedido, precio, presupuesto, etc.
// -------------------------------
if (
lower.includes("venta") ||
lower.includes("vendedor") ||
lower.includes("presupuesto") ||
lower.includes("precio") ||
lower.includes("precios") ||
lower.includes("pedido") ||
lower.includes("comprar") ||
lower.includes("compra")
) {
await sendChatVentas(from);
return res.sendStatus(200);
}

// -------------------------------
// IA PARA TODO LO DEMÁS
// -------------------------------
await sendRespuestaIA(from, msg);
return res.sendStatus(200);
} catch (err) {
console.error("❌ ERROR WEBHOOK:", err);
return res.sendStatus(500);
}
});

// ======================================================
// INICIAR SERVIDOR
// ======================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
console.log(`✅ BOT LISTO → http://localhost:${PORT}`)
);