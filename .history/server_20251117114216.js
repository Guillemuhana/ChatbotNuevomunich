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
sendResumenPedido,
pedidos
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

// =======================================================
// VERIFICACIÓN DEL WEBHOOK (NO TOCAR)
// =======================================================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
console.log("🟢 WEBHOOK VERIFICADO");
res.status(200).send(challenge);
} else {
console.log("🔴 ERROR EN VERIFICACIÓN");
res.sendStatus(403);
}
});

// =======================================================
// RECEPCIÓN DE MENSAJES
// =======================================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const msg =
message.text?.body || message.interactive?.button_reply?.id || "";

console.log("📩 MENSAJE:", msg);

// ============================================
// 1️⃣ DETECTAR SI ESTÁ EN MODO "FORMULARIO PEDIDO"
// ============================================
if (pedidos[from]) {
const handled = await manejarPedido(from, msg);
if (handled) return res.sendStatus(200);

// Si algo falla, volvemos al menú
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// ============================================
// 2️⃣ SALUDO / INICIO
// ============================================
if (["hola", "Hola", "menu", "Menu", "Menú"].includes(msg)) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// ============================================
// 3️⃣ LEER MÁS
// ============================================
if (msg === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

// ============================================
// 4️⃣ MENÚ PRINCIPAL (BOTÓN VER OPCIONES)
// ============================================
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// ============================================
// 5️⃣ PRODUCTOS → CATEGORÍAS
// ============================================
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// ============================================
// 6️⃣ SUBCATEGORÍAS (FETEADOS / SALAMES, ETC)
// ============================================
if (
msg === "FETEADOS" ||
msg === "SALAMES" ||
msg === "SALCHICHAS" ||
msg === "ESPECIALIDADES"
) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// ============================================
// 7️⃣ PRODUCTO → MUESTRA IMAGEN CORRECTA
// ============================================
if (msg.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

// ============================================
// 8️⃣ FOOD TRUCK / EVENTOS
// ============================================
if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

// ============================================
// 9️⃣ CONSULTAR PEDIDO
// ============================================
if (msg === "CONSULTAR_PEDIDO") {
await sendConsultarPedido(from);
return res.sendStatus(200);
}

// ============================================
// 🔟 CATÁLOGO COMPLETO (PDF)
// ============================================
if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

// ============================================
// 1️⃣1️⃣ INICIAR PEDIDO (FLUJO FORMULARIO)
// ============================================
if (msg === "REALIZAR_PEDIDO") {
await sendIniciarPedido(from);
return res.sendStatus(200);
}

// ============================================
// 1️⃣2️⃣ CONFIRMAR PEDIDO (ÚLTIMO PASO)
// ============================================
if (msg === "CONFIRMAR_PEDIDO") {
await sendResumenPedido(from);
return res.sendStatus(200);
}

// ============================================
// SI ESCRIBE CUALQUIER OTRA COSA → MENÚ
// ============================================
await sendMenuPrincipal(from);
res.sendStatus(200);

} catch (error) {
console.log("❌ ERROR EN WEBHOOK:", error);
res.sendStatus(500);
}
});

// =======================================================
// INICIAR SERVIDOR
// =======================================================
app.listen(process.env.PORT || 3000, () => {
console.log("🟢 BOT LISTO → http://localhost:" + (process.env.PORT || 3000));
});