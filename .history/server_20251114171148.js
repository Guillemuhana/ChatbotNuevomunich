import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import {
sendBienvenida,
sendDescripcionExtendida,
sendMenuPrincipal,
sendCategoriaProductos,
sendProducto,
sendCatalogo
} from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// =====================================================
// VERIFICACIÓN WEBHOOK META
// =====================================================
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

// =====================================================
// RECEPCIÓN DE MENSAJES
// =====================================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const msg =
message.text?.body ||
message.interactive?.button_reply?.id ||
message.interactive?.list_reply?.id;

console.log("🟢 MENSAJE:", msg);

// =====================================================
// INICIO Y MENÚ
// =====================================================

if (
["hola", "Hola", "menu", "Menu", "menú", "Menú", "inicio"].includes(msg)
) {
await sendBienvenida(from);
return res.sendStatus(200);
}

if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

if (msg === "LEER_MAS") {
await sendDescripcionExtendida(from);
return res.sendStatus(200);
}

// =====================================================
// MENÚ PRINCIPAL → SECCIONES DE LISTAS
// =====================================================

if (
["P_FETEADOS", "P_SALAMES", "P_SALCHICHAS", "P_ESPECIALIDADES"].includes(
msg
)
) {
await sendCategoriaProductos(from, msg);
return res.sendStatus(200);
}

// =====================================================
// PRODUCTO → Mostrar imagen
// =====================================================
if (msg?.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

// =====================================================
// SERVICIOS
// =====================================================

if (msg === "EVENTOS") {
await sendDescripcionExtendida(from);
return res.sendStatus(200);
}

if (msg === "CONSULTA_PEDIDOS") {
await sendDescripcionExtendida(from);
return res.sendStatus(200);
}

if (msg === "CATALOGO") {
await sendCatalogo(from);
return res.sendStatus(200);
}

// =====================================================
// FALLBACK
// =====================================================
await sendMenuPrincipal(from);

res.sendStatus(200);
} catch (e) {
console.log("❌ ERROR EN WEBHOOK:", e);
res.sendStatus(500);
}
});

// =====================================================
app.listen(process.env.PORT || 3000, () =>
console.log("✅ BOT LISTO → http://localhost:" + (process.env.PORT || 3000))
);
