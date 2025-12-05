// ===================================================
// 🤖 BOT PROFESIONAL - NUEVO MUNICH (con imágenes)
// ===================================================
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = process.env;

// ===================================================
// 🚀 Función principal
// ===================================================
export async function handleUserMessage(to, text) {
  text = text.toLowerCase();

  if (["hola", "buenas", "menu", "inicio"].some(w => text.includes(w))) {
    return sendMenuPrincipal(to);
  }

  // --- PRODUCTO BONDIOLA ---
  if (text.includes("bondiola")) {
    return sendImageWithText(
      to,
      "https://nuevomunich.com.ar/wp-content/uploads/2024/04/S1A9449-Bondiola-FETEADO.jpg", // o la URL donde subas la imagen
      `🥩 *BONDIOLA NUEVO MUNICH*

Ingredientes: Bondiola de cerdo, pimienta negra, coriandro, sal y azúcar.  
Sugerencias: Ideal para *tablas, picadas y sándwiches gourmet* 🧀🥖  

💡 Presentación al vacío – producto artesanal de primera calidad.`
    );
  }

  // --- OTROS PRODUCTOS ---
  if (text.includes("jamon") || text.includes("jamón")) {
    return sendTextMessage(
      to,
      `🍖 *Jamón Cocido Artesanal Nuevo Munich*  
Elaborado con carne seleccionada de cerdo y un equilibrado sabor natural.  
Perfecto para sándwiches, picadas o preparaciones gourmet.`
    );
  }

  // --- PEDIDOS ---
  if (text.includes("pedido") || text.includes("comprar") || text.includes("venta")) {
    return sendInteractiveMessage(to, {
      body: {
        text: `🛒 *Pedidos y Distribuidores*

Podés elegir una opción:`
      },
      buttons: [
        { id: "pedido_minorista", title: "🥩 Pedido minorista" },
        { id: "pedido_mayorista", title: "🏪 Pedido mayorista" },
        { id: "menu", title: "🔙 Volver al menú" }
      ]
    });
  }

  // --- MENÚ PRINCIPAL POR DEFECTO ---
  return sendMenuPrincipal(to);
}

// ===================================================
// 📤 FUNCIONES DE ENVÍO
// ===================================================
async function sendTextMessage(to, body) {
  await axios.post(
    `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    },
    { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
  );
}

async function sendImageWithText(to, imageUrl, caption) {
  await axios.post(
    `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "image",
      image: { link: imageUrl, caption },
    },
    { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
  );
}

async function sendInteractiveMessage(to, { body, buttons }) {
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
    { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
  );
}

// ===================================================
// 🎛️ MENÚ PRINCIPAL
// ===================================================
async function sendMenuPrincipal(to) {
  await sendInteractiveMessage(to, {
    body: {
      text: `🍻 *Bienvenido a Nuevo Munich*  
Elaboramos productos *artesanales de primera calidad*, con más de 50 años de experiencia.

Elegí una opción para continuar 👇`,
    },
    buttons: [
      { id: "productos", title: "🧾 Ver productos" },
      { id: "pedidos", title: "🛒 Hacer un pedido" },
      { id: "redes", title: "🌐 Redes sociales" },
    ],
  });
}
