import { sendText, sendImage, sendButtons } from "./bot.js";

// ✅ URL del logo
const LOGO_URL = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

export async function handleIncoming(from, text) {
if (!text || text === "") return;

// ✅ Bienvenida (logo + opciones)
if (
["hola", "buenas", "inicio", "menu", "hola!"].some((w) =>
text.includes(w)
)
) {
await sendImage(from, LOGO_URL, "Artesanos del Sabor desde 1972.");
return sendButtons(from, "¿Qué necesitás?", [
{ id: "productos", title: "Productos" },
{ id: "eventos", title: "Eventos" },
{ id: "zonas", title: "Zonas de reparto" },
{ id: "provincias", title: "Provincias" },
{ id: "consultas", title: "Otras consultas" },
]);
}

// ✅ Productos -> Subcategorías
if (text.includes("productos")) {
return sendText(
from,
`📦 *Categorías de Productos*

• Escribí *feteados*
• Escribí *arrollados*
• Escribí *salames*
• Escribí *jamones*
• Escribí *salchichas*

(Usá una palabra clave)`
);
}

// ✅ Feteados (por ahora sin imágenes)
if (text.includes("feteados")) {
return sendText(
from,
`🥩 *Feteados de Primera Calidad*\n\n• Arrollado de Pollo\n• Bondiola\n• Lomo Ahumado\n• Lomito a las Finas Hierbas\n• Arrollado Cocido\n• Jamón Cocido\n• Panceta Salada Ahumada\n• Jamón Asado\n• Jamón Bávaro\n\nPronto enviamos *foto + descripción* automática.`
);
}

// ✅ Catálogo PDF
if (text.includes("catálogo") || text.includes("catalogo")) {
return sendText(
from,
`📄 *Catálogo completo:*\nhttps://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view`
);
}

// ✅ Eventos
if (text.includes("eventos")) {
return sendText(
from,
`🎉 *Eventos y Catering*\nConsultanos por propuestas para eventos, gastronomía y locales.\n\n📞 WhatsApp atención: 3517010545`
);
}

// ✅ Zonas
if (text.includes("zonas")) {
return sendText(
from,
`🚚 *Zonas de reparto*\nCórdoba Capital + interior según programación.\nConsultanos tu zona.`
);
}

// ✅ Provincias
if (text.includes("provincias")) {
return sendText(
from,
`🗺️ *Alcance nacional*\nDistribuimos a varias provincias mediante logística refrigerada.`
);
}

// ✅ Contacto
if (text.includes("contacto")) {
return sendText(
from,
`📞 *Contacto directo ventas:*\n3517010545\nventas@nuevomunich.com.ar`
);
}

// ✅ Último fallback
return sendText(
from,
`No entendí 🤔\nEscribí *hola* para ver el menú nuevamente.`
);
}

