// server.js
import express from "express";
import bodyParser from "body-parser";
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
app.use(bodyParser.json());

// ---- Confirmación de vida ----
app.get("/", (req, res) => res.send("✅ Nuevo Munich Bot en funcionamiento"));

// ---- VERIFICACIÓN INICIAL DEL WEBHOOK ----
app.get("/webhook", (req, res) => {
try {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
return res.send(req.query["hub.challenge"]);
}
return res.sendStatus(403);
} catch (err) {
console.log("Error en verificación:", err);
return res.sendStatus(500);
}
});

// ---- RECEPCIÓN DE MENSAJES ----
app.post("/webhook", async (req, res) => {
try {
const data = req.body;

const message =
data?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body;
const button = message.button?.payload;
const msg = button || text;

console.log("💬 Mensaje recibido:", msg);

if (!msg) return res.sendStatus(200);

// ---- MENÚ PRINCIPAL ----
if (["hola", "Hola", "menu", "Menu", "MENÚ", "inicio"].includes(msg)) {
await sendMenuPrincipal(from);
}

// ---- OPCIÓN PICADAS ----
else if (msg === "BTN_PICADAS") {
await sendCategoria(from, "P_PICADAS");
}

// ---- OPCIÓN PRODUCTOS ----
else if (msg === "BTN_PRODUCTOS") {
await sendProductosMenu(from);
}

// ---- CATEGORÍAS DE PRODUCTOS ----
else if (["P_PICADAS", "P_SALCHICHAS", "P_GRILL"].includes(msg)) {
await sendCategoria(from, msg);
}

// ---- FLUJO DE PEDIDO ----
else if (msg === "BTN_PEDIDO") {
await iniciarPedido(from);
}

// ---- CONTINÚA EL PEDIDO ----
else {
await flujoPedido(from, msg);
}

res.sendStatus(200);

} catch (err) {
console.log("❌ Error procesando webhook:", err);
res.sendStatus(500);
}
});

// ---- INICIO DEL SERVIDOR ----
app.listen(3000, () =>
console.log("🚀 BOT LISTO EN http://localhost:3000 (Puerto 3000)")
);
