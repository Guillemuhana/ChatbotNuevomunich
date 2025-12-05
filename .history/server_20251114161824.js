import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendBienvenida,
sendDescripcionAmpliada,
sendMenuPrincipal,
sendProductosDeCategoria,
sendProductoImagen,
sendCatalogoInfo,
sendEventosInfo,
sendContactoInfo,
iniciarPedido,
flujoPedido,
confirmarPedido,
sessions,
replyIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// =============================
// VERIFICACIÓN WEBHOOK
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
// RECEPCIÓN DE MENSAJES
// =============================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body;
const btnId = message.interactive?.button_reply?.id;
const listId = message.interactive?.list_reply?.id;

const msg = text || btnId || listId || "";

console.log("📩 MENSAJE:", msg);

// SALUDO / INICIO
if (["hola", "Hola", "menu", "Menu", "menú", "Menú", "inicio", "Inicio"].includes(msg)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// LEER MÁS
if (msg === "LEER_MAS") {
await sendDescripcionAmpliada(from);
return res.sendStatus(200);
}

// MENÚ PRINCIPAL
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// MANEJO DE MENÚ PRINCIPAL (LISTAS)
switch (msg) {
case "CAT_FETEADOS":
await sendProductosDeCategoria(from, "FETEADOS");
return res.sendStatus(200);
case "CAT_SALAMES":
await sendProductosDeCategoria(from, "SALAMES");
return res.sendStatus(200);
case "CAT_SALCHICHAS":
await sendProductosDeCategoria(from, "SALCHICHAS");
return res.sendStatus(200);
case "CAT_ESPECIALIDADES":
await sendProductosDeCategoria(from, "ESPECIALIDADES");
return res.sendStatus(200);
case "CAT_CATALOGO":
await sendCatalogoInfo(from);
return res.sendStatus(200);
case "CAT_EVENTOS":
await sendEventosInfo(from);
return res.sendStatus(200);
case "CAT_CONTACTO":
await sendContactoInfo(from);
return res.sendStatus(200);
case "CAT_PEDIDOS":
await iniciarPedido(from);
return res.sendStatus(200);
default:
break;
}

// SELECCIÓN DE PRODUCTO
if (msg.startsWith("PROD_")) {
await sendProductoImagen(from, msg);
return res.sendStatus(200);
}

// CONFIRMACIÓN DE PEDIDO
if (msg === "PEDIDO_OK" || msg === "PEDIDO_CANCEL") {
await confirmarPedido(from, msg);
return res.sendStatus(200);
}

// SI HAY UN PEDIDO EN CURSO → SEGUIR FLUJO
if (sessions.has(from)) {
await flujoPedido(from, msg);
return res.sendStatus(200);
}

// SI NO ES NINGUNA OPCIÓN → IA
await replyIA(from, msg);
res.sendStatus(200);
} catch (err) {
console.log("❌ ERROR EN WEBHOOK:", err.response?.data || err);
res.sendStatus(500);
}
});

// =============================
app.listen(process.env.PORT || 3000, () => {
console.log(
"🚀 BOT NUEVO MUNICH LISTO → http://localhost:" + (process.env.PORT || 3000)
);
});