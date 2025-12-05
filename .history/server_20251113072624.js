import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import {
sendBienvenida,
sendDescripcionExtendida,
sendMenuPrincipal,
sendCategorias,
sendProductosDeCategoria,
sendProducto
} from "./bot.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY = process.env.WEBHOOK_VERIFY_TOKEN;

// ------------------------------------
// VERIFICACIÓN
// ------------------------------------
app.get("/webhook", (req, res) => {
if (
req.query["hub.mode"] === "subscribe" &&
req.query["hub.verify_token"] === VERIFY
) {
return res.status(200).send(req.query["hub.challenge"]);
}
res.sendStatus(403);
});

// ------------------------------------
// RECEPCIÓN MENSAJES
// ------------------------------------
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.text?.body || message.interactive?.button_reply?.id;

console.log("MENSAJE:", msg);

// INICIO
if (["hola", "Hola", "inicio", "menu"].includes(msg)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// LEER MÁS
if (msg === "LEER_MAS") {
await sendDescripcionExtendida(from);
return res.sendStatus(200);
}

// MENU PRINCIPAL
if (msg === "MENÚ PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// BOTONES
if (msg === "BTN_PRODUCTOS") return await sendCategorias(from);
if (msg === "BTN_EVENTOS") {
return await send({
messaging_product: "whatsapp",
to: from,
text: { body: "Podés consultar opciones de catering y eventos escribiendo aquí 😊" }
});
}
if (msg === "BTN_PEDIDO") {
return await send({
messaging_product: "whatsapp",
to: from,
text: { body: "Contame qué te gustaría pedir y te ayudo 😊" }
});
}

// CATEGORÍAS
if (msg?.startsWith("CAT_")) {
await sendProductosDeCategoria(from, msg);
return res.sendStatus(200);
}

// PRODUCTO
if (msg?.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

// DEFAULT
await sendBienvenida(from);

res.sendStatus(200);
} catch (err) {
console.log("ERROR WEBHOOK:", err);
res.sendStatus(500);
}
});

app.listen(process.env.PORT || 3000, () =>
console.log("BOT LISTO → http://localhost:3000")
);

