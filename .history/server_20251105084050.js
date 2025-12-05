// server.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import {
sendMenuPrincipal,
sendProductosMenu,
sendCategoria,
iniciarPedido,
flujoPedido
} from "./bot.js";

const app = express();
app.use(express.json());

// ✅ VERIFICACIÓN DEL WEBHOOK (PASO OBLIGATORIO)
app.get("/webhook", (req, res) => {
const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;

const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === verifyToken) {
console.log("✅ WEBHOOK VERIFICADO CORRECTAMENTE");
return res.status(200).send(challenge);
} else {
console.log("❌ TOKEN DE VERIFICACIÓN INCORRECTO");
return res.sendStatus(403);
}
});

// ✅ RECEPCIÓN DE MENSAJES (EVENTOS DE WHATSAPP)
app.post("/webhook", async (req, res) => {
try {
const entry = req.body?.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from; // Número del usuario
const text = message.text?.body;
const button = message.button?.payload;
const msg = button || text;

console.log("💬 Mensaje recibido:", msg);

if (!msg) return res.sendStatus(200);

// ✅ PALABRAS CLAVE PARA VOLVER AL MENÚ
if (["hola", "Hola", "menu", "Menu", "inicio", "Inicio"].includes(msg)) {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// ✅ PRODUCTOS
if (msg === "BTN_PRODUCTOS") {
await sendProductosMenu(from);
return res.sendStatus(200);
}

// ✅ CATEGORÍAS
if (msg.startsWith("P_")) {
await sendCategoria(from, msg);
return res.sendStatus(200);
}

// ✅ INICIAR PEDIDO
if (msg === "BTN_PEDIDO") {
await iniciarPedido(from);
return res.sendStatus(200);
}

// ✅ CONTINUAR FLUJO DEL PEDIDO
await flujoPedido(from, msg);

res.sendStatus(200);
} catch (err) {
console.log("❌ Error en webhook:", err);
res.sendStatus(500);
}
});

// ✅ INICIAR SERVIDOR
app.listen(process.env.PORT || 3000, () => {
console.log(`🚀 BOT LISTO - PUERTO ${process.env.PORT || 3000}`);
console.log(`🌍 Usa LocalTunnel para exponer el bot:`);
console.log(` lt --port 3000 --subdomain nuevomunichbot`);
});
