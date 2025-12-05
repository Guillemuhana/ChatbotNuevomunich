import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const sendMessage = async (to, text) => {
await axios.post(
`https://graph.facebook.com/v17.0/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
text: { body: text },
},
{
headers: {
Authorization: `Bearer ${WHATSAPP_TOKEN}`,
"Content-Type": "application/json",
},
}
);
};

// ✅ LOGO + SALUDO
export const sendGreeting = async (to) => {
// Mandar imagen/logo
await axios.post(
`https://graph.facebook.com/v17.0/${PHONE_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "image",
image: {
link: "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png",
caption: "",
},
},
{
headers: {
Authorization: `Bearer ${WHATSAPP_TOKEN}`,
"Content-Type": "application/json",
},
}
);

// Mensaje luego del logo
await sendMessage(
to,
"¡Hola! 👋 Soy tu Bot 🤖\n¿En qué puedo ayudarte hoy?"
);
};

// ✅ CATÁLOGO
export const sendCatalog = async (to) => {
await sendMessage(
to,
"📦 *Catálogo Nuevo Munich*\n\nAquí podés ver todos nuestros productos 👇\nhttps://nuevomunich.com.ar/"
);
};

// ✅ RESPUESTA CON IA (GROQ)
export const sendAIResponse = async (to, userMessage) => {
try {
const completion = await fetch("https://api.groq.com/openai/v1/chat/completions", {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${GROQ_API_KEY}`,
},
body: JSON.stringify({
model: "llama-3.1-70b-versatile",
messages: [
{
role: "system",
content: `Sos un asistente del negocio *Nuevo Munich*.
Responde como vendedor real, amable y directo.
No inventes precios. Si te preguntan por valores respondé:
"Los precios pueden variar, ¿de qué localidad sos?".
Siempre que piden una picada, recomendá combinaciones reales.` },
{ role: "user", content: userMessage }
],
temperature: 0.7,
}),
});

const data = await completion.json();
const reply = data.choices?.[0]?.message?.content || "¡Listo! ¿Algo más? 😊";

await sendMessage(to, reply);

} catch (err) {
console.log("❌ ERROR IA:", err);
await sendMessage(to, "Tuve un problema interpretando eso 🤔 decímelo de nuevo.");
}
};