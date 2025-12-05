import axios from "axios";

const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = process.env;

// ✅ URL del LOGO subido
const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// ====== FUNCIONES DE ENVÍO ======
export async function sendText(to, body) {
return axios.post(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
messaging_product: "whatsapp",
to,
type: "text",
text: { body }
}, {
headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
});
}

export async function sendImage(to, imageUrl, caption = "") {
return axios.post(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
messaging_product: "whatsapp",
to,
type: "image",
image: { link: imageUrl, caption }
}, {
headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
});
}

export async function sendButtons(to, body, buttonsArray) {
return axios.post(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: body },
action: {
buttons: buttonsArray.map((b, i) => ({
type: "reply",
reply: { id: "BTN_" + i, title: b }
}))
}
}
}, {
headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
});
}

// ====== LÓGICA DEL BOT ======
export async function handleIncoming(from, text) {

// 🔹 MENSAJE DE BIENVENIDA
if (text === "" || text.includes("hola") || text.includes("menu") || text.includes("inicio")) {

await sendImage(from, LOGO_URL, "");

await sendButtons(
from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
["Productos", "Eventos", "Zonas de reparto", "Provincias", "Contacto"]
);

return;
}

// 🔹 RESPUESTAS
if (text.includes("productos")) {
return sendText(from, "Tenemos categorías como: *Feteados, Arrollados, Jamones, Salames y más.*\n\nDecime la categoría que querés ver 👇");
}

if (text.includes("contacto")) {
return sendText(from, "📞 Contacto directo ventas:\n*3517010545*\n✉️ ventas@nuevomunich.com.ar");
}

if (text.includes("eventos")) {
return sendText(from, "🎉 Realizamos presencia en *eventos gastronómicos, ferias y degustaciones*.\n¿Querés coordinar uno?");
}

if (text.includes("zonas de reparto")) {
return sendText(from, "🚚 Realizamos envíos en Córdoba y alrededores.\nConsultá tu zona y te confirmo.");
}

if (text.includes("provincias")) {
return sendText(from, "📦 Próximamente *envíos a todo el país*.");
}

return sendText(from, "No entendí bien 🤔\nProbá escribir: *productos, eventos, reparto, provincias o contacto*.");
}

