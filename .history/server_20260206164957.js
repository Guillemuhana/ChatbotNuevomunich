import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
  sendBienvenida,
  sendMenuPrincipal,
  sendCategoriaProductos,
  sendSubcategoria,
  sendFoodTruck,
  sendCatalogoCompleto,
  sendInicioPedidoOpciones,
  pedirDatosDelCliente,
  sendPedidoConfirmacionCliente,
  sendChatConVentas,
  sendRespuestaIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).send("?? Nuevo Munich bot ONLINE");
});

// ================= WEBHOOK VERIFY =================
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// ================= WEBHOOK RECEIVE =================
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    let msg = null;

    if (message.type === "text") msg = message.text.body;
    if (message.type === "interactive") {
      const i = message.interactive;
      if (i.type === "button_reply") msg = i.button_reply.id;
      if (i.type === "list_reply") msg = i.list_reply.id;
    }

    if (!msg) return res.sendStatus(200);
    const lower = msg.toLowerCase();

    if (["hola","menu","inicio","start"].includes(lower)) return sendBienvenida(from), res.sendStatus(200);
    if (msg === "MENU_PRINCIPAL") return sendMenuPrincipal(from), res.sendStatus(200);
    if (msg === "CHAT_VENTAS") return sendChatConVentas(from), res.sendStatus(200);
    if (msg === "CAT_PRODUCTOS") return sendCategoriaProductos(from), res.sendStatus(200);
    if (["CAT_FETEADOS","CAT_SALAMES","CAT_SALCHICHAS","CAT_ESPECIALIDADES"].includes(msg))
      return sendSubcategoria(from, msg), res.sendStatus(200);
    if (msg === "FOOD_TRUCK") return sendFoodTruck(from), res.sendStatus(200);
    if (msg === "CATALOGO_PDF") return sendCatalogoCompleto(from), res.sendStatus(200);
    if (msg === "INICIO_PEDIDO") return sendInicioPedidoOpciones(from), res.sendStatus(200);
    if (msg.startsWith("PEDIDO_")) return pedirDatosDelCliente(from, msg), res.sendStatus(200);
    if (msg.startsWith("CONFIRMAR_")) return sendPedidoConfirmacionCliente(from, msg), res.sendStatus(200);

    await sendRespuestaIA(from, msg);
    res.sendStatus(200);

  } catch (err) {
    console.error("?? WEBHOOK ERROR:", err);
    res.sendStatus(500);
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`?? Server running on port ${PORT}`);
});

// ================= SAFETY NET =================
process.on("uncaughtException", err => console.error("UNCAUGHT:", err));
process.on("unhandledRejection", err => console.error("UNHANDLED:", err));
