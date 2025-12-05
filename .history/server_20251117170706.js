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
} from "./bot.js";


dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ================================
// VERIFICACIÓN WEBHOOK
// ================================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
res.status(200).send(challenge);
} else {
res.sendStatus(403);
}
});

// ================================
// RECEPCIÓN DE MENSAJES
// ================================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];

if (!message) return res.sendStatus(200);

const from = message.from;
const msg =
message.text?.body || message.interactive?.button_reply?.id || "";

console.log("📩 MENSAJE:", msg);

// ==========================
// 1. BIENVENIDA
// ==========================
if (
["hola", "Hola", "menu", "Menu", "menú", "Menú", "inicio", "Inicio"].includes(
msg.trim()
)
) {
await sendBienvenida(from);
return res.sendStatus(200);
}

// ==========================
// 2. LEER MÁS
// ==========================
if (msg === "LEER_MAS") {
await sendLeerMas(from);
return res.sendStatus(200);
}

// ==========================
// 3. MENÚ PRINCIPAL
// ==========================
if (msg === "MENU_PRINCIPAL") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// ==========================
// 4. CATEGORÍAS DE PRODUCTOS
// ==========================
if (msg === "CAT_PRODUCTOS") {
await sendCategoriaProductos(from);
return res.sendStatus(200);
}

// ==========================
// 5. SUBCATEGORÍAS
// ==========================
if (["FETEADOS", "SALAMES", "SALCHICHAS"].includes(msg)) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

// ==========================
// 6. PRODUCTO → Imagen
// ==========================
if (msg.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

// ==========================
// 7. FOOD TRUCK
// ==========================
if (msg === "FOOD_TRUCK") {
await sendFoodTruck(from);
return res.sendStatus(200);
}

// ==========================
// 8. REALIZAR PEDIDO
// ==========================
if (msg === "CONSULTAR_PEDIDO") {
await sendConsultarPedido(from);
return res.sendStatus(200);
}

// ==========================
// 9. CATÁLOGO PDF
// ==========================
if (msg === "CATALOGO_PDF") {
await sendCatalogoCompleto(from);
return res.sendStatus(200);
}

// ==========================
// FALLBACK → REGRESAR A MENÚ
// ==========================
await sendMenuPrincipal(from);
return res.sendStatus(200);

} catch (err) {
console.log("❌ ERROR EN WEBHOOK:", err);
res.sendStatus(500);
}
});

// ================================
// INICIAR SERVIDOR
// ================================
app.listen(process.env.PORT || 3000, () => {
console.log(
"✅ BOT LISTO → http://localhost:" + (process.env.PORT || 3000)
);
});
