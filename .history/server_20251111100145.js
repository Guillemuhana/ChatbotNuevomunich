import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import {
send,
sendMenuPrincipal,
sendProductosMenu,
sendCategoriaDetalle,
iniciarPedido,
flujoPedido,
replyIA,
sessions
} from "./bot.js";

import { IMAGENES } from "./imagenes.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// =============================================================
// ✅ VERIFICACIÓN WEBHOOK (META / WHATSAPP)
// =============================================================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
});

// =============================================================
// ✅ RECEPCIÓN DE MENSAJES
// =============================================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.text?.body || message.interactive?.button_reply?.id;

console.log("🟢 MENSAJE:", msg);

// =============================================================
// 💬 MENSAJE / SALUDO INICIAL
// =============================================================
if (msg?.toLowerCase() === "hola" || msg?.toLowerCase() === "menu" || msg?.toLowerCase() === "menú") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// =============================================================
// 📌 BOTONES DEL MENÚ PRINCIPAL
// =============================================================

if (msg === "BTN_PRODUCTOS") return await sendProductosMenu(from);

if (msg === "BTN_EVENTOS")
return await replyIA(from,
"✨ *Eventos & Catering*\nContamos con tablas gourmet, picadas premium y servicio personalizado.\n\n¿Para cuántas personas sería el evento?"
);

if (msg === "BTN_PEDIDO") return await iniciarPedido(from);

// =============================================================
// 🥓 CATEGORÍAS DE PRODUCTOS
// =============================================================
if (["CAT_FETEADOS", "CAT_SALAMES", "CAT_SALCHICHAS"].includes(msg)) {
await sendCategoriaDetalle(from, msg);
return res.sendStatus(200);
}

// =============================================================
// 📝 FLUJO DE PEDIDO (MULTI PASO)
// =============================================================
if (sessions.has(from)) {
await flujoPedido(from, msg);
return res.sendStatus(200);
}

// =============================================================
// 🖼️ DETECCIÓN AUTOMÁTICA DE PRODUCTO + FOTO + CATÁLOGO
// =============================================================
if (typeof msg === "string") {
const producto = Object.keys(IMAGENES).find(nombre =>
msg.toLowerCase().includes(nombre.toLowerCase())
);

if (producto) {
// 1) Enviar imagen
await send({
messaging_product: "whatsapp",
to: from,
type: "image",
image: { link: IMAGENES[producto] }
});

// 2) Respuesta gourmet IA
await replyIA(from, `Contame sobre ${producto}`);

// 3) Catálogo automático ✅
await send({
messaging_product: "whatsapp",
to: from,
text: { body: `📄 *Catálogo Completo:* ${process.env.CATALOG_URL}` }
});

return res.sendStatus(200);
}
}

// =============================================================
// 🤖 RESPUESTA IA GENERAL
// =============================================================
await replyIA(from, msg);
res.sendStatus(200);

} catch (error) {
console.log("❌ ERROR WEBHOOK:", error);
res.sendStatus(500);
}
});

// =============================================================
// 🚀 INICIO SERVIDOR
// =============================================================
app.listen(process.env.PORT || 3000, () =>
console.log("✅ BOT LISTO → http://localhost:" + (process.env.PORT || 3000))
);