import axios from "axios";

export async function sendText(to, text) {
try {
await axios.post(
`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
text: { body: text }
},
{
headers: {
Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
"Content-Type": "application/json"
}
}
);
} catch (error) {
console.log("❌ ERROR sendText:", error.response?.data || error);
}
}

// ✅ SALUDO + LOGO
export async function sendGreeting(to) {
try {
await axios.post(
`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "image",
image: {
link: "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png"
}
},
{
headers: {
Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
"Content-Type": "application/json"
}
}
);

await sendText(to, "¡Hola! 👋 Soy tu Bot 🤖\n¿En qué puedo ayudarte hoy?");
} catch (error) {
console.log("❌ ERROR sendGreeting:", error.response?.data || error);
}
}

// ✅ CATÁLOGO (Opción B: Link directo)
export async function sendCatalog(to) {
await sendText(
to,
"📦 *Catálogo Nuevo Munich*\n\nMirá todos los productos acá 👇\nhttps://nuevomunich.com.ar/catalogo\n\nSi querés te armo una *picada personalizada* 😉"
);
}

// ✅ RESPUESTA CON IA (Groq / Llama 3)
export async function sendAIResponse(to, userMessage) {
try {
const completion = await fetch("https://api.groq.com/openai/v1/chat/completions", {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${process.env.GROQ_API_KEY}`
},
body: JSON.stringify({
model: "llama-3-8b-instruct",
messages: [
{
role: "system",
content:
"Sos un vendedor cordial de Nuevo Munich (frigorífico artesanal). Respondés con tono vendedor real, amable, usando emojis naturales y ofreciendo recomendaciones."
},
{ role: "user", content: userMessage }
],
temperature: 0.8
})
});

const data = await completion.json();
const answer = data.choices?.[0]?.message?.content || "Perdón, repetímelo 🙏";

await sendText(to, answer);
} catch (error) {
console.log("❌ ERROR sendAIResponse:", error);
await sendText(to, "Uff, me mareé 😅 decime de nuevo porfa");
}
}

