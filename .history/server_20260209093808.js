import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

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

dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// =======================
// ROOT
// =======================
app.get("/", (req, res) => {
  res.status(200).send("OK - Chatbot Nuevo Munich ONLINE");
});

// =======================
// HEALTH CHECK (Railway)
// =======================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// =======================
// WEBHOOK VERIFY (META)
// =======================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// =======================
// WEBHOOK RECEIVE
// =======================
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from;
    const type = message.type;

    let msg = null;

    if (type === "text") msg = message.text?.body;
    if (type === "interactive") {
      if (message.interactive.button_reply)
        msg = message.interactive.button_reply.id;
      if (message.interactive.list_reply)
        msg = message.interactive.list_reply.id;
    }

    if (!msg) return res.sendStatus(200);

    const lower = msg.toLowerCase();
    console.log("📩 Mensaje:", lower);

    if (["hola", "menu", "menú", "inicio", "start"].includes(lower)) {
      await sendBienvenida(from);
    } else if (msg === "MENU_PRINCIPAL") {
      await sendMenuPrincipal(from);
    } else if (msg === "CHAT_VENTAS") {
      await sendChatConVentas(from);
    } else if (msg === "CAT_PRODUCTOS") {
      await sendCategoriaProductos(from);
    } else if (
      ["CAT_FETEADOS", "CAT_SALAMES", "CAT_SALCHICHAS", "CAT_ESPECIALIDADES"].includes(msg)
    ) {
      await sendSubcategoria(from, msg);
    } else if (msg === "FOOD_TRUCK") {
      await sendFoodTruck(from);
    } else if (msg === "CATALOGO_PDF") {
      await sendCatalogoCompleto(from);
    } else if (msg === "INICIO_PEDIDO") {
      await sendInicioPedidoOpciones(from);
    } else if (msg.startsWith("PEDIDO_")) {
      await pedirDatosDelCliente(from, msg.replace("PEDIDO_", "").toLowerCase());
    } else if (msg.startsWith("CONFIRMAR_")) {
      await sendPedidoConfirmacionCliente(from, msg.replace("CONFIRMAR_", ""));
    } else {
      await sendRespuestaIA(from, msg);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("🔥 WEBHOOK ERROR:", err);
    res.sendStatus(500);
  }
});

// =======================
// SAFETY NET
// =======================
process.on("unhandledRejection", err => console.error(err));
process.on("uncaughtException", err => console.error(err));

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("=== SERVER FILE LOADED ===");
  console.log("🚀 Server running on port " + PORT);
});
