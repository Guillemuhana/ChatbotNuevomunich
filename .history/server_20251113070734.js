// server.js
import express from "express";
import bodyParser from "body-parser";

import {
sendMenuPrincipal,
sendDescripcionAmpliada,
sendProductosMenu,
sendProductosDeCategoria,
sendProductoImagen
} from "./bot.js";

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("BOT NUEVO MUNICH OK"));

app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!entry) return res.sendStatus(200);

const from = entry.from;
const msg = entry.text?.body?.trim() || entry.button?.payload;

console.log("MENSAJE:", msg);

// === MENÚ ===
if (msg === "Menú" || msg === "menu" || msg === "MENU") {
await sendMenuPrincipal(from);
return res.sendStatus(200);
}

// LEER MÁS
if (msg === "LEER_MAS") {
await sendDescripcionAmpliada(from);
return res.sendStatus(200);
}

// PRODUCTOS
if (msg === "PRODUCTOS" || msg === "BTN_PRODUCTOS") {
await sendProductosMenu(from);
return res.sendStatus(200);
}

// CATEGORÍAS
if (msg?.startsWith("CAT_")) {
await sendProductosDeCategoria(from, msg);
return res.sendStatus(200);
}

// BUSCAR PRODUCTO POR NOMBRE EXACTO
await sendProductoImagen(from, msg);

res.sendStatus(200);
} catch (err) {
console.log("ERROR WEBHOOK:", err);
res.sendStatus(500);
}
});

app.listen(3000, () => console.log("🔥 BOT LISTO → http://localhost:3000"));

