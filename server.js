import express from "express";
import dotenv from "dotenv";

dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

const app = express();

// Middleware (sin body-parser)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "";

// Root + Health (Railway-friendly)
app.get("/", (req, res) => res.status(200).send("OK - Nuevo Munich Bot"));
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.get("/favicon.ico", (req, res) => res.sendStatus(204));

// Verificación webhook Meta
app.get("/webhook", (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  } catch (e) {
    console.error("WEBHOOK VERIFY ERROR:", e);
    return res.sendStatus(403);
  }
});

// Recepción mensajes (RESPONDE 200 INMEDIATO SIEMPRE)
app.post("/webhook", (req, res) => {
  res.sendStatus(200);

  // Procesar async para no bloquear ni romper Railway
  setImmediate(async () => {
    try {
      const entry = req.body?.entry?.[0];
      const value = entry?.changes?.[0]?.value;
      const message = value?.messages?.[0];
      if (!message) return;

      const from = message.from;
      const type = message.type;

      let msg = null;
      if (type === "text") msg = message.text?.body;
      if (type === "interactive") {
        const inter = message.interactive;
        if (inter?.type === "button_reply") msg = inter.button_reply?.id;
        if (inter?.type === "list_reply") msg = inter.list_reply?.id;
      }
      if (!msg) return;

      // Import del bot SOLO cuando llega un mensaje (si falla, NO rompe el server)
      const bot = await import("./bot.js");

      const lower = String(msg).toLowerCase().trim();

      if (["hola", "buenas", "menu", "menú", "inicio", "start"].includes(lower)) {
        await bot.sendBienvenida(from);
        return;
      }

      if (msg === "MENU_PRINCIPAL") return bot.sendMenuPrincipal(from);
      if (msg === "CHAT_VENTAS") return bot.sendChatConVentas(from);
      if (msg === "CAT_PRODUCTOS") return bot.sendCategoriaProductos(from);

      if (["CAT_FETEADOS", "CAT_SALAMES", "CAT_SALCHICHAS", "CAT_ESPECIALIDADES"].includes(msg)) {
        return bot.sendSubcategoria(from, msg);
      }

      if (msg === "FOOD_TRUCK") return bot.sendFoodTruck(from);
      if (msg === "CATALOGO_PDF") return bot.sendCatalogoCompleto(from);
      if (msg === "INICIO_PEDIDO") return bot.sendInicioPedidoOpciones(from);

      if (msg.startsWith("PEDIDO_")) {
        const tipo = msg.replace("PEDIDO_", "").toLowerCase();
        return bot.pedirDatosDelCliente(from, tipo);
      }

      if (msg.startsWith("CONFIRMAR_")) {
        const resumen = msg.replace("CONFIRMAR_", "");
        return bot.sendPedidoConfirmacionCliente(from, resumen);
      }

      return bot.sendRespuestaIA(from, msg);

    } catch (err) {
      console.error("WEBHOOK PROCESS ERROR:", err);
    }
  });
});

// Start server (Railway)
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
