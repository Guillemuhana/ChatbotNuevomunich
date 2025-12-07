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

// TEST SERVER
app.get("/", (req, res) => {
  res.status(200).send("🚀 Nuevo Munich bot online!");
});

// VERIFICACIÓN WEBHOOK
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("📩 Verificación Webhook:", { mode, token, challenge });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// RECEPCIÓN DE MENSAJES
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
    console.log("📬 Mensaje recibido:", lower);

    if (["hola", "buenas", "menu", "menú", "inicio", "start"].includes(lower))
      return await sendBienvenida(from) && res.sendStatus(200);

    if (msg === "MENU_PRINCIPAL")
      return await sendMenuPrincipal(from) && res.sendStatus(200);

    if (msg === "CHAT_VENTAS")
      return await sendChatConVentas(from) && res.sendStatus(200);

    if (msg === "CAT_PRODUCTOS")
      return await sendCategoriaProductos(from) && res.sendStatus(200);

    if (["CAT_FETEADOS","CAT_SALAMES","CAT_SALCHICHAS","CAT_ESPECIALIDADES"].includes(msg))
      return await sendSubcategoria(from,msg) && res.sendStatus(200);

    if (msg === "FOOD_TRUCK")
      return await sendFoodTruck(from) && res.sendStatus(200);

    if (msg === "CATALOGO_PDF")
      return await sendCatalogoCompleto(from) && res.sendStatus(200);

    if (msg === "INICIO_PEDIDO")
      return await sendInicioPedidoOpciones(from) && res.sendStatus(200);

    if (msg.startsWith("PEDIDO_")) {
      const tipo = msg.replace("PEDIDO_", "").toLowerCase();
      return await pedirDatosDelCliente(from, tipo) && res.sendStatus(200);
    }

    if (msg.startsWith("CONFIRMAR_")) {
      const resumen = msg.replace("CONFIRMAR_", "");
      return await sendPedidoConfirmacionCliente(from, resumen) && res.sendStatus(200);
    }

    await sendRespuestaIA(from, msg);
    return res.sendStatus(200);

  } catch (err) {
    console.error("❌ ERROR WEBHOOK:", err);
    return res.sendStatus(500);
  }
});

// SERVIDOR
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor activo en puerto ${PORT}`);
});
