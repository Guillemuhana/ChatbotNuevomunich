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
sendCatalogoCompleto,
sendRespuestaIA,
sendInicioPedido
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

/* ======================================================
VERIFICACIÓN (GET)
====================================================== */
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
}
return res.sendStatus(400);
});

/* ======================================================
RECEPCIÓN DE MENSAJES
====================================================== */
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

if (type === "text") msg = message.text?.body;
if (type === "interactive") {
const interactive = message.interactive;
if (interactive.type === "button_reply") msg = interactive.button_reply.id;
if (interactive.type === "list_reply") msg = interactive.list_reply.id;
}

const lower = msg?.toLowerCase() || "";

/* SALUDOS */
if (["hola", "buenas", "menú", "menu"].includes(lower)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

if (msg === "LEER_MAS") return (await sendLeerMas(from), res.sendStatus(200));

if (msg === "MENU_PRINCIPAL") return (await sendMenuPrincipal(from), res.sendStatus(200));

/* PRODUCTOS */
if (msg === "CAT_PRODUCTOS") return (await sendCategoriaProductos(from), res.sendStatus(200));

if (
msg === "CAT_FETEADOS" ||
msg === "CAT_SALAMES" ||
msg === "CAT_SALCHICHAS" ||
msg === "CAT_ESPECIALIDADES"
) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

/* INICIO PEDIDO */
if (msg === "INICIO_PEDIDO") {
await sendInicioPedido(from);
return res.sendStatus(200);
}

/* EVENTOS */
if (msg === "FOOD_TRUCK") return (await sendFoodTruck(from), res.sendStatus(200));

/* CATÁLOGO */
if (msg === "CATALOGO_PDF") return (await sendCatalogoCompleto(from), res.sendStatus(200));

/* IA */
await sendRespuestaIA(from, msg);
res.sendStatus(200);
} catch (err) {
console.error("❌ ERROR EN WEBHOOK:", err.response?.data || err);
return res.sendStatus(500);
}
});

/* ======================================================
INICIAR SERVIDOR
====================================================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`✅ BOT LISTO: http://localhost:${PORT}`));
