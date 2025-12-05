// ===================================================
// 🤖 BOT PROFESIONAL - NUEVO MUNICH (con imágenes)
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
    // 🔍 Detectar correctamente texto o interacción
    let text =
      message?.text?.body?.toLowerCase() ||
      message?.button?.text?.toLowerCase() ||
      message?.interactive?.button_reply?.id?.toLowerCase() ||
      message?.interactive?.button_reply?.title?.toLowerCase() ||
      message?.interactive?.list_reply?.id?.toLowerCase() ||
      "";

    console.log(`📩 Mensaje recibido de ${to}: ${text}`);

    // === SALUDO / MENÚ ===
    if (["hola", "buenas", "inicio", "menu", "menú"].some(w => text.includes(w))) {
      return sendMenuPrincipal(to);
    }

    // === BOTÓN: PRODUCTOS ===
    if (text === "productos" || text.includes("producto")) {
      return sendProductosMenu(to);
    }

    // === BOTÓN: REDES ===
    if (text === "redes") {
      return sendTextMessage(
        to,
        `🌐 *Seguinos en nuestras redes:*\n📸 Instagram: https://www.instagram.com/nuevomunich/\n🌍 Web: https://nuevomunich.com.ar/\n📞 Tel: +54 9 351 559 0105`
      );
    }

    // === BOTÓN: PEDIDOS ===
    if (text === "pedidos" || text.includes("pedido") || text.includes("comprar")) {
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
        `🥩 *BONDIOLA NUEVO MUNICH*\n\nBondiola de cerdo curada con pimienta negra, coriandro, sal y azúcar.\nSugerencias: Ideal para tablas, picadas o sándwiches gourmet 🧀🥖\n💡 Presentación al vacío – producto artesanal de primera calidad.`
      );
    }

    if (text.includes("jamon") || text.includes("jamón")) {
      return sendTextMessage(
        to,
        `🍖 *Jamón Cocido Artesanal Nuevo Munich*\nElaborado con carne seleccionada de cerdo y sabor equilibrado.\nPerfecto para sándwiches o picadas.`
      );
    }

    // === POR DEFECTO ===
    return sendMenuPrincipal(to);
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
    console.log(`✅ Botones enviados a ${to}`);
  } catch (e) {
    console.error("⚠️ Error al enviar botones:", e.response?.data || e.message);
  }
}

// ===================================================
// 🎛️ MENÚS
// ===================================================
async function sendMenuPrincipal(to) {
  return sendInteractiveMessage(to, {
    body: {
      text: `🍻 *Bienvenido a Nuevo Munich*  
Elaboramos productos *artesanales de primera calidad* con más de 50 años de trayectoria.  

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
      { id: "menu", title: "🔙 Volver al menú" },
    ],
  });
}
