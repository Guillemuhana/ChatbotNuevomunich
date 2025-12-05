// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import {
sendBienvenida,
sendLeerMas,
sendMenuPrincipal,
sendCategoriaProductos,
sendSubcategoria,
sendProducto,
sendCatalogoCompleto,
sendFoodTruck,
iniciarPedido,
manejarPedido,
} from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// ================================
// VERIFICACIÓN DEL WEBHOOK
// ================================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
return res.status(200).send(challenge);
}

return res.sendStatus(403);
});

// ================================
// RECEPCIÓN DE MENSAJES
// ================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];

if (!message) {
return res.sendStatus(200);
}

const from = message.from;

const text = message.text?.body?.trim();
const buttonId = message.interactive?.button_reply?.id;
const listId = message.interactive?.list_reply?.id;

const msg = buttonId || listId || text || "";
console.log("📩 MENSAJE:", msg);

// ==========================
// 1. BIENVENIDA (hola / menu)
// ==========================
const lower = (text || "").toLowerCase();

if (!buttonId && !listId && ["hola", "menu", "menú"].includes(lower)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// ==========================
// 2. LEER MÁS
// ==========================
if (msg === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

// ==========================
// 3. MENÚ PRINCIPAL
// ==========================
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// ==========================
// 4. MENÚ PRINCIPAL → OPCIONES
// ==========================
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

if (msg === "CONSULTAR_PEDIDO") {
await iniciarPedido(from);
return res.sendStatus(200);
}

// ==========================
// 5. CATEGORÍAS
// ==========================
if (
msg === "CAT_FETEADOS" ||
msg === "CAT_SALAMES" ||
msg === "CAT_SALCHICHAS" ||
msg === "CAT_ESPECIALIDADES"
) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// ==========================
// 6. PRODUCTO (desde lista)
// ==========================
if (msg.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

// ==========================
// 7. FLUJO DE PEDIDO (si hay uno activo)
// ==========================
const manejado = await manejarPedido(from, msg);
if (manejado) {
return res.sendStatus(200);
}

// ==========================
// 8. FALLBACK → MENÚ PRINCIPAL
// ==========================
await sendMenuPrincipal(from);
return res.sendStatus(200);
} catch (error) {
console.error("❌ ERROR EN WEBHOOK:", error);
return res.sendStatus(500);
}
});

// ================================
// INICIAR SERVIDOR
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${PORT}`);
});

