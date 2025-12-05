import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import {
sendBienvenida,
sendLeerMas,
sendMenuPrincipal,
sendMenuProductos,
sendProductoImagen,
iniciarConsulta,
flujoConsulta,
sessions
} from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ============= VERIFICACIÓN =============
app.get("/webhook", (req, res) => {
if (
req.query["hub.mode"] === "subscribe" &&
req.query["hub.verify_token"] === VERIFY_TOKEN
) {
return res.status(200).send(req.query["hub.challenge"]);
}
res.sendStatus(403);
});

// ============= RECEPCIÓN MENSAJES =============
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const msg = entry?.messages?.[0];
if (!msg) return res.sendStatus(200);

const from = msg.from;
const text = msg.text?.body;
const button = msg?.interactive?.button_reply?.id;
const list = msg?.interactive?.list_reply?.id;

const mensaje = button || list || text || "";

console.log("📩 MENSAJE:", mensaje);

// INICIO
if (/hola|menú|menu|inicio/i.test(mensaje)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// LEER MAS
if (mensaje === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

// MENÚ PRINCIPAL
if (mensaje === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// PRODUCTOS
if (mensaje === "MENU_PRODUCTOS") {
await sendMenuProductos(from);
return res.sendStatus(200);
}

if (mensaje.startsWith("PROD_")) {
const clave = mensaje.replace("PROD_", "");
await sendProductoImagen(from, clave);
return res.sendStatus(200);
}

// CONSULTA DE INTERÉS
if (mensaje === "CONSULTA") {
await iniciarConsulta(from);
return res.sendStatus(200);
}

// FLUJO DE CONSULTA
const session = sessions.get(from);
if (session?.step) {
await flujoConsulta(from, mensaje);
return res.sendStatus(200);
}

// DEFAULT
await sendBienvenida(from);
return res.sendStatus(200);

} catch (err) {
console.log("❌ ERROR EN WEBHOOK:", err);
return res.sendStatus(500);
}
});

// ============= SERVER RUNNING =============
app.listen(process.env.PORT || 3000, () =>
console.log("🚀 Servidor listo en puerto " + (process.env.PORT || 3000))
);

