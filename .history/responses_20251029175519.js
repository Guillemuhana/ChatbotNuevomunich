import { sendText, sendImage, sendButtons } from "./bot.js";

// Logo hosteado (funciona en WhatsApp)
const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export async function handleIncoming(from, text) {

// ================= PRIMERA ENTRADA ================= //
if (text === "" || text === "hola" || text === "menu" || text === "inicio") {
await sendImage(from, LOGO_URL, "");
return sendButtons(
from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
["Productos", "Eventos", "Zonas de reparto", "Provincias", "Contacto"]
);
}

// ================= MENÚ PRINCIPAL ================= //
if (text.includes("productos")) {
return sendButtons(
from,
"Seleccioná una categoría 👇",
["Feteados", "Arrollados", "Salames", "Volver"]
);
}

if (text.includes("eventos")) {
return sendText(from, "🎉 Nuevo Munich participa en eventos gastronómicos.\nConsultá disponibilidad enviando:\n\n*evento + fecha + cantidad*");
}

if (text.includes("zonas de reparto")) {
return sendText(from, "🚚 Reparto en Córdoba Capital.\nEnvianos tu zona y dirección para confirmar.");
}

if (text.includes("provincias")) {
return sendText(from, "🇦🇷 Envíos a todo el país mediante transporte refrigerado.");
}

if (text.includes("contacto")) {
return sendText(from, "☎️ Ventas y atención:\nWhatsApp directo: *3517010545*\nEmail: ventas@nuevomunich.com.ar");
}

// ================= SUBCATEGORIA → FETEADOS ================= //
if (text.includes("feteados")) {
return sendText(
from,
"🥩 *Feteados disponibles:*\n\n• Bondiola\n• Arrollado de Pollo\n• Jamón Cocido\n\n(Escribí el nombre para ver la imagen)"
);
}

// == PRODUCTO: BONDIOLA == //
if (text.includes("bondiola")) {
return sendImage(
from,
"https://i.postimg.cc/4NfxCw7f/bondiola.jpg",
"🥩 *Bondiola Feteada*\nIdeal para picadas y sándwiches gourmet."
);
}

// == PRODUCTO: ARROLLADO == //
if (text.includes("arrollado")) {
return sendImage(
from,
"https://i.postimg.cc/52GKYRtZ/Arrollado-de-Pollo.jpg",
"🐔 *Arrollado de Pollo Feteado*\nSuave, sabroso y artesanal."
);
}

// ================= DEFAULT ================= //
return sendText(from, "No te entendí 🤔\nProbá escribir *hola* para volver al menú.");
}
