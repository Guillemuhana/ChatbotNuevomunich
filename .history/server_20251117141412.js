import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";

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
sendIniciarPedido,
manejarPedido,
sendResumenPedido
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// ======================================================
// VERIFICACIÓN DEL WEBHOOK (IMPORTANTE PARA META)
// ======================================================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
console.log("✔ Webhook verificado correctamente.");
res.status(200).send(challenge);
} else {
res.sendStatus(403);
}
});

// ======================================================
// RECEPCIÓN DE MENSAJES
// ======================================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const msg =
message.text?.body || message.interactive?.button_reply?.id || message.interactive?.list_reply?.id;

console.log("📩 MENSAJE:", msg);

// ======================================================
// 🔥 MANEJO DE FORMULARIO DE PEDIDO
// ======================================================
const manejado = await manejarPedido(from, msg);
if (manejado) return res.sendStatus(200);

// Confirmación final del pedido
if (msg === "CONFIRMAR_PEDIDO") {
await sendResumenPedido(from);
return res.sendStatus(200);
}

// ======================================================
// OPCIONES PRINCIPALES
// ======================================================

// 1. BIENVENIDA
if (["hola", "Hola", "menu", "Menu", "inicio"].includes(msg)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// 2. LEER MÁS
if (msg === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

// 3. MENÚ PRINCIPAL
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// 4. PRODUCTOS (Categorías)
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// 5. Subcategorías
if (["FETEADOS", "SALAMES", "SALCHICHAS", "ESPECIALIDADES"].includes(msg)) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// 6. Productos finales
if (msg?.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

// 7. Food truck
if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

// 8. Consultar pedido
if (msg === "CONSULTAR_PEDIDO") {
await sendConsultarPedido(from);
return res.sendStatus(200);
}

// 9. Catálogo PDF
if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

// 10. Realizar pedido
if (msg === "REALIZAR_PEDIDO") {
await sendIniciarPedido(from);
return res.sendStatus(200);
}

// ======================================================
// DEFAULT → NO SE ENTENDIÓ EL MENSAJE
// ======================================================
await sendMenuPrincipal(from);

res.sendStatus(200);
} catch (error) {
console.log("❌ ERROR EN WEBHOOK:", error);
res.sendStatus(500);
}
});

// ======================================================
// INICIAR SERVIDOR
// ======================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`✔ BOT LISTO → http://localhost:${PORT}`);
});
