// ===================================================
// 🤖 NUEVO MUNICH – Flow cálido + Formulario con Email
// ===================================================
import fs from "fs";
import path from "path";
import axios from "axios";
import nodemailer from "nodemailer";
import "dotenv/config";

const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = process.env;
const CATALOG_PATH = path.resolve("catalog.json");

// ========================= Catalogo =========================
let CATALOG = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

// ========================= Email (SMTP) =====================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // true si usás 465
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
const MAIL_TO = process.env.MAIL_TO || "ventas@nuevomunich.com.ar";
const MAIL_FROM = process.env.MAIL_FROM || '"Nuevo Munich – Ventas" <no-reply@nuevomunich.com.ar>';

// =================== Anti-spam Bienvenida ===================
const lastWelcomeAt = new Map();
const WELCOME_COOLDOWN_MS = 60_000;

// ====================== Sesiones (RAM) ======================
const sessions = {}; // { [phone]: { mode, step, data } }

const MODES = {
  MINORISTA: "minorista",
  MAYORISTA: "mayorista"
};

// ========================= Utils ============================
const norm = (s = "") =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
const hasAny = (text, arr) => arr.some(k => norm(text).includes(norm(k)));

function* walkProducts() {
  for (const cat of CATALOG.categories) {
    for (const p of cat.products) yield { cat, p };
  }
}
function findCategory(q) {
  const nq = norm(q);
  return CATALOG.categories.find(
    c =>
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
    if (keys.some(k => nq.includes(k))) return { cat, p };
  }
  return null;
}

// =============== Detectar intención automática ===============
function detectIntent(text) {
  const t = norm(text);
  const may = ["mayor", "mayorista", "restaurante", "restaurant", "bar", "hotel", "hostel", "negocio", "distribuidor", "distribución", "proveedor"];
  if (hasAny(t, may)) return MODES.MAYORISTA;

  const min = ["minorista", "consumo", "picada", "picadas", "familia", "pedido", "comprar", "envio", "envío", "retiro"];
  if (hasAny(t, min)) return MODES.MINORISTA;

  // Si escribe "contacto / quiero info", decidimos por contexto:
  if (hasAny(t, ["contacto", "contactarme", "quiero info", "quiero comprar"])) {
    return MODES.MINORISTA; // default amistoso
  }
  return null;
}

// ==================== Senders (WhatsApp) ====================
async function sendText(to, body) {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      { messaging_product: "whatsapp", to, type: "text", text: { body } },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (e) { console.error("sendText:", e.response?.data || e.message); }
}

async function sendImage(to, link, caption = "") {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      { messaging_product: "whatsapp", to, type: "image", image: { link, caption } },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (e) { console.error("sendImage:", e.response?.data || e.message); }
}

async function sendButtons(to, bodyText, buttons) {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: bodyText },
          action: {
            buttons: buttons.slice(0, 3).map(b => ({
              type: "reply",
              reply: { id: b.id, title: b.title }
            }))
          }
        }
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (e) { console.error("sendButtons:", e.response?.data || e.message); }
}

// =================== Email: enviar lead ======================
async function sendLeadEmail(payload) {
  const {
    phone, mode, nombre, telefono, ciudad, provincia, canal,
    tipo_negocio, // mayorista
    retiro_envio, // minorista
    interes, volumen
  } = payload;

  const subject = mode === MODES.MAYORISTA
    ? "Nuevo contacto MAYORISTA – WhatsApp"
    : "Nuevo contacto MINORISTA – WhatsApp";

  const lines = [
    `📩 Nuevo contacto desde WhatsApp – Nuevo Munich`,
    ``,
    `👤 Nombre: ${nombre || "-"} `,
    `📱 Teléfono: ${telefono || phone || "-"}`,
    `📍 Ciudad: ${ciudad || "-"} ${provincia ? " / Provincia: " + provincia : ""}`,
    mode === MODES.MAYORISTA ? `🏬 Tipo de cliente: ${tipo_negocio || "-"}` : `🚚 Retiro/Envío: ${retiro_envio || "-"}`,
    `🥩 Interés: ${interes || "-"}`,
    mode === MODES.MAYORISTA ? `📦 Volumen estimado: ${volumen || "-"}` : null,
    `📧 Preferencia de contacto: ${canal || "WhatsApp"}`,
    ``,
    `Fecha: ${new Date().toLocaleString("es-AR")}`
  ].filter(Boolean);

  const html = `<pre style="font:14px/1.35 Menlo,Consolas,monospace">${lines.join("\n")}</pre>`;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    subject,
    html
  });
}

// =================== Flujos conversacionales =================
// -------- Minorista (consumo personal)
const flowMinorista = {
  steps: ["ask_nombre", "ask_ciudad", "ask_retiro_envio", "ask_interes", "finish"],
  async handler(to, text) {
    const s = sessions[to];
    switch (s.step) {
      case "ask_nombre":
        s.data.nombre = text;
        s.step = "ask_ciudad";
        return sendText(to, "📍 ¡Gracias! ¿De qué *ciudad* nos escribís?");

      case "ask_ciudad":
        s.data.ciudad = text;
        s.step = "ask_retiro_envio";
        return sendButtons(to, "¿Preferís *retiro* o *envío*? 👇", [
          { id: "retiro", title: "🏪 Retiro" },
          { id: "envio",  title: "🚚 Envío" },
          { id: "menu",   title: "🔙 Menú" }
        ]);

      case "ask_retiro_envio":
        s.data.retiro_envio = ["retiro","envio","envío"].includes(norm(text)) ? text : "No especificado";
        s.step = "ask_interes";
        return sendText(to, "🥩 Contame qué *producto/s* te interesan (ej: bondiola, salames, quesos).");

      case "ask_interes":
        s.data.interes = text;
        s.step = "finish";
        await sendLeadEmail({
          phone: to, mode: MODES.MINORISTA,
          nombre: s.data.nombre,
          telefono: null,
          ciudad: s.data.ciudad,
          provincia: null,
          canal: "WhatsApp",
          retiro_envio: s.data.retiro_envio,
          interes: s.data.interes
        });
        delete sessions[to];
        await sendText(to, "✅ ¡Listo! En breve te contactamos por aquí. ¿Querés ver *productos* mientras tanto?");
        return sendButtons(to, "Elegí una opción:", [
          { id: "productos", title: "🧾 Ver productos" },
          { id: "catalogo",  title: "📦 Catálogo PDF" },
          { id: "menu",      title: "🔙 Menú" }
        ]);
    }
  }
};

// -------- Mayorista / Comercial
const flowMayorista = {
  steps: ["ask_nombre", "ask_telefono", "ask_ciudad_provincia", "ask_tipo_negocio", "ask_interes_volumen", "finish"],
  async handler(to, text) {
    const s = sessions[to];
    switch (s.step) {
      case "ask_nombre":
        s.data.nombre = text;
        s.step = "ask_telefono";
        return sendText(to, "📱 Perfecto. ¿Un *teléfono* para contactarte? (podés repetir este)");

      case "ask_telefono":
        s.data.telefono = text;
        s.step = "ask_ciudad_provincia";
        return sendText(to, "📍 ¿De qué *ciudad y provincia* sos?");

      case "ask_ciudad_provincia":
        // intento separar "Córdoba Capital, Córdoba"
        const parts = text.split(",").map(v => v.trim());
        s.data.ciudad = parts[0] || text;
        s.data.provincia = parts[1] || null;
        s.step = "ask_tipo_negocio";
        return sendButtons(to, "¿Qué tipo de negocio tenés?", [
          { id: "restaurante", title: "🍽️ Restaurante" },
          { id: "hotel",       title: "🏨 Hotel" },
          { id: "distribuidor",title: "🚛 Distribuidor" }
        ]);

      case "ask_tipo_negocio":
        s.data.tipo_negocio = text;
        s.step = "ask_interes_volumen";
        return sendText(to, "🧾 Contame *qué productos* te interesan y *volumen estimado* (ej: 10 kg/semana).");

      case "ask_interes_volumen":
        s.data.interes = text;
        s.data.volumen = text.match(/\d+/) ? text : null; // naive parse
        s.step = "finish";
        await sendLeadEmail({
          phone: to, mode: MODES.MAYORISTA,
          nombre: s.data.nombre,
          telefono: s.data.telefono,
          ciudad: s.data.ciudad,
          provincia: s.data.provincia,
          canal: "WhatsApp",
          tipo_negocio: s.data.tipo_negocio,
          interes: s.data.interes,
          volumen: s.data.volumen
        });
        delete sessions[to];
        await sendText(to, "✅ ¡Gracias! Pasamos tus datos a ventas. Te escribimos en breve.");
        return sendButtons(to, "Mientras tanto:", [
          { id: "productos", title: "🧾 Ver productos" },
          { id: "catalogo",  title: "📦 Catálogo PDF" },
          { id: "menu",      title: "🔙 Menú" }
        ]);
    }
  }
};

// ============== Entrada principal del bot ===================
export async function handleUserMessage(to, msg) {
  try {
    let text =
      msg?.raw?.interactive?.button_reply?.id ||
      msg?.raw?.interactive?.button_reply?.title ||
      msg?.raw?.interactive?.list_reply?.id ||
      msg?.text?.body ||
      msg?.raw?.button?.text ||
      "";
    text = (text || "").trim();

    // Admin: recargar catálogo
    if (["recargar catalogo", "reload catalog"].includes(norm(text))) {
      CATALOG = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
      return sendText(to, "♻️ Catálogo actualizado. ¡Listo para vender!");
    }

    // Si hay sesión activa, seguimos el flujo
    if (sessions[to]?.mode && sessions[to]?.step) {
      const mode = sessions[to].mode;
      if (mode === MODES.MINORISTA) return flowMinorista.handler(to, text);
      if (mode === MODES.MAYORISTA) return flowMayorista.handler(to, text);
    }

    // Saludo + menú
    if (!text || hasAny(text, ["hola", "buenas", "menu", "menú", "inicio"])) {
      const now = Date.now();
      if ((now - (lastWelcomeAt.get(to) || 0)) > WELCOME_COOLDOWN_MS) {
        lastWelcomeAt.set(to, now);
        await sendWelcome(to);
      }
      return sendMainMenu(to);
    }

    // Botones principales + utilidades
    if (hasAny(text, ["productos", "ver productos"])) return sendCategories(to);
    if (hasAny(text, ["eventos"])) return sendEventos(to);
    if (hasAny(text, ["reparto", "envios", "envío", "envio"])) return sendReparto(to);
    if (hasAny(text, ["provincias", "cobertura"])) return sendProvincias(to);
    if (hasAny(text, ["redes", "web", "instagram", "linktree"])) return sendRedes(to);
    if (hasAny(text, ["catalogo", "catálogo", "lista de precios", "pdf"])) return sendCatalogoPdf(to);

    // === Disparadores del formulario (contacto / comprar / soy negocio)
    if (hasAny(text, ["contacto", "quiero info", "quiero comprar", "comprar", "soy negocio", "soy distribuidor", "hotel", "restaurante", "restaurant"])) {
      const intent = detectIntent(text) || MODES.MINORISTA;
      if (intent === MODES.MAYORISTA) {
        sessions[to] = { mode: MODES.MAYORISTA, step: "ask_nombre", data: {} };
        return sendText(to, "💬 ¡Genial! Asesor comercial mayorista acá. ¿Tu *nombre y apellido*?");
      } else {
        sessions[to] = { mode: MODES.MINORISTA, step: "ask_nombre", data: {} };
        return sendText(to, "💬 ¡Buenísimo! Te asesoro por acá. ¿Tu *nombre y apellido*?");
      }
    }

    // FAQs / genéricos
    if (hasAny(text, ["precios", "precio", "cuanto", "cuánto"])) {
      return sendText(to, "💬 Sobre precios: trabajamos lista actualizada. ¿Te paso el *catálogo (PDF)* o querés consultar *un producto* puntual?");
    }
    if (hasAny(text, ["presentacion", "presentación", "gramos", "kilo", "kg"])) {
      return sendText(to, "📦 Presentaciones: trabajamos *feteados al vacío* y *piezas*, según producto. Decime cuál te interesa y te paso el detalle.");
    }
    if (hasAny(text, ["vencimiento", "caducidad", "consumo", "fecha"])) {
      return sendText(to, "🧊 Vencimiento y conservación: refrigerados entre 0–5 °C. Si me decís el producto, te paso el dato exacto.");
    }
    if (hasAny(text, ["sin tacc", "gluten", "celiaco", "celíaco"])) {
      return sendText(to, "ℹ️ Por ahora no declaramos línea certificada *SIN TACC*. Si necesitás alternativas, contame qué producto buscás y te confirmo su composición.");
    }
    if (hasAny(text, ["pago", "pagos", "tarjeta", "transferencia", "efectivo"])) {
      return sendText(to, "💳 Medios de pago: *efectivo* y *transferencia*. Mayoristas con factura. Consultanos condiciones según tu pedido.");
    }

    // Categoría / producto por texto libre
    const catHit = findCategory(text);
    if (catHit) {
      const listado = catHit.products.map(p => `• ${p.name}`).join("\n");
      return sendText(to, `${catHit.title}\n${catHit.description}\n\n${listado}\n\nEscribí el *nombre del producto* para ver foto + detalle.`);
    }
    const prodHit = findProduct(text);
    if (prodHit) {
      const { p } = prodHit;
      const lines = [
        `*${p.name} – ${CATALOG.brand}*`,
        p.desc || "",
        p.ingredients ? `🧾 Ingredientes: ${p.ingredients}` : "",
        p.suggestions ? `🍽️ Sugerencias: ${p.suggestions}` : "",
        p.presentations?.length ? `📦 Presentaciones: ${p.presentations.join(", ")}` : "",
        p.storage ? `🧊 Conservación: ${p.storage}` : "",
        p.shelf_life ? `⏳ Vencimiento: ${p.shelf_life}` : ""
      ].filter(Boolean);
      const caption = lines.join("\n");
      return p.image ? sendImage(to, p.image, caption) : sendText(to, caption);
    }

    // Fallback
    return sendText(to, "No me quedó claro 🫶. Escribí *menú* para ver opciones, una *categoría* (feteados, salames, ahumados) o un *producto* (ej: bondiola).");
  } catch (err) {
    console.error("handleUserMessage:", err.response?.data || err.message);
  }
}

// ===================== Bloques existentes ====================
async function sendWelcome(to) {
  await sendText(
    to,
    "🍻 *¡Bienvenid@ a Nuevo Munich!*\n\n*Artesanos del Sabor*\n\nDesde 1972, con recetas de origen austríaco heredadas por generaciones. Elaboración *artesanal* y sabor centroeuropeo auténtico."
  );
}

async function sendMainMenu(to) {
  await sendButtons(to, "¿Qué te gustaría hacer? 👇", [
    { id: "productos",  title: "🧾 Ver productos" },
    { id: "eventos",    title: "🎉 Eventos" },
    { id: "reparto",    title: "🚚 Zonas de Reparto" }
  ]);
  await sendButtons(to, "Más opciones:", [
    { id: "provincias", title: "🗺️ Provincias" },
    { id: "redes",      title: "🌐 Redes / Web" },
    { id: "catalogo",   title: "📦 Catálogo PDF" }
  ]);
}

async function sendCategories(to) {
  const names = CATALOG.categories.map(c => `• ${c.title}`).join("\n");
  await sendText(to, `📂 *Categorías*\n${names}\n\nDecime una categoría o un producto. Ej: *bondiola*, *salchicha viena*.`);
}

async function sendEventos(to) {
  await sendText(to, "🎉 *Eventos Nuevo Munich*\nArmamos *tablas y picadas* para cumple, reuniones, empresariales y ferias.\n¿Para cuántas personas y en qué fecha lo querés? 😊");
}

async function sendReparto(to) {
  await sendText(to, "🚚 *Zonas de Reparto*\nCórdoba Capital y alrededores. Para *mayoristas* enviamos a provincias con logística refrigerada.\nContanos tu ubicación y coordinamos.");
}

async function sendProvincias(to) {
  await sendText(to, "🗺️ *Cobertura*\nDistribuimos en: Córdoba, Santa Fe, Buenos Aires, Mendoza, La Pampa, San Luis y Entre Ríos.\n¿Tu provincia no está? ¡Consultanos!");
}

async function sendRedes(to) {
  const c = CATALOG.contact;
  await sendText(to, `🌐 *Redes & Contacto*\nInstagram: ${c.instagram}\nWeb: ${c.website}\nLinktree: ${c.linktree}\nMaps: ${c.maps}\nTel/WhatsApp: ${c.phone_display}`);
}

async function sendCatalogoPdf(to) {
  await sendText(to, `📦 *Catálogo completo*\nMirá todas las líneas y presentaciones acá:\n${CATALOG.catalog_pdf}`);
}
