import { sendText, sendImage, sendButtons } from "./bot.js";
import Groq from "groq-sdk";
import { productos, sinonimos } from "./productos.js";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export async function handleIncoming(from, msg) {

// ✅ SALUDO CON LOGO SIEMPRE
if (["hola", "buenas", "menu", "inicio"].includes(msg)) {
await sendImage(from, LOGO, "Nuevo Munich 🍺 Artesanos del sabor desde 1972.");
return sendButtons(from,
"*¿En qué podemos ayudarte?* 👇",
[
{ id: "productos", title: "🧾 Productos" },
{ id: "eventos", title: "🎉 Eventos" },
{ id: "catalogo", title: "📎 Ver Catálogo" },
{ id: "pedido", title: "🛒 Hacer Pedido" }
]
);
}

// ✅ PRODUCTOS (reconocer por nombre o sinónimos)
let key = productos[msg] ? msg : sinonimos[msg];
if (key && productos[key]) {
return sendImage(from, productos[key].img, productos[key].texto);
}

// ✅ SI EL USUARIO HABLA LIBRE → IA ACTIVA
const response = await client.chat.completions.create({
model: "llama-3.1-8b-instant",
messages: [
{
role: "system",
content: "Sos un vendedor de picadas amigable y directo. Recomendá productos sin exagerar."
},
{ role: "user", content: msg }
]
});

return sendText(from, response.choices[0].message.content);
}

