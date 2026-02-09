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
app.use(bodyParser.json());

// ================== HEALTH CHECK ==================
app.get("/", (req, res) => {
  res.status(200).send("🚀 Nuevo Munich bot ONLINE");
});

// ================== WEBHOOK VERIFY ==================
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

// ================== WEBHOOK RECEIVER ==================
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
      const inter = message.interactive;
      if (inter.type === "button_reply") msg = inter.button_reply.id;
      if (inter.type === "list_reply") msg = inter.list_reply.id;
    }

    if (!msg) return res.sendStatus(200);

    const lower = msg.toLowerCase();
    console.log("📩 Mensaje recibido:", lower);

    if (["hola", "buenas", "menu", "menú", "inicio", "start"].includes(lower)) {
      await sendBienvenida(from);
      return res.sendStatus(200);
    }

    if (msg === "MENU_PRINCIPAL") return sendMenuPrincipal(from), res.sendStatus(200);
    if (msg === "CHAT_VENTAS") return sendChatConVentas(from), res.sendStatus(200);
    if (msg === "CAT_PRODUCTOS") return sendCategoriaProductos(from), res.sendStatus(200);

    if (["CAT_FETEADOS", "CAT_SALAMES", "CAT_SALCHICHAS", "CAT_ESPECIALIDADES"].includes(msg)) {
      await sendSubcategoria(from, msg);
      return res.sendStatus(200);
    }

    if (msg === "FOOD_TRUCK") return sendFoodTruck(from), res.sendStatus(200);
    if (msg === "CATALOGO_PDF") return sendCatalogoCompleto(from), res.sendStatus(200);
    if (msg === "INICIO_PEDIDO") return sendInicioPedidoOpciones(from), res.sendStatus(200);

    if (msg.startsWith("PEDIDO_")) {
      await pedirDatosDelCliente(from, msg.replace("PEDIDO_", "").toLowerCase());
      return res.sendStatus(200);
    }

    if (msg.startsWith("CONFIRMAR_")) {
      await sendPedidoConfirmacionCliente(from, msg.replace("CONFIRMAR_", ""));
      return res.sendStatus(200);
    }

    await sendRespuestaIA(from, msg);
    return res.sendStatus(200);

  } catch (err) {
    console.error("🔥 ERROR WEBHOOK:", err);
    return res.sendStatus(500);
  }
});

// ================== GLOBAL SAFETY ==================
process.on("uncaughtException", err => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", err => {
  console.error("UNHANDLED REJECTION:", err);
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

console.log("=== SERVER FILE LOADED ===");
