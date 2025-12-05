import 'dotenv/config';
import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

// ===============================
// ✅ VARIABLES
// ===============================
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO_URL = process.env.LOGO_URL;
const WEB_URL = process.env.WEB_URL;
const INSTAGRAM_URL = process.env.INSTAGRAM_URL;
const CATALOG_URL = process.env.CATALOG_URL;

const PORT = process.env.PORT || 3000;

// ===============================
// ✅ WEBHOOK GET (VALIDACIÓN META)
// ===============================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente.");
res.status(200).send(challenge);
} else {
res.sendStatus(403);
}
});

// ===============================
// ✅ WEBHOOK POST (MENSAJES)
// ===============================
app.post("/webhook", async (req, res) => {
try {
const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!entry) return res.sendStatus(200);

const from = entry.from;
const message = entry.text?.body || "";

console.log("💬 Mensaje recibido:", { from, message });

// 1) RESPUESTA SIMPLE PRIMERO ✅
await axios.post(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
messaging_product: "whatsapp",
to: from,
text: { body: "¡Hola! 👋 Ahora te envío el menú..." }
}, {
headers: {
Authorization: `Bearer ${WHATSAPP_TOKEN}`,
"Content-Type": "application/json"
}
});

// 2) ENVIAMOS MENÚ CON BOTONES DESPUÉS ✅
setTimeout(async () => {
await axios.post(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
messaging_product: "whatsapp",
to: from,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: LOGO_URL }
},
body: {
text: "Bienvenidos a *Nuevo Munich*\nArtesanos del sabor desde 1972"
},
footer: {
text: `🌐 ${WEB_URL}\n📸 ${INSTAGRAM_URL}\n📑 Catálogo: ${CATALOG_URL}`
},
action: {
buttons: [
{ type: "reply", reply: { id: "BTN_PICADAS", title: "Picadas" } },
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer pedido" } }
]
}
}
}, {
headers: {
Authorization: `Bearer ${WHATSAPP_TOKEN}`,
"Content-Type": "application/json"
}
});
console.log("✅ Menú enviado correctamente");
}, 800);

res.sendStatus(200);

} catch (error) {
console.log("❌ Error procesando mensaje:", error?.response?.data || error);
res.sendStatus(200);
}
});

// ===============================
// ✅ INICIO DEL SERVIDOR
// ===============================
app.listen(PORT, () => {
console.log(`🚀 BOT ACTIVO en http://localhost:${PORT}`);
});

