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
sessions,
ultimoProducto
} from "./bot.js";

import { IMAGENES, DESCRIPCIONES } from "./imagenes.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === VERIFY_TOKEN)
return res.send(req.query["hub.challenge"]);
res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg = message.text?.body || message.interactive?.button_reply?.id || message.interactive?.list_reply?.id;

// Saludo inicial humano
if (["hola","holaa","buenas","buen día","buenos dias"].includes(msg?.toLowerCase())) {
await send({
messaging_product: "whatsapp",
to: from,
text: { body:
`¡Hola! 😊 Bienvenido/a a *Nuevo Munich* 🥨
*Artesanos del sabor desde 1972.*

Decime qué estás buscando hoy 👇
• Productos
• Picadas & Eventos
• Hacer Pedido

O cuando quieras:
👉 Menú principal`
}
});
return res.sendStatus(200);
}

if (["menu","menú","menu principal","menú principal"].includes(msg?.toLowerCase())) {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

if (msg === "LEER_MAS") {
await send({
messaging_product: "whatsapp",
to: from,
text: { body:
`🥨 *Nuevo Munich*
Artesanos del Sabor desde 1972.

Elaboración propia con métodos centroeuropeos tradicionales.
Calidad que se siente en cada bocado.` }
});
return res.sendStatus(200);
}

if (msg === "BTN_PRODUCTOS") return sendProductosMenu(from);
if (["CAT_FETEADOS","CAT_SALAMES","CAT_SALCHICHAS"].includes(msg)) return sendCategoriaDetalle(from, msg);

if (msg === "BTN_EVENTOS") {
await send({ messaging_product: "whatsapp", to: from, text: { body: "✨ Tablas y picadas premium.\n¿Para cuántas personas sería?" }});
return res.sendStatus(200);
}

if (msg === "BTN_PEDIDO") return iniciarPedido(from);

// Producto → Imagen + descripción
if (msg?.startsWith("PROD_")) {
const p = msg.replace("PROD_","");
ultimoProducto.set(from, p);

await send({ messaging_product: "whatsapp", to: from, type: "image", image: { link: IMAGENES[p] }});
await send({
messaging_product: "whatsapp",
to: from,
text: { body: `🥨 *${p}*\n${DESCRIPCIONES[p]}\n\nSi querés, te lo agrego al pedido 📝` }
});
return res.sendStatus(200);
}

// "Sí / dale / agregalo" → sumar al pedido
if (["si","sí","dale","ok","agregalo","sumalo"].includes(msg?.toLowerCase())) {
const p = ultimoProducto.get(from);
if (p) {
await iniciarPedido(from);
sessions.get(from).data.item = p;
sessions.get(from).paso = "CANTIDAD";
await send({ messaging_product: "whatsapp", to: from, text: { body: `Perfecto 😄 ¿Qué cantidad de *${p}* querés?` }});
return res.sendStatus(200);
}
}

// Si está en flujo de pedido → continuar
if (sessions.has(from)) {
await flujoPedido(from, msg);
return res.sendStatus(200);
}

// Si nada aplica → IA
await replyIA(from, msg);
return res.sendStatus(200);

} catch (e) {
console.log("❌ ERROR:", e);
res.sendStatus(500);
}
});

app.listen(process.env.PORT || 3000, () =>
console.log("✅ BOT LISTO → http://localhost:" + (process.env.PORT || 3000))
);

