// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// 👇 ESTE TOKEN DEBE SER IGUAL AL QUE PONES EN META
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "guille1234";

// ---------------------------------------------------
// Cargar bot.js de forma segura (que no tumbe el server)
// ---------------------------------------------------
let handlers = {};

(async () => {
  try {
    handlers = await import("./bot.js");
    console.log("✅ bot.js cargado correctamente");
  } catch (err) {
    console.error("❌ ERROR cargando bot.js (pero el servidor sigue vivo):", err);
    handlers = {}; // dejamos un objeto vacío para no romper nada
  }
})();

// Helpers por si alguna función no existe
const safe = (fnName) => {
  const fn = handlers[fnName];
  if (typeof fn === "function") return fn;
  return async () => {
    console.warn(`⚠ Handler ${fnName} no está definido en bot.js`);
  };
};

// ---------------------------------------------------
// HEALTHCHECK
// ---------------------------------------------------
app.get("/", (req, res) => {
  res.status(200).send("🚀 Nuevo Munich bot online (server.js OK)");
});

// ---------------------------------------------------
// VERIFICACIÓN WEBHOOK - META
// ---------------------------------------------------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("🔎 Verificación Webhook:", { mode, token, challenge, VERIFY_TOKEN });

  if (!mode || !token) {
    return res.sendStatus(400);
  }

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado correctamente");
    return res.status(200).send(challenge);
  }

  console.log("❌ Token de verificación incorrecto");
  return res.sendStatus(403);
});

// ---------------------------------------------------
// RECEPCIÓN DE MENSAJES WHATSAPP
// ---------------------------------------------------
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const type = message.type;

    let msg = null;

    if (type === "text") {
      msg = message.text?.body;
    } else if (type === "interactive") {
      const inter = message.interactive;
      if (inter.type === "button_reply") msg = inter.button_reply.id;
      if (inter.type === "list_reply") msg = inter.list_reply.id;
    }

    if (!msg) return res.sendStatus(200);

    const lower = msg.toLowerCase();
    console.log("📩 Mensaje recibido:", { from, type, msg });

    // ---- FLUJO DEL BOT ----
    if (["hola", "buenas", "menu", "menú", "inicio", "start"].includes(lower)) {
      await safe("sendBienvenida")(from);
      return res.sendStatus(200);
    }

    if (msg === "MENU_PRINCIPAL") {
      await safe("sendMenuPrincipal")(from);
      return res.sendStatus(200);
    }

    if (msg === "CHAT_VENTAS") {
      await safe("sendChatConVentas")(from);
      return res.sendStatus(200);
    }

    if (msg === "CAT_PRODUCTOS") {
      await safe("sendCategoriaProductos")(from);
      return res.sendStatus(200);
    }

    if (
      msg === "CAT_FETEADOS" ||
      msg === "CAT_SALAMES" ||
      msg === "CAT_SALCHICHAS" ||
      msg === "CAT_ESPECIALIDADES"
    ) {
      await safe("sendSubcategoria")(from, msg);
      return res.sendStatus(200);
    }

    if (msg === "FOOD_TRUCK") {
      await safe("sendFoodTruck")(from);
      return res.sendStatus(200);
    }

    if (msg === "CATALOGO_PDF") {
      await safe("sendCatalogoCompleto")(from);
      return res.sendStatus(200);
    }

    if (msg === "INICIO_PEDIDO") {
      await safe("sendInicioPedidoOpciones")(from);
      return res.sendStatus(200);
    }

    if (msg.startsWith("PEDIDO_")) {
      const tipo = msg.replace("PEDIDO_", "").toLowerCase();
      await safe("pedirDatosDelCliente")(from, tipo);
      return res.sendStatus(200);
    }

    if (msg.startsWith("CONFIRMAR_")) {
      const resumen = msg.replace("CONFIRMAR_", "");
      await safe("sendPedidoConfirmacionCliente")(from, resumen);
      return res.sendStatus(200);
    }

    // Por defecto -> IA
    await safe("sendRespuestaIA")(from, msg);
    return res.sendStatus(200);
  } catch (err) {
    console.error("🔥 ERROR en /webhook:", err);
    // Respondemos 200 igualmente para que Meta no repita el mismo evento
    return res.sendStatus(200);
  }
});

// ---------------------------------------------------
// SERVIDOR EN RAILWAY
// ---------------------------------------------------
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
