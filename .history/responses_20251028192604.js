// ===================================================
// 🤖 BOT PROFESIONAL NUEVO MUNICH – Con catálogo dinámico y botones funcionales
// ===================================================

import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = process.env;
const CATALOG_PATH = path.resolve("catalog.json");

let CATALOG = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

// ===================================================
// 🔤 UTILIDADES
// ===================================================
const norm = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

function* walkProducts() {
  for (const cat of CATALOG.categories) {
    for (const p of cat.products) yield { cat, p };
  }
}

function findCategory(q) {
  const nq = norm(q);
  return CATALOG.categories.find(
    (c) =>
      nq.includes(norm(c.slug)) ||
      nq.includes(norm(c.title)) ||
      norm(c.title).includes(nq) ||
      norm(c.slug).includes(nq)
  );
}

function findProduct(q) {
  const nq = norm(q);
  for (const { cat, p } of walkProducts()) {
    const keys = [p.slug, p.name, ...(p.keywords || [])].map(norm);
    if (keys.some((k) => nq.includes(k))) return { cat, p };
  }
  return null;
}

// ===================================================
// 🚀 FUNCIÓN PRINCIPAL
// ===================================================
export async function handleUserMessage(to, message) {
  try {
    // Captura robusta de texto o botones
    let text =
      message?.interactive?.button_reply?.id?.toLowerCase() ||
      message?.interactive?.button_reply?.title?.toLowerCase() ||
      message?.interactive?.list_reply?.id?.toLowerCase() ||
      message?.text?.body?.toLowerCase() ||
      message?.button?.text?.toLowerCase() ||
      "";

    text = text.trim();
    console.log(`📩 Mensaje de ${to}: ${text}`);

    // ======== COMANDOS ADMIN ========
    if (text === "recargar catalogo" || text === "reload catalog") {
      CATALOG = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
      return sendTextMessage(to, "♻️ Catálogo recargado correctamente.");
    }

    // ======== MENÚ PRINCIPAL ========
    if (["hola", "buenas", "inicio", "menu", "menú"].some((w) => text.includes(w))) {
      return sendMainMenu(to);
    }

    // ======== HORARIOS / UBICACIÓN / CONTACTO ========
    if (text.includes("horario")) {
      const h = CATALOG.hours;
      return sendTextMessage(
        to,
        `⏰ *Horarios*\nLunes a Viernes: ${h.mon_fri}\nSábados: ${h.sat}${
          h.sun ? `\nDomingos: ${h.sun}` : ""
        }`
      );
    }

    if (text.includes("ubicacion") || text.includes("ubicación") || text.includes("donde")) {
      const c = CATALOG.contact;
      return sendTextMessage(to, `📍 *Dirección*\n${c.address}\n🗺️ Maps: ${c.maps}`);
    }

    if (text.includes("contacto") || text.includes("telefono") || text.includes("teléfono")) {
      const c = CATALOG.contact;
      return sendTextMessage(
        to,
        `📞 *Contacto*\nTel/WhatsApp: ${c.phone_display}\n🌐 Web: ${c.website}\n📸 Instagram: ${c.instagram}`
      );
    }

    if (text.includes("redes") || text.includes("instagram")) {
      const c = CATALOG.contact;
      return sendTextMessage(to, `📸 Instagram: ${c.instagram}\n🌐 Web: ${c.website}`);
    }

    // ======== VER PRODUCTOS ========
    if (text === "productos" || text.includes("ver productos") || text.includes("catalogo")) {
      return sendCategoriesMenu(to);
    }

    // ======== CATEGORÍAS ========
    const catHit = findCategory(text);
    if (catHit) {
      const listado = catHit.products.map((p) => `• ${p.name}`).join("\n");
      return sendTextMessage(
        to,
        `${catHit.title}\n${catHit.description}\n\n${listado}\n\nEscribí el *nombre del producto* para ver los detalles.`
      );
    }

    // ======== PRODUCTOS ========
    const prodHit = findProduct(text);
    if (prodHit) {
      const { p } = prodHit;
      const caption =
        `*${p.name} – ${CATALOG.brand}*\n` +
        (p.desc ? `${p.desc}\n` : "") +
        (p.ingredients ? `Ingredientes: ${p.ingredients}\n` : "") +
        (p.suggestions ? `Sugerencias: ${p.suggestions}\n` : "");
      if (p.image) return sendImageWithText(to, p.image, caption.trim());
      return sendTextMessage(to, caption.trim());
    }

    // ======== PEDIDOS ========
    if (text.includes("pedido") || text.includes("comprar") || text.includes("venta")) {
      return sendInteractiveMessage(to, {
        body: { text: `🛒 *Pedidos y Distribuidores*\nSeleccioná una opción:` },
        buttons: [
          { id: "pedido_minorista", title: "🥩 Pedido Minorista" },
          { id: "pedido_mayorista", title: "🏪 Pedido Mayorista" },
          { id: "menu", title: "🔙 Volver al menú" },
        ],
      });
    }

    // ======== MENSAJES NEUTROS ========
    const neutros = ["ok", "gracias", "dale", "perfecto", "genial", "👍", "👌", "listo"];
    if (neutros.some((w) => text.includes(w))) {
      return sendTextMessage(
        to,
        "😊 Gracias. Escribí *menú*, una *categoría* (p. ej. feteados) o un *producto* (p. ej. bondiola)."
      );
    }

    // ======== RESPUESTA POR DEFECTO ========
    return sendTextMessage(
      to,
      "🤖 No entendí bien tu consulta. Escribí *menú* para ver opciones, una *categoría* (feteados, salames, salchichas, ahumados, quesos) o el *nombre de un producto*."
    );
  } catch (err) {
    console.error("❌ Error en handleUserMessage:", err.response?.data || err.message);
  }
}

// ===================================================
// 📤 FUNCIONES DE ENVÍO
// ===================================================
async function sendTextMessage(to, body) {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      { messaging_product: "whatsapp", to, type: "text", text: { body } },
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
      { messaging_product: "whatsapp", to, type: "image", image: { link: imageUrl, caption } },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" } }
    );
    console.log(`🖼️ Imagen enviada a ${to}`);
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
    console.log(`🎛️ Botones enviados a ${to}`);
  } catch (e) {
    console.error("⚠️ Error al enviar botones:", e.response?.data || e.message);
  }
}

// ===================================================
// 🎛️ MENÚS
// ===================================================
async function sendMainMenu(to) {
  return sendInteractiveMessage(to, {
    body: {
      text: `🍻 *${CATALOG.brand}*\n${CATALOG.about}\n\nElegí una opción:`,
    },
    buttons: [
      { id: "productos", title: "🧾 Ver productos" },
      { id: "pedidos", title: "🛒 Hacer un pedido" },
      { id: "redes", title: "🌐 Redes / Web" },
    ],
  });
}

async function sendCategoriesMenu(to) {
  const names = CATALOG.categories.map((c) => `• ${c.title}`).join("\n");
  await sendTextMessage(
    to,
    `📂 *Categorías disponibles*\n${names}\n\nEscribí el *nombre de la categoría* o el *nombre de un producto*.`
  );
  return sendInteractiveMessage(to, {
    body: { text: "Atajos rápidos 👇" },
    buttons: [
      { id: "feteados", title: "🥩 Feteados" },
      { id: "salames", title: "🌭 Salames" },
      { id: "salchichas", title: "🌭 Salchichas" },
    ],
  });
}
