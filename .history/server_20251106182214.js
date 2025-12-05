import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

// Importamos funciones del bot
import {
sendMenuPrincipal,
sendProductosMenu,
sendCategoriasExtra,
sendCategoriaDetalle,
iniciarPedido,
flujoPedido,
replyIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// Verificación del Webhook
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN)
return res.send(req.query["hub.challenge"]);
res.sendStatus(403);
});

// Recepción de mensajes
app.post("/webhook", async (req, res) => {
try {
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;

// ✅ Captura correcta de texto / botones / listas
const text = message.text?.body;
const button = message.interactive?.button_reply?.id;
const list = message.interactive?.list_reply?.id;

const msg = button || list || text;
console.log("🟢 MENSAJE:", msg);

// ✅ MENÚ PRINCIPAL
if (["hola", "Hola", "menu", "Menu", "inicio", "Inicio"].includes(msg))
return sendMenuPrincipal(from);

// ✅ PRODUCTOS (primer menú)
if (msg === "BTN_PRODUCTOS")
return sendProductosMenu(from);

// ✅ PRODUCTOS (segundo menú / categorías extra)
if (msg === "BTN_MAS_CATEGORIAS")
return sendCategoriasExtra(from);

// ✅ CATEGORÍAS
if (["P_FETEADOS", "P_SALAMES", "P_ALEMANAS", "P_ESPECIALIDADES"].includes(msg))
return sendCategoriaDetalle(from, msg);

// ✅ EVENTOS & CATERING
if (msg === "BTN_EVENTOS")
return replyIA(from, "Consultaron por eventos y catering.");

// ✅ PEDIDO
if (msg === "BTN_PEDIDO")
return iniciarPedido(from);

await flujoPedido(from, msg);

// ✅ Si no coincide → IA responde
return replyIA(from, msg);

} catch (e) {
console.log("❌ Error webhook:", e);
}

res.sendStatus(200);
});

// Inicio del servidor
app.listen(process.env.PORT, () =>
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`)
);

