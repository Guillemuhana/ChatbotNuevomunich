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

// Token de verificación (igual al que pusiste en Meta)
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// TEST
app.get("/", (req, res) => {
  return res.status(200).send("🚀 Nuevo Munich bot online!");
});

// ✔️ VERIFICACIÓN WEBHOOK META
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("📩 Verificando Webhook:", { mode, token, challenge });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✔️ Token correcto! Enviando challenge");
    return res.status(200).send(challenge);
  }

  console.log("❌ Token incorrecto");
  return res.sendStatus(403);
});

// ✔️ MENSAJES ENTRANTES WHATSAPP
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const type = message.type;
    let msg;

    if (type === "text") msg = message.text.body;
    if (type === "interactive") {
      const inter = message.interactive;
      msg = inter.button_reply?.id || inter.list_reply?.id;
    }

    if (!msg) return res.sendStatus(200);

    const lower = msg.toLowerCase();
    console.log("📬 Recibido:", lower);

    if (["hola", "buenas", "menu", "menú", "inicio"].includes(lower)) {
      await sendBienvenida(from);
    } else if (msg === "MENU_PRINCIPAL") await sendMenuPrincipal(from);
    else if (msg === "CHAT_VENTAS") await sendChatConVentas(from);
    else if (msg === "CAT_PRODUCTOS") await sendCategoriaProductos(from);
    else if (["CAT_FETEADOS", "CAT_SALAMES", "CAT_SALCHICHAS", "CAT_ESPECIALIDADES"].includes(msg))
      await sendSubcategoria(from, msg);
    else if (msg === "FOOD_TRUCK") await sendFoodTruck(from);
    else if (msg === "CATALOGO_PDF") await sendCatalogoCompleto(from);
    else if (msg === "INICIO_PEDIDO") await sendInicioPedidoOpciones(from);
    else if (msg.startsWith("PEDIDO_"))
      await pedirDatosDelCliente(from, msg.replace("PEDIDO_", "").toLowerCase());
    else if (msg.startsWith("CONFIRMAR_"))
      await sendPedidoConfirmacionCliente(from, msg.replace("CONFIRMAR_", ""));
    else
      await sendRespuestaIA(from, msg);

    return res.sendStatus(200);

  } catch (err) {
    console.error("❌ ERROR WEBHOOK:", err);
    return res.sendStatus(500);
  }
});

// 🚀 SERVIDOR EN RAILWAY
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor escuchando en puerto ${PORT}`);
});
