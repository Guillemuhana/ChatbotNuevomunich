import express from "express";
import dotenv from "dotenv";
import { sendMenuPrincipal, sendProductosMenu, sendCategoriaDetalle, iniciarPedido, flujoPedido, replyIA } from "./bot.js";

dotenv.config();

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ===============================
// ✅ VERIFY WEBHOOK (GET)
// ===============================
app.get("/webhook", (req, res) => {
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (token && token === VERIFY_TOKEN) {
return res.status(200).send(challenge);
}
res.sendStatus(403);
});

// ===============================
// 📩 RECEPCIÓN DE MENSAJES (POST)
// ===============================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!entry) return res.sendStatus(200);

const from = entry.from; // Teléfono del usuario
const type = entry.type;

// ☑ Mensajes de texto
if (type === "text") {
const msg = entry.text.body.trim().toLowerCase();
console.log(`🟢 MENSAJE: ${msg}`);

// Si el usuario está en un flujo de pedido
if (sessions.has(from)) {
return flujoPedido(from, entry.text.body);
}

// Detectar saludos → mostrar menú principal
if (["hola", "holaa", "buenas", "buen dia"].includes(msg)) {
return sendMenuPrincipal(from);
}

// Si no coincide → responder IA
return replyIA(from, entry.text.body);
}

// ☑ BOTONES INTERACTIVOS
if (type === "interactive" && entry.interactive?.button_reply?.id) {
const btn = entry.interactive.button_reply.id;
console.log(`🔘 BOTÓN: ${btn}`);

// Menú principal
if (btn === "BTN_PRODUCTOS") return sendProductosMenu(from);
if (btn === "BTN_EVENTOS") return replyIA(from, "Eventos & Catering");
if (btn === "BTN_PEDIDO") return iniciarPedido(from);

// Categorías de productos
if (["P_FETEADOS", "P_SALAMES", "P_SALCHICHAS"].includes(btn)) {
return sendCategoriaDetalle(from, btn);
}

// Confirmaciones de pedido
if (["CONFIRMAR", "CANCELAR"].includes(btn)) {
return flujoPedido(from, btn);
}
}

res.sendStatus(200);
} catch (error) {
console.log("❌ ERROR WEBHOOK:", error);
res.sendStatus(500);
}
});

// ===============================
// 🚀 SERVIDOR
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${PORT}`);
});

