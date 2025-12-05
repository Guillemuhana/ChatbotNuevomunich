import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import {
sendBienvenida,
sendDescripcionExtendida,
sendMenuPrincipal,
sendProductoImagen,
sendCatalogo,
sendConsultaPedidos,
sendEventos
} from "./bot.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// =========================================
// VERIFICACIÓN DEL WEBHOOK (OBLIGATORIO)
// =========================================
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

// =========================================
// RECEPCIÓN DE MENSAJES
// =========================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body?.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msgText = message.text?.body;
const listReply = message.interactive?.list_reply?.id;
const buttonReply = message.interactive?.button_reply?.id;

// Siempre imprimimos lo que llegó
console.log("🟢 MENSAJE:", msgText || listReply || buttonReply);

// =========================================
// TRIGGER INICIAL
// =========================================
if (["hola", "Hola", "HOLA", "menu", "menú", "inicio"].includes(msgText)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// =========================================
// RESPUESTAS A LOS BOTONES
// =========================================
const ID = buttonReply || listReply;

// --- Leer más ---
if (ID === "LEER_MAS") {
await sendDescripcionExtendida(from);
return res.sendStatus(200);
}

// --- Menú Principal ---
if (ID === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// =========================================
// RESPUESTAS DEL MENÚ PRINCIPAL (LISTA)
// =========================================

// Productos → Categorías
if (ID === "PROD_feteados") {
await sendProductoImagen(from, "feteados");
return res.sendStatus(200);
}

if (ID === "PROD_salames") {
await sendProductoImagen(from, "salames");
return res.sendStatus(200);
}

if (ID === "PROD_salchichas") {
await sendProductoImagen(from, "salchichas");
return res.sendStatus(200);
}

if (ID === "PROD_especialidades") {
await sendProductoImagen(from, "especialidades");
return res.sendStatus(200);
}

// Eventos
if (ID === "SERV_eventos") {
await sendEventos(from);
return res.sendStatus(200);
}

// Consultar pedidos
if (ID === "SERV_consultas") {
await sendConsultaPedidos(from);
return res.sendStatus(200);
}

// Catálogo PDF
if (ID === "CATALOGO") {
await sendCatalogo(from);
return res.sendStatus(200);
}

// =========================================
// SI EL CLIENTE ESCRIBE CUALQUIER COSA → ENVIAMOS MENÚ
// =========================================
await sendMenuPrincipal(from);

res.sendStatus(200);
} catch (e) {
console.log("❌ ERROR EN WEBHOOK:", e);
res.sendStatus(500);
}
});

// =========================================
// SERVIDOR
// =========================================
app.listen(process.env.PORT || 3000, () => {
console.log("✅ BOT LISTO EN PUERTO", process.env.PORT || 3000);
});

