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

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// TEST SERVER ROOT
app.get("/", (req, res) => {
  console.log("🌐 GET / TEST SERVER OK");
  res.status(200).send("🚀 Bot Nuevo Munich ONLINE!");
});

// WEBHOOK VERIFICATION
app.get("/webhook", (req, res) => {
  console.log("🔍 GET /webhook VERIFICATION");
  console.log("QUERY:", req.query);

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("🟢 Webhook Verified OK");
    return res.status(200).send(challenge);
  }

  console.log("❌ Verification Failed");
  return res.sendStatus(403);
});

// RECEIVE WHATSAPP MESSAGES
app.post("/webhook", async (req, res) => {
  console.log("📩 POST /webhook ENTRY");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message) {
      console.log("⚪ No messages in POST");
      return res.sendStatus(200);
    }

    const from = message.from;
    let msg;

    if (message.type === "text") {
      msg = message.text.body;
    } else if (message.type === "interactive") {
      const inter = message.interactive;
      msg = inter.button_reply?.id || inter.list_reply?.id;
    }

    if (!msg) {
      console.log("⚠️ Unknown message format");
      return res.sendStatus(200);
    }

    msg = msg.toLowerCase();
    console.log("👉 User says:", msg);

    if (["hola", "buenas", "menu", "menú", "inicio", "start"].includes(msg)) {
      await sendBienvenida(from);
      return res.sendStatus(200);
    }

    if (msg === "menu_principal") return sendMenuPrincipal(from).then(() => res.sendStatus(200));
    if (msg === "chat_ventas") return sendChatConVentas(from).then(() => res.sendStatus(200));
    if (msg === "cat_productos") return sendCategoriaProductos(from).then(() => res.sendStatus(200));
    if (["cat_feteados","cat_salames","cat_salchichas","cat_especialidades"].includes(msg))
      return sendSubcategoria(from, msg.toUpperCase()).then(() => res.sendStatus(200));
    if (msg === "food_truck") return sendFoodTruck(from).then(() => res.sendStatus(200));
    if (msg === "catalogo_pdf") return sendCatalogoCompleto(from).then(() => res.sendStatus(200));
    if (msg === "inicio_pedido") return sendInicioPedidoOpciones(from).then(() => res.sendStatus(200));
    if (msg.startsWith("pedido_")) return pedirDatosDelCliente(from, msg.replace("pedido_", "")).then(() => res.sendStatus(200));
    if (msg.startsWith("confirmar_")) return sendPedidoConfirmacionCliente(from, msg.replace("confirmar_", "")).then(() => res.sendStatus(200));

    await sendRespuestaIA(from, msg);
    return res.sendStatus(200);

  } catch (err) {
    console.error("🔥 WEBHOOK ERROR:", err);
    return res.sendStatus(200);
  }
});

// SERVER LISTEN
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor activo en puerto ${PORT}`);
});
