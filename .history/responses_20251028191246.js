// responses.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = process.env;

export async function handleUserMessage(to, message) {
  try {
    let text =
      message?.text?.body?.toLowerCase() ||
      message?.button?.text?.toLowerCase() ||
      message?.interactive?.button_reply?.id?.toLowerCase() ||
      message?.interactive?.button_reply?.title?.toLowerCase() ||
      message?.interactive?.list_reply?.id?.toLowerCase() ||
      "";
    text = text.trim();
    console.log(`📩 Mensaje recibido de ${to}: ${text}`);

    // Saludo / menú principal
    if (["hola", "buenas", "inicio", "menu", "menú"].some(w => text.includes(w))) {
      return sendMenuPrincipal(to);
    }

    // Categorías
    if (text.includes("feteados")) {
      return sendTextMessage(
        to,
        `🥩 *Categoría: Feteados*  
Nuestros productos feteados son envasados al vacío (~100 g), ideales para tablas y sándwiches gourmet.

Productos destacados:
• Bondiola  
• Arrollado de Pollo  
• Panceta Cocida Ahumada  
• Lomo Horneado & Ahumado  
• Lomo de Cerdo Cocido  
• Jamón Tipo Bávaro Cocido  
• Jamón Cocido  
• Jamón Tipo Asado  
• Arrollado Criollo`
      );
    }
    if (text.includes("jamones") || text.includes("jamón")) {
      return sendTextMessage(
        to,
        `🍖 *Categoría: Jamones*  
Elaborados artesanalmente: Jamón Tipo Bávaro Cocido, Jamón Cocido, Jamón Tipo Asado.  
Ideal para tablas, sándwiches o picadas.`
      );
    }
    if (text.includes("arrollados")) {
      return sendTextMessage(
        to,
        `🍗 *Categoría: Arrollados*  
Arrollado de Pollo, Arrollado Criollo y otros productos gourmet, con recetas tradicionales centroeuropeas.`
      );
    }
    if (text.includes("salames")) {
      return sendTextMessage(
        to,
        `🌭 *Categoría: Salames*  
Salame Tipo Alpino Ahumado, Salame Tipo Colonia, Salame Holstein Ahumado.  
Curados lentamente para sabor auténtico.`
      );
    }
    if (text.includes("salchichas")) {
      return sendTextMessage(
        to,
        `🌭 *Categoría: Salchichas*  
Salchicha Tipo Viena, Tipo Knackwurst, Húngara, etc. Ideal para plato rápido o evento.`
      );
    }

    // Producto específico
    if (text.includes("bondiola")) {
      return sendImageWithText(
        to,
        "https://nuevomunich.com.ar/wp-content/uploads/2024/04/S1A9449-Bondiola-FETEADO.jpg",
        `🥩 *Bondiola Nuevo Munich*  
Ingredientes: Bondiola de cerdo, pimienta negra, coriandro, sal y azúcar.  
Sugerencias: Ideal para tablas y sándwiches.`
      );
    }
    if (text.includes("arrollado de pollo")) {
      return sendTextMessage(
        to,
        `🍗 *Arrollado de Pollo*  
Pechuga deshuesada de pollo, huevo, zanahoria, ají molido y orégano.  
Sugerencia: Acompañar con ensalada o en tabla.`
      );
    }

    // Pedidos / contacto
    if (text.includes("pedido") || text.includes("comprar") || text.includes("venta")) {
      return sendInteractiveMessage(to, {
        body: { text: `🛒 *Pedidos y Distribuidores*  
Seleccioná una opción:` },
        buttons: [
          { id: "pedido_minorista", title: "🥩 Pedido Minorista" },
          { id: "pedido_mayorista", title: "🏪 Pedido Mayorista" },
          { id: "menu", title: "🔙 Volver al menú" }
        ]
      });
    }

    // Redes sociales / web
    if (text.includes("redes") || text.includes("instagram") || text.includes("facebook") || text.includes("contacto")) {
      return sendTextMessage(
        to,
        `🌐 *Conectate con Nuevo Munich*  
Instagram: https://www.instagram.com/nuevomunich/  
Web: https://nuevomunich.com.ar/  
Tel/WhatsApp: +54 9 351 701-0545`
      );
    }

    // Mensajes neutros
    const neutros = ["ok", "gracias", "dale", "perfecto", "genial", "👍", "👌", "listo"];
    if (neutros.some(w => text.includes(w))) {
      return sendTextMessage(
        to,
        "😊 Gracias por tu mensaje. Si necesitás algo más, escribí *menú* o el nombre de un producto."
      );
    }

    // Default: no entendido
    return sendTextMessage(
      to,
      "🤖 No entendí bien tu consulta. Escribí *menú* para ver las opciones o el nombre de un producto."
    );
  } catch (err) {
    console.error("❌ Error procesando mensaje:", err.response?.data || err.message);
  }
}

async function sendTextMessage(to, body) {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body }
      },
      {
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" }
      }
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
        image: { link: imageUrl, caption }
      },
      {
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" }
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
            buttons: buttons.map(b => ({
              type: "reply",
              reply: { id: b.id, title: b.title }
            }))
          }
        }
      },
      {
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" }
      }
    );
    console.log(`✅ Menú interactivo enviado a ${to}`);
  } catch (e) {
    console.error("⚠️ Error al enviar menú interactivo:", e.response?.data || e.message);
  }
}

async function sendMenuPrincipal(to) {
  return sendInteractiveMessage(to, {
    body: {
      text: `🍻 *Bienvenido a Nuevo Munich*  
Elaboramos productos artesanales de primera calidad desde 1972.  
Elegí una opción para continuar 👇`
    },
    buttons: [
      { id: "productos", title: "🧾 Ver productos" },
      { id: "pedidos", title: "🛒 Hacer un pedido" },
      { id: "redes", title: "🌐 Redes sociales" }
    ]
  });
}
