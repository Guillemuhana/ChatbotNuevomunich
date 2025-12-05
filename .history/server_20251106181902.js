import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

// IMPORTAMOS DESDE bot.js CON LOS NOMBRES CORRECTOS
import {
sendMenuPrincipal,
sendMenuProductos,
sendMasCategorias,
sendCategoriaDetalle,
sendEventosInfo,
iniciarPedido,
flujoPedido,
replyIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// ✅ WEBHOOK VERIFICACIÓN
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN)
return res.send(req.query["hub.challenge"]);
res.sendStatus(403);
});

// ✅ WEBHOOK RECEPCIÓN
app.post("/webhook", async (req, res) => {
try {
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body;
const button = message.button?.payload;
const msg = button || text;

console.log("🟢 MENSAJE:", msg);

// MENU PRINCIPAL
if (["hola", "Hola", "menu", "Menu", "inicio", "Inicio"].includes(msg))
return sendMenuPrincipal(from);

// PRODUCTOS
if (msg === "BTN_PRODUCTOS") return sendMenuProductos(from);
if (msg === "P_MAS") return sendMasCategorias(from);

// CATEGORÍAS ↴
if (["P_FETEADOS", "P_SALAMES", "P_ALEMANAS", "P_ESPECIALIDADES"].includes(msg))
return sendCategoriaDetalle(from, msg);

// EVENTOS
if (msg === "BTN_EVENTOS") return sendEventosInfo(from);

// PEDIDOS
if (msg === "BTN_PEDIDO") return iniciarPedido(from);
await flujoPedido(from, msg); // CONTINÚA EL PEDIDO SI EXISTE SESIÓN

// IA PARA MENSAJES LIBRES
return replyIA(from, msg);

} catch (e) {
console.log("❌ Error webhook:", e);
}

res.sendStatus(200);
});

// SERVIDOR
app.listen(process.env.PORT, () =>
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`)
);

