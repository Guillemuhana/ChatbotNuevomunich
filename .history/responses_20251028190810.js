// ===================================================
// 🤖 BOT PROFESIONAL - NUEVO MUNICH (con imágenes y control de repeticiones)
// ===================================================
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = process.env;

// ===================================================
// 🚀 FUNCIÓN PRINCIPAL
// ===================================================
export async function handleUserMessage(to, message) {
  try {
    // 🔍 Detección robusta de texto, botones o interacciones
    let text =
      message?.text?.body?.toLowerCase() ||
      message?.button?.text?.toLowerCase() ||
      message?.interactive?.button_reply?.id?.toLowerCase() ||
      message?.interactive?.button_reply?.title?.toLowerCase() ||
      message?.interactive?.list_reply?.id?.toLowerCase() ||
      "";

    text = text.trim();

    console.log(`📩 Mensaje recibido de ${to}: ${text}`);

    // === SALUDO / MENÚ PRINCIPAL ===
    if (["hola", "buenas", "inicio", "menu", "menú"].some((w) => text.includes(w))) {
      return sendMenuPrincipal(to);
    }

    // === BOTÓN / PALABRA: PRODUCTOS ===
    if (text === "productos" || text.includes("producto")) {
      return sendProductosMenu(to);
    }

    // === BOTÓN / PALABRA: REDES ===
    if (text === "redes" || text.includes("instagram") || text.includes("facebook")) {
      return sendTextMessage(
        to,
        `🌐 *Seguinos en nuestras redes:*\n📸 Instagram: https://www.instagram.com/nuevomunich/\n🌍 Web: https://nuevomunich.com.ar/\n📞 Tel: +54 9 351 559 0105`
      );
    }

    // === BOTÓN / PALABRA: PEDIDOS ===
    if (text === "pedidos" || text.includes("pedido") || text.includes("comprar") || text.includes("venta")) {
      return sendInteractiveMessage(to, {
        body: { text: `🛒 *Pedidos y Distribuidores*\nSeleccioná una opción:` },
        buttons: [
          { id: "pedido_minorista", title: "🥩 Pedido Minorista" },
          { id: "pedido_mayorista", title: "🏪 Pedido Mayorista" },
          { id: "menu", title: "🔙 Volver al menú" },
        ],
      });
    }

    // === PRODUCTOS ESPECÍFICOS ===
    if (text.includes("bondiola")) {
      return sendImageWithText(
        to,
        "https://nuevomunich.com.ar/wp-content/uploads/2024/04/S1A9449-Bondiola-FETEADO.jpg",
        `🥩 *BONDIOLA NUEVO MUNICH*\n\nBondiola de cerdo curada con pimienta negra, coriandro, sal y azúcar.\nSugerencias: Ideal para *tablas, picadas y sándwiches gourmet* 🧀🥖\n💡 Presentación al vacío – producto artesanal de primera calidad.`
      );
    }

    if (text.includes("jamon") || text.includes("jamón")) {
      return sendTextMessage(
        to,
        `🍖 *Jamón Cocido Artesanal Nuevo Munich*\nElaborado con carne seleccionada de cerdo y sabor equilibrado.\nPerfecto para sándwiches, picadas o preparaciones gourmet.`
      );
    }

    if (text.includes("salame") || text.includes("salami")) {
      return sendTextMessage(
        to,
        `🌭 *Salame Tipo Tandilero*\nClásico sabor artesanal, curado lentamente. Ideal para picadas o tapas.\nPresentación: al vacío o entero.`
      );
    }

    if (text.includes("queso")) {
      return sendTextMessage(
        to,
        `🧀 *Queso Saborizado Nuevo Munich*\nVariedades con orégano, pimienta o especias suaves.\nPerfectos para picadas o acompañar fiambres.`
      );
    }

    // === MENSAJES NEUTROS (no repetir menú) ===
    const neutros = ["ok", "gracias", "dale", "perfecto", "genial", "👍", "👌", "listo", "okey"];
    if (neutros.some((w) => text.includes(w))) {
      return sendTextMessage(
        to,
        "😊 ¡Gracias por tu mensaje! Si necesitás algo más, escribí *menú* o el nombre de un producto."
      );
    }

    // === SI NO SE ENTIENDE LA CONSULTA ===
    if (text && text.length > 0) {
      return sendTextMessage(
        to,
        "🤖 No entendí bien tu consulta. Escribí *menú* para ver las opciones o el nombre de un producto (por ejemplo: 'bondiola', 'jamón', 'queso')."
      );
    }

  } catch (err) {
    console.error("❌ Error procesando mensaje:", err.response?.data || err.message);
  }
}

// ===================================================
// 📤 FUNCIONES DE ENVÍO
// ===================================================
async function sendTextMessage(to, body) {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" } }
    );
    console.log(`✅ Texto enviado a ${to}`);
  } catch (e) {
    console.error("⚠️ Error al enviar texto:", e.response?.data || e.message);
  }
}

async function sendImageWithText(to, imageUrl, caption) {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "image",
        image: { link: imageUrl, caption },
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" } }
    );
    console.log(`✅ Imagen enviada a ${to}`);
  } catch (e) {
    console.error("⚠️ Error al enviar imagen:", e.response?.data || e.message);
  }
}

async function sendInteractiveMessage(to, { body, buttons }) {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body,
          action: {
            buttons: buttons.map((b) => ({
              type: "reply",
              reply: { id: b.id, title: b.title },
            })),
          },
        },
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" } }
    );
    console.log(`✅ Menú enviado a ${to}`);
  } catch (e) {
    console.error("⚠️ Error al enviar menú:", e.response?.data || e.message);
  }
}

// ===================================================
// 🎛️ MENÚS
// ===================================================
async function sendMenuPrincipal(to) {
  return sendInteractiveMessage(to, {
    body: {
      text: `🍻 *Bienvenido a Nuevo Munich*  
Elaboramos productos *artesanales de primera calidad* con más de 50 años de experiencia.  

Elegí una opción para continuar 👇`,
    },
    buttons: [
      { id: "productos", title: "🧾 Ver productos" },
      { id: "pedidos", title: "🛒 Hacer un pedido" },
      { id: "redes", title: "🌐 Redes sociales" },
    ],
  });
}

async function sendProductosMenu(to) {
  return sendInteractiveMessage(to, {
    body: {
      text: `🥩 *Categorías de Productos*  
Seleccioná una opción para conocer más 👇`,
    },
    buttons: [
      { id: "bondiola", title: "🥩 Bondiola" },
      { id: "jamon", title: "🍖 Jamón Cocido" },
      { id: "salame", title: "🌭 Salame" },
      { id: "queso", title: "🧀 Quesos saborizados" },
      { id: "menu", title: "🔙 Volver al menú" },
    ],
  });
}
