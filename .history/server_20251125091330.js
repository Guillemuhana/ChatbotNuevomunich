import express from "express";
import dotenv from "dotenv";
dotenv.config();

import {
sendBienvenida,
sendMenuPrincipal,
sendLeerMas,
sendCategoriaProductos,
sendSubcategoria,
sendProducto,
sendFoodTruck,
sendCatalogoCompleto,
sendRespuestaIA,
sendIniciarPedido // ✅ ESTA SÍ EXISTE
} from "./bot.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
res.send("BOT LISTO 🚀");
});

app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0];
const changes = entry?.changes?.[0]?.value;
const messages = changes?.messages?.[0];

if (!messages) return res.sendStatus(200);

const from = messages.from;
const msgBody = messages.text?.body || "";

// BOTONES Y MENÚ
const btn = messages.button?.payload;
const list = messages.interactive?.list_reply?.id;

if (btn === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

if (btn === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

if (btn === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// LISTA → CATEGORÍAS
if (list?.startsWith("CAT_")) {
await sendSubcategoria(from, list);
return res.sendStatus(200);
}

// PEDIDOS
if (btn === "REALIZAR_PEDIDO") {
await sendIniciarPedido(from);
return res.sendStatus(200);
}

// Texto → IA
await sendRespuestaIA(from, msgBody);

return res.sendStatus(200);
} catch (e) {
console.error("❌ ERROR SERVER:", e);
return res.sendStatus(500);
}
});

// Verificación del webhook
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token === process.env.VERIFY_TOKEN) {
return res.status(200).send(challenge);
}
res.sendStatus(403);
});

app.listen(3000, () => console.log("✅ BOT LISTO: http://localhost:3000"));