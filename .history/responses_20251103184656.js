import axios from "axios";
import { procesarMensajeIA } from "./ia.js";

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_ID;

// ✅ Enviar texto normal
async function sendText(to, text) {
await axios.post(
`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
{
messaging_product: "whatsapp",
to,
text: { body: text }
},
{ headers: { Authorization: `Bearer ${token}` } }
);
}

// ✅ Enviar botones para opciones de picadas
async function sendPicadaButtons(to) {
await axios.post(
`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una opción 👇" },
action: {
buttons: [
{ type: "reply", reply: { id: "PICADA_2", title: "🥨 Picada para 2" } },
{ type: "reply", reply: { id: "PICADA_4", title: "🧀 Picada para 4" } },
{ type: "reply", reply: { id: "CATALOGO", title: "📦 Ver Catálogo" } },
],
},
},
},
{ headers: { Authorization: `Bearer ${token}` } }
);
}

// ✅ Manejo del mensaje recibido
export async function handleIncoming(text, to) {
try {
const lower = text.toLowerCase();

// Si pregunta por picada → mostrar botones
if (lower.includes("picada") || lower.includes("picadas")) {
await sendPicadaButtons(to);
return;
}

// Si toca botón "Ver catálogo"
if (lower === "catalogo" || lower === "📦 ver catálogo") {
await sendText(to, "📦 Catálogo completo:\nhttps://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view");
return;
}

// Si toca botón de picadas específicas
if (lower === "picada_2") {
await sendText(to, "🥨 Picada para 2 → Ideal para compartir.\nSuele incluir 300g total entre quesos y fiambres.\n¿Querés armar una personalizada?");
return;
}

if (lower === "picada_4") {
await sendText(to, "🧀 Picada para 4 → Recomendamos 600–700g total.\nPuedo sugerirte combinaciones según lo que te guste 😄");
return;
}

// ✅ Caso general → responder con IA
const respuesta = await procesarMensajeIA(text);
await sendText(to, respuesta);

} catch (e) {
console.error("⚠️ Error handleIncoming:", e);
await sendText(to, "Hubo un inconveniente procesando tu mensaje 😔 ¿Podés repetirlo?");
}
}

