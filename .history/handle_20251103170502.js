import { sendText, sendImage } from "./bot.js";
import { LINKS, buscarProductoPorTexto } from "./conocimiento.js";
import { responderIA } from "./ia.js";

const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export async function handleIncoming(to, rawText) {
const text = (rawText || "").toLowerCase().trim();

// 1) Bienvenida: logo + links + saludo (sin "soy tu bot")
if (["hola", "buenas", "menu", "inicio"].some(w => text.includes(w))) {
await sendImage(to, LOGO);
return sendText(
to,
`👋 *Bienvenido/a a Nuevo Munich*\nProductos artesanales desde 1972.\n\n🌐 ${LINKS.web}\n📸 Instagram: ${LINKS.instagram}\n\nContame qué estás buscando y te asesoro 🙂`
);
}

// 2) Intento detectar producto del catálogo (por palabras o sinónimos)
const encontrado = buscarProductoPorTexto(text);
if (encontrado) {
await sendImage(to, encontrado.imagen, `• ${encontrado.nombres[0]}\n${encontrado.descripcion}`);
return sendText(to, "¿Querés que te arme una propuesta o combo con este producto?");
}

// 3) Si no hay match, responde IA con el catálogo como contexto
const respuesta = await responderIA(text);
return sendText(to, respuesta);
}