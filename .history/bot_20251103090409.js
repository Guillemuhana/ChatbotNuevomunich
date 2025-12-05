import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import { sendText, sendImage, sendButtons, sendDocument } from "./bot.js";
import { productos } from "./responses.js";

const app = express();
app.use(bodyParser.json());

const verifyToken = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

// ✅ WEBHOOK VERIFY
app.get("/webhook", (req, res) => {
if (req.query["hub.verify_token"] === verifyToken) {
return res.send(req.query["hub.challenge"]);
}
res.sendStatus(403);
});

// ✅ WEBHOOK MENSAJES
app.post("/webhook", async (req, res) => {
const data = req.body;
const message = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
const from = message?.from;
const text = message?.text?.body?.toLowerCase();

if (!text || !from) return res.sendStatus(200);

console.log("📩 Mensaje recibido:", text);

// 🟢 MENÚ DE INICIO
if (["hola", "buenas", "menu", "inicio"].some(w => text.includes(w))) {
await sendButtons(
from,
"*Bienvenido a Nuevo Munich* 🍺\n_Artesanos del sabor desde 1972._\n\n¿En qué podemos ayudarte? 👇",
[
{ id: "productos", title: "🧾 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "catalogo", title: "📄 Ver Catálogo" },
{ id: "pedido", title: "🛒 Hacer Pedido" }
]
);
return res.sendStatus(200);
}

// 🧾 MOSTRAR CATEGORÍAS
if (text.includes("productos")) {
await sendText(from, "📦 Categorías:\n• Feteados\n• Salames\n• Ahumados\n• Quesos\n\nRespondé con el nombre del producto 👇");
return res.sendStatus(200);
}

// 📄 CATÁLOGO PDF
if (text.includes("catalogo")) {
await sendDocument(from, "https://nuevomunich.com.ar/wp-content/uploads/2024/04/Catalogo-Productos-Nuevo-Munich.pdf", "Catalogo Nuevo Munich");
return res.sendStatus(200);
}

// 🎯 RESPUESTA AUTOMÁTICA (foto + texto)
for (const nombre in productos) {
if (text.includes(nombre)) {
const p = productos[nombre];
await sendImage(from, p.img, p.texto);
return res.sendStatus(200);
}
}

// ❓ DEFAULT
await sendText(from, "No entendí 🤔\nDecime *hola* para ver el menú.");
res.sendStatus(200);
});

app.listen(PORT, () => console.log(`✅ BOT LISTO en puerto ${PORT}`));

