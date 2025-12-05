import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

// IMPORTAR SOLO FUNCIONES QUE EXISTEN
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

// VERIFY TOKEN (Whatsapp Cloud)
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
return res.send(req.query["hub.challenge"]);
}
return res.sendStatus(403);
});

// RECEPCIÓN DE MENSAJES
app.post("/webhook", async (req, res) => {
try {
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body;
const button = message.button?.payload;
const msg = button || text;

console.log("🟢 MENSAJE:", msg);

// ⚠️ EVITAR ERRORES SI msg ES undefined
if (!msg) {
return replyIA(from, "¿Cómo puedo ayudarte? 😊");
}

// MENÚ PRINCIPAL
if (["hola", "Hola", "menu", "Menu", "inicio", "Inicio"].includes(msg)) {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// BOTONES
if (msg === "BTN_PRODUCTOS") return sendProductosMenu(from);
if (msg === "BTN_PEDIDO") return iniciarPedido(from);
if (msg === "BTN_EVENTOS") return replyIA(from, "Eventos y Catering");

// LISTA DE CATEGORÍAS
if (msg.startsWith("CAT_")) return sendCategoriaLista(from, msg);

// DETALLE PRODUCTO
if (msg.startsWith("PROD_")) return sendProductoDetalle(from, msg);

// FLUJO DE PEDIDO
await flujoPedido(from, msg);

// RESPUESTA IA
return replyIA(from, msg);

} catch (error) {
console.log("❌ ERROR WEBHOOK:", error);
}

return res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`);
});
