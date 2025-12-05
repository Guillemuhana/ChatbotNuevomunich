import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export async function handleIncoming(from, text) {

if (!text || ["hola","menu","inicio","hey","buenas"].some(t => text.includes(t))) {

await sendImage(from, LOGO_URL, "");
await new Promise(r => setTimeout(r, 900));

return sendButtons(from,
"Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
["Productos", "Eventos", "Más opciones"]
);
}

if (text.includes("más opciones") || text.includes("opciones")) {
return sendButtons(from,
"Elegí una opción 👇",
["Zonas de reparto", "Provincias", "Contacto"]
);
}

if (text.includes("productos")) {
return sendText(from, "📦 *Categorías:* Feteados, Arrollados, Jamones, Salames.\nDecime cuál querés ver 👇");
}

if (text.includes("eventos")) {
return sendText(from, "🎉 Participamos en eventos gastronómicos. Consultanos fechas.");
}

if (text.includes("zonas")) {
return sendText(from, "🚚 Enviamos a Córdoba Capital y alrededores.\nDecime tu barrio 👇");
}

if (text.includes("provincias")) {
return sendText(from, "🇦🇷 Mandamos a todo el país con logística refrigerada.");
}

if (text.includes("contacto")) {
return sendText(from, "📞 Ventas: *3517010545*\n✉️ ventas@nuevomunich.com.ar");
}

return sendText(from, "No entendí 🤔\nEscribí *hola* para ver el menú.");
}

