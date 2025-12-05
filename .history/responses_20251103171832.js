import axios from "axios";
import "dotenv/config";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

// ✅ Enviar mensajes de texto
export async function sendMessage(to, message) {
await axios.post(
`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
text: { body: message }
},
{
headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
}
);
}

// ✅ Enviar imagen (logo bienvenida)
export async function sendImage(to, imageUrl) {
await axios.post(
`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "image",
image: { link: imageUrl }
},
{
headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
}
);
}

// ✅ IA CON GROQ / MISTRAL
async function askAI(prompt) {
try {
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${process.env.GROQ_API_KEY}`
},
body: JSON.stringify({
model: "mixtral-8x7b-32768",
messages: [
{
role: "system",
content: `Eres el asistente oficial de la marca "Nuevo Munich".
Responde amable y naturalmente, como vendedor experto en picadas,
fiambres, embutidos y productos regionales.
Solo menciona productos reales del negocio.
No inventes precios.`
},
{ role: "user", content: prompt }
]
})
});

const data = await response.json();
return data.choices[0].message.content;
} catch (e) {
console.log("⚠️ Error IA:", e.message);
return "Estoy aquí para ayudarte! 😄 ¿Podés repetirlo?";
}
}

// ✅ MANEJO DE MENSAJES ENTRANTES
export async function handleIncoming(body) {
try {
const entry = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
if (!entry) return; // Si no es mensaje texto, ignoramos

const from = entry.from;
const text = entry.text?.body || ""; // ← ✅ Manejo seguro, evita el error

// 👋 Bienvenida
if (text.toLowerCase() === "hola" || text.toLowerCase() === "buenas" || text.toLowerCase() === "hola!") {
await sendImage(from, "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png");
await sendMessage(from,
`👋 Bienvenido/a a *Nuevo Munich* 🥨
Somos especialistas en *picadas, fiambres y productos regionales*.
Decime, ¿qué te gustaría saber?

📦 *Catálogo:* escribí: catálogo
🌍 Web: https://nuevomunich.com.ar
📸 Instagram: https://instagram.com/nuevomunich.oficial`);
return;
}

// 📦 Catálogo
if (text.toLowerCase().includes("catalogo") || text.toLowerCase().includes("catálogo")) {
await sendMessage(from,
`📦 *Catálogo de productos Nuevo Munich*
https://nuevomunich.com.ar/`);
return;
}

// 🤖 CUALQUIER OTRA CONSULTA → IA
const aiReply = await askAI(text);
await sendMessage(from, aiReply);

} catch (err) {
console.log("❌ Error handleIncoming:", err.message);
}
}
