import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID;

// ================================
// 🔹 ENVIAR TEXTO
// ================================
export async function sendText(to, body) {
try {
const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
await axios.post(
url,
{
messaging_product: "whatsapp",
to,
text: { body }
},
{ headers: { Authorization: `Bearer ${token}` } }
);
} catch (err) {
console.error("❌ Error al enviar mensaje:", err?.response?.data || err);
}
}

// ================================
// 🔹 ENVIAR BOTONES
// ================================
export async function sendButtons(to, body, buttons) {
try {
const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

await axios.post(
url,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: body },
action: { buttons }
}
},
{ headers: { Authorization: `Bearer ${token}` } }
);
} catch (err) {
console.error("❌ Error al enviar botones:", err?.response?.data || err);
}
}

// ================================
// 🔹 MENÚ PRINCIPAL
// ================================
export async function sendMenuPrincipal(to) {
const mensaje = `*Nuevo Munich*
Artesanos del sabor desde 1972.

🌐 ${process.env.WEB_URL}
📸 ${process.env.INSTAGRAM_URL}

Elegí una opción ⬇️`;

await sendButtons(to, mensaje, [
{ type: "reply", reply: { id: "PICADAS", title: "🥨 Picadas" } },
{ type: "reply", reply: { id: "PRODUCTOS", title: "🧂 Productos" } },
{ type: "reply", reply: { id: "PEDIDO", title: "📝 Hacer pedido" } }
]);
}

// ================================
// 🔹 RESPUESTA PARA PICADAS
// ================================
export function sendPicadasIntro(to) {
return sendText(
to,
"🥨 ¡Genial! Contame para cuántas personas querés armar la picada."
);
}

// ================================
// 🔹 RESPUESTA PARA PRODUCTOS
// ================================
export function sendProductosIntro(to) {
return sendText(
to,
"🧂 Contamos con embutidos y especialidades artesanales.\nDecime qué producto te interesa 😄"
);
}

// ================================
// 🔹 INICIO DE PEDIDO
// ================================
export function sendPedidoInicio(to) {
return sendText(
to,
"📝 Perfecto, para iniciar tu pedido decime:\n\n• Nombre\n• Productos que querés llevar\n\nLuego confirmamos disponibilidad y coordinamos entrega."
);
}

