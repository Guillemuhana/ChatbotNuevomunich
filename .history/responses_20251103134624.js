import axios from "axios";
import { CATALOGO_URL } from "./productos.js";

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID;

/* ============ ENVIAR TEXTO ============ */
export async function sendText(to, text) {
try {
await axios.post(
`https://graph.facebook.com/v24.0/${phoneId}/messages`,
{
messaging_product: "whatsapp",
to,
text: { body: text }
},
{
headers: { Authorization: `Bearer ${token}` }
}
);
} catch (error) {
console.log("❌ ERROR sendText:", error.response?.data || error);
}
}

/* ============ ENVIAR IMAGEN ============ */
export async function sendImage(to, urlImg, caption = "") {
try {
await axios.post(
`https://graph.facebook.com/v24.0/${phoneId}/messages`,
{
messaging_product: "whatsapp",
to,
type: "image",
image: { link: urlImg, caption }
},
{
headers: { Authorization: `Bearer ${token}` }
}
);
} catch (error) {
console.log("❌ ERROR sendImage:", error.response?.data || error);
}
}

/* ============ ENVIAR BOTONES ============ */
export async function sendMenu(to) {
try {
await axios.post(
`https://graph.facebook.com/v24.0/${phoneId}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text: "*Bienvenido a Nuevo Munich* 🍺\n_Artesanos del sabor desde 1972._\n\n*¿En qué podemos ayudarte?* 👇"
},
action: {
buttons: [
{ type: "reply", reply: { id: "productos", title: "🧾 Productos" } },
{ type: "reply", reply: { id: "eventos", title: "🎉 Eventos" } },
{ type: "reply", reply: { id: "zonas", title: "🚚 Zonas de Reparto" } },
{ type: "reply", reply: { id: "provincias", title: "🇦🇷 Provincias" } },
{ type: "reply", reply: { id: "catalogo", title: "📎 Ver Catálogo" } },
{ type: "reply", reply: { id: "pedido", title: "🛒 Hacer Pedido" } }
]
}
}
},
{
headers: { Authorization: `Bearer ${token}` }
}
);
} catch (error) {
console.log("❌ ERROR sendMenu:", error.response?.data || error);
}
}

/* ============ ENVIAR CATÁLOGO PDF ============ */
export async function sendCatalog(to) {
try {
await axios.post(
`https://graph.facebook.com/v24.0/${phoneId}/messages`,
{
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: CATALOGO_URL,
caption: "📄 *Catálogo Nuevo Munich*"
}
},
{
headers: { Authorization: `Bearer ${token}` }
}
);
} catch (error) {
console.log("❌ ERROR sendCatalog:", error.response?.data || error);
}
}

/* ============ MANEJO DE MENSAJES ============ */
export async function handleIncoming(from, message) {
const text = message?.text?.body?.toLowerCase() || "";

console.log("📩 Mensaje recibido:", text);

if (text === "" || text === undefined) {
return sendText(from, "👋 Envíanos un mensaje en texto para ayudarte.");
}

if (text.includes("hola") || text.includes("buen") || text.includes("menu")) {
return sendMenu(from);
}

if (text === "productos") {
return sendText(from, "🧾 Tenemos fiambres, quesos, bondiolas, jamón y más...");
}

if (text === "catalogo") {
return sendCatalog(from);
}

return sendMenu(from);
}
