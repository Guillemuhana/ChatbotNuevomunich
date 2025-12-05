// ==========================================
// BOT.JS - NUEVO MUNICH
// ==========================================

import axios from "axios";
import dotenv from "dotenv";
import { IMAGENES } from "./imagenes.js";
import { procesarMensajeIA } from "./ia.js";

dotenv.config();

// --- CONFIG WHATSAPP ---
const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// --- URLs ---
const LOGO = "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png";
const WEB = "https://nuevomunich.com.ar";
const CATALOGO = "https://nuevomunich.com.ar/catalogo.pdf";

// --- CATEGORÍAS DE PRODUCTOS (los nombres deben coincidir con IMAGENES.js) ---
export const CATEGORIAS = {
FETEADOS: [
"Arrollado Criollo",
"Arrollado de Pollo",
"Bondiola",
"Jamón Cocido",
"Jamón Cocido Tipo Bávaro",
"Jamón Cocido con Cuero",
"Lomo Cocido",
"Lomo Ahumado a las Finas Hierbas",
"Lomo Tipo Bávaro",
"Panceta Ahumada",
"Panceta Salada Ahumada"
],
SALAMES: [
"Salame Holstein",
"Salame Tipo Alpino",
"Salame Tipo Colonia",
"Salchichón Ahumado"
],
SALCHICHAS: [
"Salchicha Viena",
"Salchicha Frankfurt",
"Salchicha Húngara",
"Salchicha Knackwurst",
"Rosca Polaca"
],
ESPECIALIDADES: [
"Kassler (Costeleta de Cerdo Ahumada)",
"Leberkasse"
]
};

// Normaliza strings para buscar en IMAGENES
function normalizar(str = "") {
return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// ==========================================
// ENVIAR MENSAJE GENÉRICO
// ==========================================
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// ==========================================
// 1) BIENVENIDA (LOGO + LEER MÁS + MENÚ PRINCIPAL)
// ==========================================
export async function sendBienvenida(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: LOGO } },
body: {
text: `*Bienvenidos a Nuevo Munich* 🥨
Artesanos del sabor desde 1972.

🌐 ${WEB}`
},
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "Leer más 📖" } },
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú principal" } }
]
}
}
});
}

// ==========================================
// 2) DESCRIPCIÓN AMPLIADA (SE ABRE AL TOCAR LEER MÁS)
// ==========================================
export async function sendDescripcionAmpliada(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text: `*Artesanos del Sabor*

Fue en 1972 cuando los primeros dueños, de origen austríaco, trajeron sus recetas heredadas de generaciones y generaciones de sabores centroeuropeos.

Hoy mantenemos ese legado en cada elaboración.`
},
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "Menú principal" } }
]
}
}
});
}

// ==========================================
// 3) MENÚ PRINCIPAL (INTERACTIVE LIST COMO PERSONAL)
// ==========================================
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: {
type: "text",
text: "Menú principal"
},
body: {
text: "Tocá un elemento para seleccionarlo:"
},
footer: {
text: "Nuevo Munich · Artesanos del sabor desde 1972."
},
action: {
button: "Ver opciones",
sections: [
{
title: "Productos",
rows: [
{ id: "CAT_FETEADOS", title: "Feteados", description: "Feteados artesanales" },
{ id: "CAT_SALAMES", title: "Salames", description: "Salames para picada" },
{ id: "CAT_SALCHICHAS", title: "Salchichas Alemanas", description: "Viena, Frankfurt, Húngara…" },
{ id: "CAT_ESPECIALIDADES", title: "Especialidades", description: "Kassler, Leberkasse y más" }
]
},
{
title: "Servicios",
rows: [
{
id: "CAT_EVENTOS",
title: "Food Truck / Eventos",
description: "Catering, mesas frías y más"
},
{
id: "CAT_PEDIDOS",
title: "Consultar pedidos",
description: "Cómo hacer o seguir un pedido"
}
]
},
{
title: "Información",
rows: [
{
id: "CAT_CATALOGO",
title: "Catálogo completo (PDF)",
description: "Ver catálogo general"
},
{
id: "CAT_CONTACTO",
title: "Contacto",
description: "Redes y datos de contacto"
}
]
}
]
}
}
});
}

// ==========================================
// 4) LISTA DE PRODUCTOS POR CATEGORÍA (LISTA TIPO MENÚ)
// ==========================================
const TITULOS_CATEGORIA = {
FETEADOS: "Feteados",
SALAMES: "Salames",
SALCHICHAS: "Salchichas Alemanas",
ESPECIALIDADES: "Especialidades"
};

export async function sendProductosDeCategoria(to, categoriaKey) {
const productos = CATEGORIAS[categoriaKey];
if (!productos) return;

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: {
type: "text",
text: TITULOS_CATEGORIA[categoriaKey] || "Productos"
},
body: {
text: "Elegí un producto para ver la imagen:"
},
action: {
button: "Ver productos",
sections: [
{
title: "Productos",
rows: productos.map((nombre) => ({
id: `PROD_${nombre}`,
title: nombre
}))
}
]
}
}
});
}

// ==========================================
// 5) MOSTRAR IMAGEN DEL PRODUCTO + BOTÓN MENÚ PRINCIPAL
// ==========================================
export async function sendProductoImagen(to, prodId) {
const nombreReal = prodId.replace(/^PROD_/, "");
const claveImagen = Object.keys(IMAGENES).find(
k => normalizar(k) === normalizar(nombreReal)
);

if (!claveImagen) {
return send({
messaging_product: "whatsapp",
to,
text: { body: "No encontré la imagen de ese producto 😕" }
});
}

const url = IMAGENES[claveImagen];

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: url } },
body: {
text: `*${claveImagen}*\n\nProducto artesanal de Nuevo Munich.`
},
action: {
buttons: [
{
type: "reply",
reply: { id: "MENU_PRINCIPAL", title: "Menú principal" }
}
]
}
}
});
}

// ==========================================
// 6) OPCIONES DEL MENÚ PRINCIPAL (CATÁLOGO / EVENTOS / PEDIDOS / CONTACTO)
// ==========================================
export async function sendCatalogoInfo(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body: `📄 *Catálogo completo Nuevo Munich*\n\nPodés ver nuestro catálogo actualizado acá:\n${CATALOGO}\n\nCuando quieras, pedime el *Menú principal*.`
}
});
}

export async function sendEventosInfo(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body: `✨ *Food Truck & Eventos*\n\n• Mesas frías y picadas premium\n• Servicio para eventos empresariales y sociales\n• Food Truck con salchichas alemanas y especialidades\n\nContame fecha, tipo de evento y cantidad aproximada de personas y te asesoro.\n\nPodés volver al *Menú principal* cuando quieras.`
}
});
}

export async function sendPedidosInfo(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body: `📝 *Consultar pedidos*\n\nPodés hacer tu pedido por acá indicándonos:\n• Productos\n• Cantidades aproximadas\n• Día y horario de retiro / entrega\n\nUn asesor te va a confirmar disponibilidad y valores según presentación y peso.\n\nCuando termines, pedime el *Menú principal*.`
}
});
}

export async function sendContactoInfo(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body: `📞 *Contacto Nuevo Munich*\n\n🌐 Web: ${WEB}\n📸 Instagram: https://instagram.com/nuevomunich.oficial\n\nTambién podés escribirnos directamente por este WhatsApp.\n\nDecime si querés volver al *Menú principal*.`
}
});
}

// ==========================================
// 7) RESPUESTA DE IA (HUGGINGFACE / OPENAI, ETC.)
// ==========================================
export async function replyIA(to, texto) {
const respuesta = await procesarMensajeIA(texto);
return send({
messaging_product: "whatsapp",
to,
text: { body: respuesta }
});
}
