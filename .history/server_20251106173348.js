import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import {
sendMenuPrincipal,
sendProductosMenu,
sendCategoriaDetalle,
iniciarPedido,
flujoPedido,
replyIA
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// ✅ VERIFICACIÓN DE WEBHOOK
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN)
return res.send(req.query["hub.challenge"]);
res.sendStatus(403);
});

// ✅ RECEPCIÓN DE MENSAJES
app.post("/webhook", async (req, res) => {
try {
const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const text = message.text?.body?.trim();
const payload = message.button?.payload?.trim();
const title = message.button?.text?.trim();

console.log("📩 TEXTO:", text);
console.log("🔘 PAYLOAD:", payload);
console.log("🔠 TITLE:", title);

// ✅ Normalizamos lo que recibimos
const msg = payload || text;

// ✅ SALUDO / MENU
if (["hola", "menu", "inicio"].includes((msg || "").toLowerCase()))
return sendMenuPrincipal(from);

// ✅ BOTONES CON PAYLOAD (funcionan si Meta los envía bien)
if (msg === "BTN_PRODUCTOS") return sendProductosMenu(from);
if (msg === "BTN_EVENTOS") return sendMessage({ messaging_product:"whatsapp", to: from, text:{ body:"📅 Pronto activaremos Eventos." }});
if (msg === "BTN_PEDIDO") return iniciarPedido(from);

// ✅ BOTONES SIN PAYLOAD → USAMOS TITLE DEL BOTÓN
if (title) {
switch (title.toLowerCase()) {
case "ver productos": return sendProductosMenu(from);
case "eventos": return sendMessage({
messaging_product:"whatsapp",
to: from,
text:{ body:"📅 Pronto activaremos Eventos & Catering." }
});
case "hacer pedido": return iniciarPedido(from);
}
}

// ✅ SUBMENÚ PRODUCTOS
if (["P_PICADAS", "P_SALCHICHAS", "P_GRILL"].includes(msg))
return sendCategoriaDetalle(from, msg);

// ✅ FLUJO DE PEDIDO
const result = await flujoPedido(from, msg);
if (result !== undefined) return;

// ✅ MENSAJES LIBRES → IA
return replyIA(from, msg);

} catch (e) {
console.log("❌ Error webhook:", e);
}

res.sendStatus(200);
});

// ✅ INICIA SERVIDOR
app.listen(process.env.PORT, () =>
console.log(`✅ BOT LISTO → http://localhost:${process.env.PORT}`)
);

