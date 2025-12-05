import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import {
sendBienvenida,
sendLeerMas,
sendMenuPrincipal,
sendCategoriaProductos,
sendSubcategoria,
sendProducto,
sendCatalogoCompleto,
sendFoodTruck,
sendConsultarPedido,
manejarPedido,
sendResumenPedido
} from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// ======================================
// VERIFICACIÓN DEL WEBHOOK
// ======================================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
return res.status(200).send(challenge);
}

return res.sendStatus(403);
});

// ======================================
// RECEPCIÓN DE MENSAJES
// ======================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];
if (!message) return res.sendStatus(200);

const from = message.from;
const msg =
message.text?.body ||
message.interactive?.button_reply?.id ||
message.interactive?.list_reply?.id;

console.log("📩 MENSAJE:", msg);

// ============================
// 0) FLUJO DE PEDIDO PASO A PASO
// ============================
const pedidoEnCurso = await manejarPedido(from, msg);
if (pedidoEnCurso !== false) {
return res.sendStatus(200);
}

// ============================
// 1) PALABRAS INICIALES
// ============================
if (["hola", "Hola", "menu", "Menu", "Menú"].includes(msg)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// ============================
// 2) LEER MÁS
// ============================
if (msg === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

// ============================
// 3) MENÚ PRINCIPAL
// ============================
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// ============================
// 4) PRODUCTOS
// ============================
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// ============================
// 5) SUBCATEGORÍAS
// ============================
if (
msg === "FETEADOS" ||
msg === "SALAMES" ||
msg === "SALCHICHAS" ||
msg === "ESPECIALIDADES"
) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// ============================
// 6) PRODUCTO FINAL
// ============================
if (msg?.startsWith("PROD_")) {
const producto = msg.replace("PROD_", "");
await sendProducto(from, producto);
return res.sendStatus(200);
}

// ============================
// 7) FOOD TRUCK
// ============================
if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

// ============================
// 8) CONSULTAR PEDIDO
// ============================
if (msg === "CONSULTAR_PEDIDO") {
await sendConsultarPedido(from);
return res.sendStatus(200);
}

// ============================
// 9) CATÁLOGO PDF
// ============================
if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

// ============================
// 10) DEFAULT
// ============================
await sendMenuPrincipal(from);

res.sendStatus(200);
} catch (error) {
console.error("❌ ERROR EN WEBHOOK:", error);
res.sendStatus(500);
}
});

// ======================================
// INICIAR SERVIDOR
// ======================================
app.listen(process.env.PORT || 3000, () =>
console.log("✅ BOT LISTO en http://localhost:" + (process.env.PORT || 3000))
);

