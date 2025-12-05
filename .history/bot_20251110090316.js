import axios from "axios";
import dotenv from "dotenv";
import { procesarMensajeIA } from "./ia.js";
dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const LOGO = process.env.LOGO_URL || "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";

// Footer corto (<= 60 chars). Sin URLs para evitar 131009.
const FOOTER_TEXT = "🌐 Web | 📸 Instagram | 📦 Catálogo";

// Para respuestas libres + flujo de pedido
export const sessions = new Map();

/* =========================
UTILIDADES HTTP
========================= */
async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` },
timeout: 8000
});
}

async function sendText(to, body) {
return send({
messaging_product: "whatsapp",
to,
text: { body }
});
}

async function sendImage(to, link, caption = "") {
return send({
messaging_product: "whatsapp",
to,
type: "image",
image: { link, caption }
});
}

async function sendButtons(to, { headerImage, body, buttons }) {
const interactive = {
type: "button",
body: { text: body },
action: { buttons },
};
if (headerImage) {
interactive.header = { type: "image", image: { link: headerImage } };
}
// Footer corto y seguro
interactive.footer = { text: FOOTER_TEXT };

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive
});
}

async function sendList(to, { body, sections, buttonLabel = "Ver opciones" }) {
// Footer corto y seguro
const interactive = {
type: "list",
body: { text: body },
footer: { text: FOOTER_TEXT },
action: {
button: buttonLabel,
sections
}
};
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive
});
}

/* =========================
MENÚ PRINCIPAL
========================= */
export async function sendMenuPrincipal(to) {
return sendButtons(to, {
headerImage: LOGO,
body: "¡Bienvenido a *Nuevo Munich*!\nCharcutería artesanal desde 1972.\n\nElegí una opción:",
buttons: [
{ type: "reply", reply: { id: "BTN_PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "BTN_EVENTOS", title: "Eventos & Catering" } },
{ type: "reply", reply: { id: "BTN_PEDIDO", title: "Hacer Pedido" } }
]
});
}

/* =========================
PRODUCTOS → Categorías (Opción A)
========================= */
export async function sendProductosMenu(to) {
return sendButtons(to, {
headerImage: null,
body: "Seleccioná una categoría 👇",
buttons: [
{ type: "reply", reply: { id: "CAT_PICADAS", title: "Picadas" } },
{ type: "reply", reply: { id: "CAT_SALCHICHAS", title: "Salchichas Alemanas" } },
{ type: "reply", reply: { id: "CAT_PARRILLA", title: "Parrilla y Ahumados" } }
]
});
}

/* =========================
Mapeo de productos + imágenes
========================= */
const IMGS = {
// Arrollados / Picadas
ARROLLADO_POLLO: "https://i.postimg.cc/7G4nB0KX/arollado-de-pollo.png",
ARROLLADO_CRIOLLO: "https://i.postimg.cc/PpHQ6YSy/ARROLL-ADO-CRIOLLO.png",
MATAMBRE_ARROLLADO: "https://i.postimg.cc/MMYbgH4X/MATAMBRE-ARROLLADO.png",
BONDIOLA: "https://i.postimg.cc/S24fZCg5/Bondioola.png",
JAMON_COCIDO: "https://i.postimg.cc/sQz4n7ns/jamon-cocido.png",
JAMON_COCIDO_BAVARO: "https://i.postimg.cc/r0TNhxhX/jamon-cocido-bavaro.png",
SALAME_COLONIA: "https://i.postimg.cc/G8jJ6tNj/salame-tipo-colonia.png",
SALAME_HOLSTEIN: "https://i.postimg.cc/Q9qkvCPp/SAL-AME-HOL-STEIN.png",
SALAME_ALPINO: "https://i.postimg.cc/PpMz0Jcz/salame-tipo-alpino-Ahumado-picado-grueso.png",

// Salchichas
VIENA_COPETIN: "https://i.postimg.cc/5QNqJ1dw/salchicha-de-copetin-tipo-viena.png",
VIENA: "https://i.postimg.cc/gLkqpdFB/salchicha-tipo-viena.png",
FRANKFURT: "https://i.postimg.cc/Wqb6VjLn/SALCHICHA-tipo-Frankfurt.png",
HUNGARA: "https://i.postimg.cc/jndQTK0Q/salchicha-tipo-hungara.png",
HUNGARA_COPETIN: "https://i.postimg.cc/30JCh75D/SALCHICHA-COPETIN-TIPO-HUNGARA.png",
KNACKWURST: "https://i.postimg.cc/CnLH0YTs/SALCHICHA-tipo-Knackwurst.png",
WEISSWURST: "https://i.postimg.cc/SYN74qFv/SALCHICHA-tipo-Weisswurst.png",
ROSCA_POLACA: "https://i.postimg.cc/gXKq1j58/ROSCA-POLACA.png",

// Parrilla / Ahumados / Especialidades
KASSLER: "https://i.postimg.cc/hzn1CTCh/Kassler-COSTELETA-DE-CERDO.png",
LOMO_AHUMADO: "https://i.postimg.cc/S2G7HR5k/lomo-de-cerdo-ahumado.png",
LOMO_COCIDO: "https://i.postimg.cc/34ZCzN68/lomo-de-cerdo-cocido.png",
PANCETA_AHUMADA: "https://i.postimg.cc/34ZCzN6D/PANCETA-AHUMADA.png",
PANCETA_SALADA_AHUMADA: "https://i.postimg.cc/R6TQ2h8H/panceta-salada-ahumada.png",
CRACOVIA: "https://i.postimg.cc/CB0svkc9/CRACOVA.png",
LEBERKASSE: "https://i.postimg.cc/G8jJ6tNr/Leberkasse.png",
SALCHICHON_AHUMADO: "https://i.postimg.cc/ZvKFmZtX/salchichon-ahumado.png",

// Jamón asado / con cuero (si los usás)
JAMON_ASADO: "https://i.postimg.cc/WFVw9g9p/j-AMON-TIPO-ASADO.png",
JAMON_CON_CUERO: "https://i.postimg.cc/dkFjWrWF/jamon-cocido-con-cuero.png",
};

// Catálogo por categoría (IDs y textos cortos)
const CATEGORIAS = {
CAT_PICADAS: [
{ id: "PROD_ARROLLADO_POLLO", titulo: "Arrollado de Pollo", desc: "Clásico frío para tablas." },
{ id: "PROD_ARROLLADO_CRIOLLO", titulo: "Arrollado Criollo", desc: "Bien sabroso, ideal picadas." },
{ id: "PROD_MATAMBRE_ARROLLADO", titulo: "Matambre Arrollado", desc: "Infaltable en picadas." },
{ id: "PROD_BONDIOLA", titulo: "Bondiola", desc: "Aromática, rinde en sándwich." },
{ id: "PROD_JAMON_COCIDO", titulo: "Jamón Cocido", desc: "Para sándwiches y tablas." },
{ id: "PROD_JAMON_BAVARO", titulo: "Jamón Cocido Bávaro", desc: "Perfil suave, muy noble." },
{ id: "PROD_SAL_COLONIA", titulo: "Salame Tipo Colonia", desc: "Clásico de picadas." },
{ id: "PROD_SAL_HOLSTEIN", titulo: "Salame Holstein", desc: "Ahumado, picado fino." },
{ id: "PROD_SAL_ALPINO", titulo: "Salame Alpino", desc: "Ahumado, picado grueso." },
],
CAT_SALCHICHAS: [
{ id: "PROD_VIENA_COPETIN", titulo: "Viena Copetín", desc: "Bocados ideales." },
{ id: "PROD_VIENA", titulo: "Viena", desc: "La clásica alemana." },
{ id: "PROD_FRANKFURT", titulo: "Frankfurt Tipo", desc: "Superpancho alemán." },
{ id: "PROD_HUNGARA", titulo: "Húngara", desc: "Intensa, para plancha." },
{ id: "PROD_HUNGARA_COP", titulo: "Húngara Copetín", desc: "Mini formato." },
{ id: "PROD_KNACKWURST", titulo: "Knackwurst Tipo", desc: "Típica alemana." },
{ id: "PROD_WEISSWURST", titulo: "Weisswurst Tipo", desc: "Blanca, suave." },
{ id: "PROD_ROSCA_POLACA", titulo: "Rosca Polaca", desc: "Icono para grill." },
],
CAT_PARRILLA: [
{ id: "PROD_KASSLER", titulo: "Kassler", desc: "Costeleta ahumada." },
{ id: "PROD_LOMO_AHUMADO", titulo: "Lomo Ahumado", desc: "Finas hierbas." },
{ id: "PROD_LOMO_COCIDO", titulo: "Lomo Cocido", desc: "Listo para cortar." },
{ id: "PROD_PANCETA_AHUMADA", titulo: "Panceta Ahumada", desc: "Para dorar." },
{ id: "PROD_PANCETA_SALADA", titulo: "Panceta Salada Ahumada", desc: "Súper versátil." },
{ id: "PROD_CRACOVIA", titulo: "Cracovia", desc: "Especialidad gourmet." },
{ id: "PROD_LEBERKASSE", titulo: "Leberkasse", desc: "Plancha u horno." },
{ id: "PROD_SALCHICHON_AH", titulo: "Salchichón Ahumado", desc: "Perfume ahumado." },
{ id: "PROD_ROSCA_POLACA", titulo: "Rosca Polaca", desc: "También en grill." },
]
};

// Detalle por producto (texto + imagen)
const DETALLE = {
// Picadas
PROD_ARROLLADO_POLLO: {
img: IMGS.ARROLLADO_POLLO,
txt: "*Arrollado de Pollo*\nClásico de picadas frías. Ideal con pan de campo y aceitunas."
},
PROD_ARROLLADO_CRIOLLO: {
img: IMGS.ARROLLADO_CRIOLLO,
txt: "*Arrollado Criollo*\nSabor intenso. Va perfecto en tabla con bondiola y salame."
},
PROD_MATAMBRE_ARROLLADO: {
img: IMGS.MATAMBRE_ARROLLADO,
txt: "*Matambre Arrollado*\nInfaltable en tabla tradicional. Servir frío, corte fino."
},
PROD_BONDIOLA: {
img: IMGS.BONDIOLA,
txt: "*Bondiola*\nAromática y rendidora. Gran compañera de panes rústicos."
},
PROD_JAMON_COCIDO: {
img: IMGS.JAMON_COCIDO,
txt: "*Jamón Cocido*\nVersátil para sándwiches y picadas suaves."
},
PROD_JAMON_BAVARO: {
img: IMGS.JAMON_COCIDO_BAVARO,
txt: "*Jamón Cocido Tipo Bávaro*\nPerfil suave y delicado para todos los gustos."
},
PROD_SAL_COLONIA: {
img: IMGS.SALAME_COLONIA,
txt: "*Salame Tipo Colonia*\nEl clásico que todos piden para picada."
},
PROD_SAL_HOLSTEIN: {
img: IMGS.SALAME_HOLSTEIN,
txt: "*Salame Holstein*\nAhumado, picado fino. Aporta perfume y carácter."
},
PROD_SAL_ALPINO: {
img: IMGS.SALAME_ALPINO,
txt: "*Salame Alpino*\nAhumado, picado grueso. Textura y sabor potentes."
},

// Salchichas
PROD_VIENA_COPETIN: {
img: IMGS.VIENA_COPETIN,
txt: "*Viena Copetín*\nBocados para bandejas calientes o salsas suaves."
},
PROD_VIENA: {
img: IMGS.VIENA,
txt: "*Viena*\nClásica alemana. Hervida suave o plancha. Mostaza y chucrut."
},
PROD_FRANKFURT: {
img: IMGS.FRANKFURT,
txt: "*Frankfurt Tipo*\nEl superpancho alemán. Pan, mostaza, pepinillos."
},
PROD_HUNGARA: {
img: IMGS.HUNGARA,
txt: "*Húngara*\nMás intensa. A la plancha o grill con ensalada de papas."
},
PROD_HUNGARA_COP: {
img: IMGS.HUNGARA_COPETIN,
txt: "*Húngara Copetín*\nFormato mini para bandejas, salsas y brochettes."
},
PROD_KNACKWURST: {
img: IMGS.KNACKWURST,
txt: "*Knackwurst Tipo*\nTípica alemana. Excelente con chucrut."
},
PROD_WEISSWURST: {
img: IMGS.WEISSWURST,
txt: "*Weisswurst Tipo*\nSuave y blanca. Hervor corto y servir tibia."
},
PROD_ROSCA_POLACA: {
img: IMGS.ROSCA_POLACA,
txt: "*Rosca Polaca*\nIdeal para grill o horno. Corta y a disfrutar."
},

// Parrilla / Ahumados
PROD_KASSLER: {
img: IMGS.KASSLER,
txt: "*Kassler (Costeleta ahumada)*\nPara plancha/horno. Acompañar con puré o manzana."
},
PROD_LOMO_AHUMADO: {
img: IMGS.LOMO_AHUMADO,
txt: "*Lomo de Cerdo Ahumado*\nFinas hierbas. Servir en láminas o tibio."
},
PROD_LOMO_COCIDO: {
img: IMGS.LOMO_COCIDO,
txt: "*Lomo de Cerdo Cocido*\nListo para cortar. Versátil en tablas o sándwich."
},
PROD_PANCETA_AHUMADA: {
img: IMGS.PANCETA_AHUMADA,
txt: "*Panceta Ahumada*\nPara dorar y sumar a hot dogs o pastas."
},
PROD_PANCETA_SALADA: {
img: IMGS.PANCETA_SALADA_AHUMADA,
txt: "*Panceta Salada Cocida Ahumada*\nTip: envolver salchicha y dorar a la plancha."
},
PROD_CRACOVIA: {
img: IMGS.CRACOVIA,
txt: "*Cracovia*\nEspecialidad gourmet. Laminado fino y pan negro."
},
PROD_LEBERKASSE: {
img: IMGS.LEBERKASSE,
txt: "*Leberkasse*\nPlancha/horno. Excelente con chucrut y puré."
},
PROD_SALCHICHON_AH: {
img: IMGS.SALCHICHON_AHUMADO,
txt: "*Salchichón Ahumado*\nPerfume delicado. Sirve frío en rodajas."
},

// Info de Eventos
EVENTOS_INFO: {
img: LOGO,
txt: "*Eventos & Catering*\nArmamos mesas frías/calientes, picadas alemanas y opciones gourmet según cantidad de personas. ¿Para cuántos sería y para qué fecha?"
}
};

/* =========================
Listas por categoría
========================= */
export async function sendCategoriaLista(to, catId) {
const items = CATEGORIAS[catId] || [];
// WhatsApp List: máx 10 filas por sección (mantenemos ajustado)
const rows = items.slice(0, 10).map(p => ({
id: p.id,
title: p.titulo,
description: p.desc
}));

return sendList(to, {
body: (catId === "CAT_PICADAS"
? "Picadas y Fiambres — elegí un producto:"
: catId === "CAT_SALCHICHAS"
? "Línea Alemana — elegí una salchicha:"
: "Parrilla y Ahumados — elegí una especialidad:"
),
buttonLabel: "Ver opciones",
sections: [
{ title: "Disponibles", rows }
]
});
}

/* =========================
Detalle de producto
========================= */
export async function sendProductoDetalle(to, prodId) {
const data = DETALLE[prodId];
if (!data) {
return sendText(to, "Perdón, no encontré ese producto. ¿Querés ver otra categoría?");
}
// Enviamos imagen + texto (dos mensajes para mejor render en WhatsApp)
await sendImage(to, data.img);
await sendText(to, data.txt + "\n\n¿Te lo incluyo en un pedido?");
}

/* =========================
Flujo de Pedido
========================= */
export async function iniciarPedido(to) {
sessions.set(to, { paso: "ITEMS", data: {} });
return sendText(to, "Decime qué querés (ej: 1 rosca + 2 viena).");
}

export async function flujoPedido(to, msg) {
const s = sessions.get(to);
if (!s) return;

if (s.paso === "ITEMS") {
s.data.items = msg;
s.paso = "NOMBRE";
return sendText(to, "¿A nombre de quién registramos el pedido?");
}

if (s.paso === "NOMBRE") {
s.data.nombre = msg;
s.paso = "CONFIRM";
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: `Confirmar pedido:\n\n${s.data.items}\nA nombre de: ${s.data.nombre}` },
footer: { text: FOOTER_TEXT },
action: {
buttons: [
{ type: "reply", reply: { id: "CONFIRMAR", title: "Confirmar ✅" } },
{ type: "reply", reply: { id: "CANCELAR", title: "Cancelar ❌" } }
]
}
}
});
}

if (s.paso === "CONFIRM") {
if (msg === "CONFIRMAR") {
await sendText(to, "✅ Pedido registrado. ¡Gracias! Te escribimos enseguida para coordinar entrega.");
} else if (msg === "CANCELAR") {
await sendText(to, "❌ Pedido cancelado. Cuando quieras lo retomamos.");
}
sessions.delete(to);
}
}

/* =========================
IA fallback
========================= */
export async function replyIA(to, userMsg) {
try {
const r = await procesarMensajeIA(userMsg);
return sendText(to, r);
} catch {
return sendText(to, "¿Buscabas algo de salchichas, picadas o especialidades?");
}
}

