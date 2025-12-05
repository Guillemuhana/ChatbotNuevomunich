import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

// --- IMPORTAR SOLO LAS FUNCIONES QUE EXISTEN EN bot.js ---
import {
sendMenuPrincipal,
sendProductosMenu,
sendCategoriaLista,
sendProductoDetalle,
iniciarPedido,
flujoPedido,
replyIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// --- VERIFICACIÓN DEL WEBHOOK (NO TOCAR) ---
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
return res.send(req.query["hub.challenge"]);
}
return res.sendStatus(403);
});

// --- RECEPCIÓN DE MENSAJES ---
app.post("/webhook", async (req, res) => {
try {
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body;
const button = message.button?.payload;

const msg = button || text;
console.log("📩 MENSAJE:", msg);

// --- MENÚ PRINCIPAL ---
if (["hola", "Hola", "menu", "Menu", "inicio", "Inicio"].includes(msg)) {
return sendMenuPrincipal(from);
}

// --- BOTONES PRINCIPALES ---
if (msg === "BTN_PRODUCTOS") return sendProductosMenu(from);
if (msg === "BTN_PEDIDO") return iniciarPedido(from);
if (msg === "BTN_EVENTOS") {
return replyIA(from, "Quiero info sobre Eventos y Catering");
}

// --- LISTADO DE CATEGORÍAS ---
if (msg.startsWith("CAT_")) return sendCategoriaLista(from, msg);

// --- DETALLE DE PRODUCTO ---
if (msg.startsWith("PROD_")) return sendProductoDetalle(from, msg);

// --- FLUJO DEL PEDIDO ---
await flujoPedido(from, msg);

// --- RESPUESTA DE IA EN MENSAJES LIBRES ---
return replyIA(from, msg);

} catch (error) {
console.log("❌ ERROR WEBHOOK:", error);
}

return res.sendStatus(200);
});

// --- INICIO DEL SERVIDOR ---
app.listen(process.env.PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`);
});

