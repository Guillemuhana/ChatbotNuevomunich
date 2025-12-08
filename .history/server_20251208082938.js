// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

// 👇 Asegúrate de que TODOS estos existan en bot.js
import {
  sendBienvenida,
  sendMenuPrincipal,
  sendCategoriaProductos,
  sendSubcategoria,
  sendProducto,
  sendFoodTruck,
  sendCatalogoCompleto,
  sendInicioPedidoOpciones,
  pedirDatosDelCliente,
  sendPedidoConfirmacionCliente,
  sendChatConVentas,
  sendRespuestaIA
} from "./bot.js";

const app = express();

// Middlewares
app.use(bodyParser.json());

// Token de verificación (DEBE coincidir con Meta)
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// -----------------------------------------------------------------------------
// TEST DEL SERVER
// -----------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.status(200).send("🔥 Nuevo Munich bot ONLINE (server.js)!");
});

// -----------------------------------------------------------------------------
// VERIFICACIÓN DEL WEBHOOK (GET /webhook)
// -----------------------------------------------------------------------------
app.get("/webhook", (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("🔎 Verificación Webhook:", {
      mode,
      token,
      challenge,
      VERIFY_TOKEN
    });

    // Faltan datos → 400
    if (!mode || !token) {
      console.log("❌ Faltan parámetros en la verificación");
      return res.sendStatus(400);
    }

    // Verificación correcta
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verificado correctamente!");
      return res.status(200).send(challenge);
    }

    // Token incorrecto
    console.log("⛔ Token de verificación incorrecto");
    return res.sendStatus(403);
  } catch (err) {
    console.error("🔥 ERROR en GET /webhook:", err);
    return res.sendStatus(500);
  }
});

// -----------------------------------------------------------------------------
// RECEPCIÓN DE MENSAJES WHATSAPP (POST /webhook)
// -----------------------------------------------------------------------------
app.post("/webhook", async (req, res) => {
  console.log("📨 Nueva llamada POST /webhook");

  try {
    // Log de lo que llega (útil para debug)
    console.log("🧾 Body recibido:", JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    // Si no hay mensaje, respondemos 200 igual (Meta solo chequea código)
    if (!message) {
      console.log("⚠️ No hay message en el body");
      return res.sendStatus(200);
    }

    const from = message.from; // número del usuario
    const type = message.type;

    let msg = null;

    if (type === "text") {
      msg = message.text?.body;
    } else if (type === "interactive") {
      const inter = message.interactive;
      if (inter.type === "button_reply") {
        msg = inter.button_reply.id;
      } else if (inter.type === "list_reply") {
        msg = inter.list_reply.id;
      }
    }

    if (!msg) {
      console.log("⚠️ No se pudo extraer el texto del mensaje");
      return res.sendStatus(200);
    }

    const lower = msg.toLowerCase();
    console.log("📬 Mensaje recibido:", msg, " (lower:", lower, ")");

    // ----------------- RUTEO DE MENSAJES -----------------

    // SALUDO / INICIO
    if (["hola", "buenas", "menu", "menú", "inicio", "start"].includes(lower)) {
      await sendBienvenida(from);
      return res.sendStatus(200);
    }

    // MENU PRINCIPAL
    if (msg === "MENU_PRINCIPAL") {
      await sendMenuPrincipal(from);
      return res.sendStatus(200);
    }

    // CHAT CON VENTAS
    if (msg === "CHAT_VENTAS") {
      await sendChatConVentas(from);
      return res.sendStatus(200);
    }

    // CATEGORÍAS
    if (msg === "CAT_PRODUCTOS") {
      await sendCategoriaProductos(from);
      return res.sendStatus(200);
    }

    // SUBCATEGORÍAS
    if (
      msg === "CAT_FETEADOS" ||
      msg === "CAT_SALAMES" ||
      msg === "CAT_SALCHICHAS" ||
      msg === "CAT_ESPECIALIDADES"
    ) {
      await sendSubcategoria(from, msg);
      return res.sendStatus(200);
    }

    // (Si usas productos individuales por ID)
    if (msg.startsWith("PROD_")) {
      await sendProducto(from, msg);
      return res.sendStatus(200);
    }

    // FOOD TRUCK
    if (msg === "FOOD_TRUCK") {
      await sendFoodTruck(from);
      return res.sendStatus(200);
    }

    // CATÁLOGO PDF
    if (msg === "CATALOGO_PDF") {
      await sendCatalogoCompleto(from);
      return res.sendStatus(200);
    }

    // INICIO DE PEDIDO
    if (msg === "INICIO_PEDIDO") {
      await sendInicioPedidoOpciones(from);
      return res.sendStatus(200);
    }

    // TIPO DE PEDIDO
    if (msg.startsWith("PEDIDO_")) {
      const tipo = msg.replace("PEDIDO_", "").toLowerCase();
      await pedirDatosDelCliente(from, tipo);
      return res.sendStatus(200);
    }

    // CONFIRMACIÓN DE PEDIDO
    if (msg.startsWith("CONFIRMAR_")) {
      const resumen = msg.replace("CONFIRMAR_", "");
      await sendPedidoConfirmacionCliente(from, resumen);
      return res.sendStatus(200);
    }

    // ----------------- RESPUESTA IA (fallback) -----------------
    await sendRespuestaIA(from, msg);
    return res.sendStatus(200);

  } catch (err) {
    console.error("🔥 ERROR en POST /webhook:", err);
    // Devolvemos 200 igual para que Meta no lo marque como fallo permanente
    return res.sendStatus(200);
  }
});

// -----------------------------------------------------------------------------
// MANEJADOR GLOBAL DE ERRORES (por si algo se escapa)
// -----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("💥 ERROR GLOBAL EXPRESS:", err);
  return res.sendStatus(500);
});

// -----------------------------------------------------------------------------
// SERVIDOR PARA RAILWAY
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor activo escuchando en puerto ${PORT}`);
});
