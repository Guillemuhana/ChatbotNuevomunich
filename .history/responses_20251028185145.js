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
    // Detectar texto o botones
    let text =
      message?.text?.body?.toLowerCase() ||
      message?.button?.text?.toLowerCase() ||
      "";

    console.log(`📩 Mensaje recibido de ${to}: ${text}`);

    // === SALUDO / MENÚ ===
    if (["hola", "buenas", "menú", "menu", "inicio"].some((w) => text.includes(w))) {
      return sendMenuPrincipal(to);
    }

    // === PRODUCTO BONDIOLA ===
    if (text.includes("bondiola")) {
      return sendImageWithText(
        to,
        "https://nuevomunich.com.ar/wp-content/uploads/2024/04/S1A9449-Bondiola-FETEADO.jpg",
        `🥩 *BONDIOLA NUEVO MUNICH*\n\nIngredientes: Bondiola de cerdo, pimienta negra, coriandro, sal y azúcar.\nSugerencias: Ideal para *tablas, picadas y sándwiches gourmet* 🧀🥖\n\n💡 Presentación al vacío – producto artesanal de primera calidad.`
      );
    }

    // === PRODUCTO JAMÓN ===
    if (text.includes("jamon") || text.includes("jamón")) {
      return sendTextMessage(
        to,
        `🍖 *Jamón Cocido Artesanal Nuevo Munich*\nElaborado con carne seleccionada de cerdo y un equilibrado sabor natural.\nPerfecto para sándwiches, picadas o preparaciones gourmet.`
      );
    }

    // === PEDIDOS / COMPRAS ===
    if (["pedido", "comprar", "venta"].some((w) => text.includes(w))) {
      return sendInteractiveMessage(to, {
        body: {
          text: `🛒 *Pedidos y Distribuidores*\n\nSeleccioná una opción:`,
        },
        buttons: [
          { id: "pedido_minorista", title: "🥩 Pedido Minorista" },
          { id: "pedido_mayorista", title: "🏪 Pedido Mayorista" },
          { id: "menu", title: "🔙 Volver al menú" },
        ],
      });
    }

    // === REDES / CONTACTO ===
    if (["redes", "instagram", "facebook", "contacto"].some((w) => text.includes(w))) {
      return sendTextMessage(
        to,
        `🌐 *Seguinos en nuestras redes:*\n📸 Instagram: https://www.instagram.com/nuevomunich/\n🌍 Web: https://nuevomunich.com.ar/\n📞 Tel: +54 9 351 559 0105`
      );
    }

    // === DEFAULT ===
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
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ Mensaje de texto enviado a ${to}`);
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
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
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
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ Menú interactivo enviado a ${to}`);
  } catch (e) {
    console.error("⚠️ Error al enviar menú interactivo:", e.response?.data || e.message);
  }
}

// ===================================================
// 🎛️ MENÚ PRINCIPAL
// ===================================================
async function sendMenuPrincipal(to) {
  return sendInteractiveMessage(to, {
    body: {
      text: `🍻 *Bienvenido a Nuevo Munich*  

Artesanos del Sabor
Fue en 1972 cuando los primeros dueños, de origen austríaco, trajeron sus recetas
heredadas de generaciones y generaciones de sabores centroeuropeos.  

Elegí una opción para continuar 👇`,
    },
    buttons: [
      { id: "productos", title: "🧾 Ver productos" },
      { id: "pedidos", title: "🛒 Hacer un pedido" },
      { id: "redes", title: "🌐 Redes sociales" },
    ],
  });
}
