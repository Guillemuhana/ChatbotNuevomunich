// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendBienvenida,
sendLeerMas,
sendMenuPrincipal,
sendCategoriaProductos,
sendSubcategoria,
sendProducto,
sendFoodTruck,
sendConsultarPedido,
sendCatalogoCompleto,
sendRespuestaIA
} from "./bot.js";


const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ======================================================
// VERIFICACIÓN DEL WEBHOOK (GET)
// ======================================================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ WEBHOOK VERIFICADO CON META");
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
}

return res.sendStatus(400);
});

// ======================================================
// RECEPCIÓN DE MENSAJES (POST)
// ======================================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0];
const value = changes?.value;
const message = value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const type = message.type;

let msg = null;

if (type === "text") {
msg = message.text?.body;
} else if (type === "interactive") {
const interactive = message.interactive;
if (interactive.type === "button_reply") {
msg = interactive.button_reply?.id;
} else if (interactive.type === "list_reply") {
msg = interactive.list_reply?.id;
}
}

if (!msg) return res.sendStatus(200);

const lower = msg.toLowerCase();

// 1 — SALUDOS → BIENVENIDA
if (
lower === "hola" ||
lower === "hola!" ||
lower === "buenas" ||
lower === "menu" ||
lower === "menú" ||
lower === "menu principal" ||
lower === "menú principal"
) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// 2 — LEER MÁS
if (msg === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

// 3 — MENÚ PRINCIPAL
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// 4 — PRODUCTOS
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// 5 — SUBCATEGORÍAS
if (
msg === "CAT_FETEADOS" ||
msg === "CAT_SALAMES" ||
msg === "CAT_SALCHICHAS" ||
msg === "CAT_ESPECIALIDADES"
) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// 6 — PRODUCTO DIRECTO
if (msg.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

// 7 — FOOD TRUCK
if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

// 8 — CONSULTAR PEDIDO
if (msg === "CONSULTAR_PEDIDO") {
await sendConsultarPedido(from);
return res.sendStatus(200);
}

// 9 — CATÁLOGO PDF
if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

// 10 — CUALQUIER OTRA COSA → IA
await sendRespuestaIA(from, msg);

return res.sendStatus(200);

} catch (err) {
console.error("❌ ERROR EN WEBHOOK:", err.response?.data || err);
return res.sendStatus(500);
}
});

// ======================================================
// INICIAR SERVIDOR
// ======================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${PORT}`);
});

