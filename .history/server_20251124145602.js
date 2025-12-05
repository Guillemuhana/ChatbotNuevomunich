// server.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import {
sendBienvenida,
sendLeerMas,
sendMenuPrincipal,
sendCategoriaProductos,
sendSubcategoria,
sendFoodTruck,
sendCatalogoCompleto,
sendRespuestaIA,
sendInicioPedidoOpciones,
VENTAS_PHONE
} from "./bot.js";

const app = express();
app.use(express.json());

/* ======================================================
WEBHOOK GET (verificación)
====================================================== */
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token === process.env.VERIFY_TOKEN) {
return res.status(200).send(challenge);
}

res.sendStatus(403);
});

/* ======================================================
WEBHOOK POST (mensajes entrantes)
====================================================== */
app.post("/webhook", async (req, res) => {
const entry = req.body.entry?.[0];
const change = entry?.changes?.[0];
const message = change?.value?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body || "";
const type = message.type;

// BOTONES Y LISTAS
if (type === "interactive") {
const id = message.interactive?.button_reply?.id ||
message.interactive?.list_reply?.id;

switch (id) {
case "LEER_MAS": return await sendLeerMas(from);
case "MENU_PRINCIPAL": return await sendMenuPrincipal(from);
case "CAT_PRODUCTOS": return await sendCategoriaProductos(from);
case "CATALOGO_PDF": return await sendCatalogoCompleto(from);
case "FOOD_TRUCK": return await sendFoodTruck(from);
case "INICIO_PEDIDO": return await sendInicioPedidoOpciones(from);

case "CAT_FETEADOS":
case "CAT_SALAMES":
case "CAT_SALCHICHAS":
case "CAT_ESPECIALIDADES":
return await sendSubcategoria(from, id);

default:
return await sendRespuestaIA(from, id);
}
}

// TEXTO NORMAL → IA
await sendRespuestaIA(from, text);

res.sendStatus(200);
});

/* ======================================================
INICIAR SERVER
====================================================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
console.log("🔥 BOT NUEVO MUNICH funcionando en puerto " + PORT)
);

