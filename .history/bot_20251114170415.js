import axios from "axios";
import dotenv from "dotenv";
import { IMAGENES } from "./imagenes.js";

dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const WEB = "https://nuevomunich.com.ar";

// ========================================
// ENVIAR MENSAJE
// ========================================
export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// ========================================
// 1) BIENVENIDA INICIAL
// ========================================
export async function sendBienvenida(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text: `*Bienvenidos a Nuevo Munich 🥨*\nArtesanos del sabor desde 1972.\n🌐 ${WEB}\n\nElegí una opción`
},
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "📖 Leer más" } },
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" } }
]
}
}
});
}

// ========================================
// 2) DESCRIPCIÓN EXTENDIDA
// ========================================
export async function sendDescripcionExtendida(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
`*Artesanos del Sabor*\n\n` +
`Fue en 1972 cuando los primeros dueños, de origen austríaco, trajeron sus recetas heredadas de generaciones y generaciones de sabores centroeuropeos.\n\n` +
`Hoy mantenemos ese legado en cada elaboración.\n\n` +
`👉 Escribí *Menú* para volver al inicio.`
}
});
}

// ========================================
// 3) MENÚ PRINCIPAL — LISTA
// ========================================
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
header: { type: "text", text: "Nuevo Munich 🥨" },
body: { text: "Elegí una opción del menú principal:" },
footer: { text: "Seleccioná para continuar" },

action: {
button: "Ver opciones",
sections: [
{
title: "Productos",
rows: [
{ id: "PROD_feteados", title: "Feteados", description: "Feteados artesanales" },
{ id: "PROD_salames", title: "Salames", description: "Salames para picada" },
{ id: "PROD_salchichas", title: "Salchichas Alemanas", description: "Viena, Frankfurt, Húngara…" },
{ id: "PROD_especialidades", title: "Especialidades", description: "Kassler, Leberkasse y más" }
]
},
{
title: "Servicios",
rows: [
{ id: "SERV_eventos", title: "Food Truck / Eventos", description: "Catering, mesas frías y más" },
{ id: "SERV_consultas", title: "Consultar pedidos", description: "Cómo hacer o seguir un pedido" }
]
},
{
title: "Información",
rows: [
{ id: "CATALOGO", title: "Catálogo completo (PDF)", description: "Ver catálogo general" }
]
}
]
}
}
});
}

// ========================================
// 4) MOSTRAR IMAGEN DE PRODUCTO
// ========================================
export async function sendProductoImagen(to, producto) {
const url = IMAGENES[producto];

if (!url) {
return send({
messaging_product: "whatsapp",
to,
text: { body: "No encontré la imagen de ese producto 😕" }
});
}

return send({
messaging_product: "whatsapp",
to,
type: "image",
image: { link: url }
});
}

// ========================================
// 5) EVENTOS
// ========================================
export async function sendEventos(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
`🎪 *Food Truck & Eventos*\n\n` +
`Ofrecemos catering, mesas frías, salchichas alemanas, picadas y eventos empresariales.\n\n` +
`Consultanos para encontrar la mejor opción para tu evento.`
}
});
}

// ========================================
// 6) CONSULTAR PEDIDOS
// ========================================
export async function sendConsultaPedidos(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body:
`📦 *Consultar pedidos*\n\n` +
`👉 Podés consultar disponibilidad, tiempos y combinar productos.\n\n` +
`Más adelante agregaremos un representante de ventas.`
}
});
}

// ========================================
// 7) CATÁLOGO PDF
// ========================================
export async function sendCatalogo(to) {
return send({
messaging_product: "whatsapp",
to,
type: "document",
document: {
link: "https://drive.google.com/file/d/1OZSG_BzpfMhgCvUyeFjgOkSEZZhI8T2k/view?usp=sharing",
caption: "Catálogo completo Nuevo Munich"
}
});
}