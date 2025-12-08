// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

// 👇 IMPORTA TODA LA LÓGICA DEL BOT (como ya la tenías)
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
  sendRespuestaIA,
} from "./bot.js";

const app = express();

// Middleware para parsear JSON
app.use(bodyParser.json());

// 🔐 Token para verificar el webhook (deben coincidir Meta y Railway)
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ✅ Endpoint de prueba
app.get("/", (req, res) => {
  res
    .status(200)
    .send("🚀 Nuevo Munich bot online (server.js con lógica completa)!");
});

// ✅ VERIFICACIÓN DEL WEBHOOK (GET /webhook) – usado SOLO por Meta al conectar
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("🔎 Verificación Webhook:", {
    mode,
    token,
    challenge,
    VERIFY_TOKEN_ENV: VERIFY_TOKEN,
  });

  // Si falta algo, devolvemos 400
  if (!mode || !token) {
    console.log("❌ Faltan parámetros en la verificación");
    return res.sendStatus(400);
  }

  // Si todo coincide, devolvemos el challenge
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado correctamente");
    return res.status(200).send(challenge);
  }

  console.log("❌ Token de verificación incorrecto");
  return res.sendStatus(403);
});

// ✅ RECEPCIÓN DE MENSAJES (POST /webhook) – WhatsApp manda acá los mensajes
app.post("/webhook", async (req, res) => {
  try {
    console.log("📥 POST /webhook BODY:", JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    // Meta manda muchas notificaciones, a veces sin mensajes
    if (!message) {
      console.log("ℹ Sin mensaje de usuario, solo evento de estado.");
      return res.sendStatus(200);
    }

    const from = message.from; // número del usuario
    const type = message.type; // "text", "interactive", etc.

    let msg = null;

    if (type === "text") {
      msg = message.text?.body;
    }

    if (type === "interactive") {
      const inter = message.interactive;
      if (inter.type === "button_reply") msg = inter.button_reply.id;
      if (inter.type === "list_reply") msg = inter.list_reply.id;
    }

    if (!msg) {
      console.log("ℹ Mensaje sin texto interpretable:", message);
      return res.sendStatus(200);
    }

    const lower = msg.toLowerCase();
    console.log("📩 Mensaje recibido:", { from, raw: msg, lower });

    // 🔹 COMANDOS INICIALES / SALUDO
    if (["hola", "buenas", "menu", "menú", "inicio", "start"].includes(lower)) {
      await sendBienvenida(from);
      return res.sendStatus(200);
    }

    // 🔹 Menú principal
    if (msg === "MENU_PRINCIPAL") {
      await sendMenuPrincipal(from);
      return res.sendStatus(200);
    }

    // 🔹 Chat con ventas
    if (msg === "CHAT_VENTAS") {
      await sendChatConVentas(from);
      return res.sendStatus(200);
    }

    // 🔹 Categorías de productos
    if (msg === "CAT_PRODUCTOS") {
      await sendCategoriaProductos(from);
      return res.sendStatus(200);
    }

    // 🔹 Subcategorías
    if (
      msg === "CAT_FETEADOS" ||
      msg === "CAT_SALAMES" ||
      msg === "CAT_SALCHICHAS" ||
      msg === "CAT_ESPECIALIDADES"
    ) {
      await sendSubcategoria(from, msg);
      return res.sendStatus(200);
    }

    // 🔹 Food truck
    if (msg === "FOOD_TRUCK") {
      await sendFoodTruck(from);
      return res.sendStatus(200);
    }

    // 🔹 Catálogo PDF
    if (msg === "CATALOGO_PDF") {
      await sendCatalogoCompleto(from);
      return res.sendStatus(200);
    }

    // 🔹 Inicio pedido
    if (msg === "INICIO_PEDIDO") {
      await sendInicioPedidoOpciones(from);
      return res.sendStatus(200);
    }

    // 🔹 Datos del pedido
    if (msg.startsWith("PEDIDO_")) {
      const tipo = msg.replace("PEDIDO_", "").toLowerCase();
      await pedirDatosDelCliente(from, tipo);
      return res.sendStatus(200);
    }

    // 🔹 Confirmación de pedido
    if (msg.startsWith("CONFIRMAR_")) {
      const resumen = msg.replace("CONFIRMAR_", "");
      await sendPedidoConfirmacionCliente(from, resumen);
      return res.sendStatus(200);
    }

    // 🔹 Si nada matchea, usar IA
    await sendRespuestaIA(from, msg);
    return res.sendStatus(200);
  } catch (err) {
    console.error("🔥 ERROR en POST /webhook:", err);
    return res.sendStatus(500);
  }
});

// ✅ ARRANQUE DEL SERVIDOR EN RAILWAY
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor activo escuchando en puerto ${PORT}`);
});
