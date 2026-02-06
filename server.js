import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middlewares seguros para Railway
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ---------- HEALTH & ROOT ----------
app.get("/", (req, res) => {
  res.status(200).send("🚀 Chatbot Nuevo Munich ONLINE");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ---------- WEBHOOK VERIFY ----------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// ---------- WEBHOOK RECEIVE ----------
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // RESPONDE INMEDIATO (clave Railway)

  try {
    // 👉 Import dinámico: NO bloquea el arranque
    const bot = await import("./bot.js");

    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message) return;

    const from = message.from;
    const type = message.type;

    let msg = null;

    if (type === "text") msg = message.text?.body;

    if (type === "interactive") {
      const inter = message.interactive;
      if (inter.type === "button_reply") msg = inter.button_reply.id;
      if (inter.type === "list_reply") msg = inter.list_reply.id;
    }

    if (!msg) return;

    const lower = msg.toLowerCase();

    if (["hola", "buenas", "menu", "menú", "inicio", "start"].includes(lower)) {
      return bot.sendBienvenida(from);
    }

    if (msg === "MENU_PRINCIPAL") return bot.sendMenuPrincipal(from);
    if (msg === "CHAT_VENTAS") return bot.sendChatConVentas(from);
    if (msg === "CAT_PRODUCTOS") return bot.sendCategoriaProductos(from);

    if (
      ["CAT_FETEADOS", "CAT_SALAMES", "CAT_SALCHICHAS", "CAT_ESPECIALIDADES"]
        .includes(msg)
    ) {
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
    console.error("🔥 ERROR WEBHOOK:", err);
  }
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(🚀 Server running on port ${PORT});
});

console.log("=== SERVER FILE LOADED ===");