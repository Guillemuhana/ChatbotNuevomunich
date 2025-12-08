import express from "express";
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
app.use(express.json()); // ✔️ Necesario para Webhook Meta

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// TEST PARA RAILWAY
app.get("/", (req, res) => {
  res.send("💡 Bot Nuevo Munich ONLINE!");
});

// 🔹 VERIFICACIÓN WEBHOOK META
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("👉 Verificación Meta:", mode, token);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.status(403).send("Verificación fallida");
});

// 🔹 RECEPCIÓN DE MENSAJES
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    res.sendStatus(200);

    if (!message) return;

    const from = message.from;
    let msg;

    if (message.type === "text") msg = message.text.body;
    if (message.type === "interactive") {
      const inter = message.interactive;
      if (inter.type === "button_reply") msg = inter.button_reply.id;
      if (inter.type === "list_reply") msg = inter.list_reply.id;
    }

    if (!msg) return;

    console.log("📩 Recibido:", msg);

    const lower = msg.toLowerCase();

    if (["hola", "menu", "inicio", "start", "buenas"].includes(lower)) {
      return await sendBienvenida(from);
    }

    if (msg === "MENU_PRINCIPAL") return await sendMenuPrincipal(from);
    if (msg === "CHAT_VENTAS") return await sendChatConVentas(from);
    if (msg === "CAT_PRODUCTOS") return await sendCategoriaProductos(from);

    if (
      ["CAT_FETEADOS", "CAT_SALAMES", "CAT_SALCHICHAS", "CAT_ESPECIALIDADES"]
        .includes(msg)
    ) {
      return await sendSubcategoria(from, msg);
    }

    if (msg === "FOOD_TRUCK") return await sendFoodTruck(from);
    if (msg === "CATALOGO_PDF") return await sendCatalogoCompleto(from);
    if (msg === "INICIO_PEDIDO") return await sendInicioPedidoOpciones(from);

    if (msg.startsWith("PEDIDO_")) {
      const tipo = msg.replace("PEDIDO_", "").toLowerCase();
      return await pedirDatosDelCliente(from, tipo);
    }

    if (msg.startsWith("CONFIRMAR_")) {
      const resumen = msg.replace("CONFIRMAR_", "");
      return await sendPedidoConfirmacionCliente(from, resumen);
    }

    return await sendRespuestaIA(from, msg);

  } catch (err) {
    console.error("🔥 ERROR:", err);
  }
});

// SERVIDOR RAILWAY
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Servidor vivo en puerto ${PORT}`)
);
