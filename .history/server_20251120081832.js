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
sendCatalogoCompleto
} from "./bot.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

/* ============================
VERIFICACIÓN DEL WEBHOOK
============================ */
app.get("/webhook", (req, res) => {
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("🌍 WEBHOOK VERIFICADO");
return res.status(200).send(challenge);
} else {
return res.sendStatus(403);
}
}
});

/* ============================
RECEPCIÓN DE MENSAJES
============================ */
app.post("/webhook", async (req, res) => {
const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

if (!entry) return res.sendStatus(200);

const from = entry.from;
const msg = entry.text?.body;

console.log("📩 MENSAJE RECIBIDO:", msg);

if (!msg) return res.sendStatus(200);

if (msg.toLowerCase() === "hola") {
await sendBienvenida(from);
return res.sendStatus(200);
}

if (msg === "LEER_MAS") await sendLeerMas(from);
if (msg === "MENU_PRINCIPAL") await sendMenuPrincipal(from);
if (msg === "CAT_PRODUCTOS") await sendCategoriaProductos(from);

if (msg.startsWith("CAT_")) {
await sendSubcategoria(from, msg);
return res.sendStatus(200);
}

if (msg.startsWith("PROD_")) {
const nombre = msg.replace("PROD_", "");
await sendProducto(from, nombre);
return res.sendStatus(200);
}

if (msg === "CATALOGO_PDF") await sendCatalogoCompleto(from);

return res.sendStatus(200);
});

/* ============================
INICIO DEL SERVIDOR
============================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🟢 BOT LISTO → http://localhost:${PORT}`));

