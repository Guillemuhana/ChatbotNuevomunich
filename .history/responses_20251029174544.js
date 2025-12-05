import { sendText, sendImage, sendButtons } from "./bot.js";

const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export async function handleIncoming(from, text) {
if (!text) return;

// ======== BIENVENIDA ========
if (["hola", "buenas", "inicio", "menu"].some((w) => text.includes(w))) {
await sendImage(from, LOGO_URL, "Artesanos del Sabor desde 1972.");
return sendButtons(from, "¿Qué necesitás?", [
{ id: "productos", title: "Productos" },
{ id: "eventos", title: "Eventos" },
{ id: "zonas", title: "Zonas de reparto" },
{ id: "provincias", title: "Provincias" },
{ id: "consultas", title: "Otras consultas" },
]);
}

// ======== PRODUCTOS ========
if (text.includes("productos")) {
return sendText(
from,
`📦 *Categorías de Productos*\n\n• Escribí *feteados*\n• Escribí *arrollados*\n• Escribí *salames*\n• Escribí *jamones*\n• Escribí *salchichas*\n\n(mandá solo la palabra)`
);
}

// ======== FETEADOS ========
if (text.includes("feteados")) {
return sendText(
from,
`🥩 *Feteados disponibles:*\n\n• Arrollado de Pollo\n• Bondiola\n• Lomo Ahumado\n• Lomito Hierbas\n• Arrollado Cocido\n• Jamón Cocido\n• Panceta Ahumada\n• Jamón Asado\n• Jamón Bávaro\n\n(Pronto se enviarán *imágenes automáticas* 🟢)`
);
}

// ======== CATÁLOGO ========
if (text.includes("catálogo") || text.includes("catalogo")) {
return sendText(
from,
`📄 *Catálogo completo:* https://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view`
);
}

// ======== EVENTOS ========
if (text.includes("eventos")) {
return sendText(
from,
`🎉 *Eventos y Gastronomía*\nConsultanos propuestas para eventos y restaurantes.\n📞 3517010545`
);
}

// ======== ZONAS ========
if (text.includes("zonas")) {
return sendText(
from,
`🚚 *Zonas de reparto*\nCórdoba Capital + Interior.\nConsultá tu dirección.`
);
}

// ======== PROVINCIAS ========
if (text.includes("provincias")) {
return sendText(
from,
`🗺️ Distribuimos a varias provincias con logística refrigerada.`
);
}

// ======== CONTACTO ========
if (text.includes("contacto")) {
return sendText(
from,
`📞 *Ventas:* 3517010545\n📧 ventas@nuevomunich.com.ar`
);
}

// ======== DESPEDIDA ========
return sendText(from, `No entendí 🤔\nEscribí *hola* para volver al menú.`);
}
