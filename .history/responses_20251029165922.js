// responses.js
import { sendText, sendImage, sendFile } from "./bot.js";
import fs from "fs";

export async function handleIncoming(message) {
const from = message.from;
const text = message.text?.body?.toLowerCase() || "";

// --- BIENVENIDA ---
if (["hola", "buenas", "hi"].some(w => text.includes(w))) {
await sendImage(from, "https://i.ibb.co/nMy6wHG/Nuevo-Munich-Logo.png",
`Nuevo Munich\nArtesanos del Sabor desde 1972.\n\n¿Qué necesitás?\n- Escribí *feteados*\n- Escribí *catálogo*\n- Escribí *contacto*`);
return;
}

// --- FETEADOS ---
if (text.includes("fetea")) {
await sendText(from, "Te paso nuestros productos feteados 🥩");
await sendImage(from, "https://i.ibb.co/5FQn4Lq/bondiola.jpg", "Bondiola Feteada");
await sendImage(from, "https://i.ibb.co/xM7pYHy/arollado-pollo.jpg", "Arrollado de Pollo Feteado");
return;
}

// --- CATÁLOGO PDF ---
if (text.includes("catalog") || text.includes("catálogo")) {
await sendText(from, "📄 Te envío nuestro catálogo completo:");
await sendFile(from, "https://nuevomunich.com.ar/wp-content/uploads/2024/09/catalogo.pdf");
return;
}

// --- CONTACTO ---
if (text.includes("contact") || text.includes("pedido") || text.includes("comprar")) {
await sendText(from,
`📞 *Contacto Ventas*\nWhatsApp: 3517010545\nEmail: ventas@nuevomunich.com.ar\n\n¿Sos negocio, distribuidor u hotel? Podés consultar sin compromiso.`);
return;
}

// --- SI NO ENTIENDE ---
await sendText(from, "No te entendí bien 🤔\nEscribí alguna de estas opciones:\n- *feteados*\n- *catálogo*\n- *contacto*");
}