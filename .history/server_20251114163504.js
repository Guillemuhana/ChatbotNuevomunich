import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import {
sendBienvenida,
sendDescripcionExtendida,
sendMenuPrincipal,
sendMenuProductos,
sendProducto
} from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

app.get("/webhook", (req, res) => {
if (
req.query["hub.mode"] === "subscribe" &&
req.query["hub.verify_token"] === VERIFY_TOKEN
) {
return res.status(200).send(req.query["hub.challenge"]);
}
res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const msg = entry?.messages?.[0];
if (!msg) return res.sendStatus(200);

const from = msg.from;
const text = msg.text?.body || msg.interactive?.button_reply?.id || msg.interactive?.list_reply?.id;

console.log("🟢 MENSAJE:", text);

// INICIO
if (/hola|buenas|inicio|start/i.test(text)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// LEER MÁS
if (text === "LEER_MAS") {
await sendDescripcionExtendida(from);
return res.sendStatus(200);
}

// MENÚ PRINCIPAL
if (text === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// OPCIONES DEL MENÚ PRINCIPAL
if (text === "MENU_PRODUCTOS") {
await sendMenuProductos(from);
return res.sendStatus(200);
}

if (text === "MENU_CATALOGO") {
await send({
messaging_product: "whatsapp",
to: from,
text: { body: "📕 Catálogo completo:\nhttps://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view" }
});
return;
}

if (text === "MENU_EVENTOS") {
await send({
messaging_product: "whatsapp",
to: from,
text: { body: "🚚 Nuestro servicio de Food Truck y eventos está disponible. Contanos qué necesitás!" }
});
return;
}

if (text === "MENU_PEDIDO") {
await send({
messaging_product: "whatsapp",
to: from,
text: { body: "📝 Para realizar un pedido, indicá tu *nombre*, *teléfono*, *ubicación* y el *pedido detallado*." }
});
return;
}

// PRODUCTO
if (text.startsWith("PROD_")) {
const nombre = text.replace("PROD_", "");
await sendProducto(from, nombre);
return;
}

res.sendStatus(200);
} catch (e) {
console.log("❌ ERROR EN WEBHOOK:", e);
res.sendStatus(500);
}
});

app.listen(process.env.PORT || 3000, () =>
console.log("✅ BOT LISTO en puerto " + (process.env.PORT || 3000))
);
