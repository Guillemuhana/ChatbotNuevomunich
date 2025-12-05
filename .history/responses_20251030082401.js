import { sendText, sendImage, sendButtons } from "./bot.js";

// Logo hosteado (no cambia, funciona perfecto para WhatsApp)
const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export async function handleIncoming(from, text) {

  // ================== BIENVENIDA ==================
  if (!text || text.includes("hola") || text.includes("inicio") || text.includes("menu")) {

    // 1) Enviar logo
    await sendImage(from, LOGO_URL, "");

    // 2) Pausa necesaria para que WhatsApp muestre los botones ✅
    await new Promise(resolve => setTimeout(resolve, 900));

    // 3) Enviar menú principal
    await sendButtons(
      from,
      "Artesanos del Sabor desde 1972.\n\n¿Qué necesitás?",
      ["Productos", "Eventos", "Zonas de reparto", "Provincias", "Contacto"]
    );

    return;
  }

  // ================== OPCIONES PRINCIPALES ==================
  if (text.includes("productos")) {
    return sendText(
      from,
      "📦 *Categorías de Productos*\n\n• Feteados\n• Arrollados\n• Jamones\n• Salames\n\nDecime la categoría 👇"
    );
  }

  if (text.includes("eventos")) {
    return sendText(from, "🎉 Realizamos presencia en eventos gastronómicos y degustaciones.\nConsultanos disponibilidad.");
  }

  if (text.includes("zonas")) {
    return sendText(from, "🚚 Reparto en Córdoba Capital y alrededores.\nEnviame tu barrio y te confirmo.");
  }

  if (text.includes("provincias")) {
    return sendText(from, "🇦🇷 Envíos a todo el país mediante logística refrigerada.");
  }

  if (text.includes("contacto")) {
    return sendText(from, "📞 Ventas y atención:\n*3517010545*\n✉️ ventas@nuevomunich.com.ar");
  }

  // ================== CATEGORÍA: FETEADOS ==================
  if (text.includes("feteados")) {
    return sendText(
      from,
      "🥩 *Feteados disponibles:*\n\n• Bondiola\n• Arrollado de Pollo\n• Jamón Cocido\n\nEscribí el nombre del producto para ver la imagen."
    );
  }

  // === Producto BONDIOLA === //
  if (text.includes("bondiola")) {
    return sendImage(
      from,
      "https://i.postimg.cc/4NfxCw7f/bondiola.jpg",
      "🥩 *Bondiola Feteada*\nIdeal para picadas y sándwiches gourmet."
    );
  }

  // === Producto ARROLLADO === //
  if (text.includes("arrollado")) {
    return sendImage(
      from,
      "https://i.postimg.cc/52GKYRtZ/Arrollado-de-Pollo.jpg",
      "🐔 *Arrollado de Pollo Feteado*\nSuave, sabroso y artesanal."
    );
  }

  // ================== DEFAULT ==================
  return sendText(from, "No entendí bien 🤔\nProbá escribir *hola* para volver al menú.");
}
