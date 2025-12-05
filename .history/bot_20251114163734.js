import axios from "axios";
import dotenv from "dotenv";
import { IMAGENES } from "./imagenes.js";

dotenv.config();

const API = "https://graph.facebook.com/v20.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

export async function send(payload) {
return axios.post(`${API}/${PHONE_ID}/messages`, payload, {
headers: { Authorization: `Bearer ${TOKEN}` }
});
}

// =======================
// BIENVENIDA
// =======================
export async function sendBienvenida(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: "https://i.postimg.cc/hPdnrTxH/Logo-Nuevo-Munich-web.png" }
},
body: {
text: `*Bienvenidos a Nuevo Munich 🥨*\nArtesanos del sabor desde 1972.\n🌐 https://nuevomunich.com.ar`
},
action: {
buttons: [
{ type: "reply", reply: { id: "LEER_MAS", title: "📖 Leer más" }},
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" }}
]
}
}
});
}

// =======================
// DESCRIPCIÓN EXTENDIDA
// =======================
export async function sendDescripcionExtendida(to) {
return send({
messaging_product: "whatsapp",
to,
text: {
body: `*Artesanos del Sabor*\n
Fue en 1972 cuando los primeros dueños, de origen austríaco, trajeron sus recetas heredadas de generaciones y generaciones de sabores centroeuropeos.

Hoy mantenemos ese legado en cada elaboración.\n
Escribí *Menú principal* para continuar.`
}
});
}

// =======================
// MENÚ PRINCIPAL
// =======================
export async function sendMenuPrincipal(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "Elegí una opción del menú principal:" },
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRODUCTOS", title: "🥨 Productos" }},
{ type: "reply", reply: { id: "MENU_CATALOGO", title: "📘 Catálogo" }},
{ type: "reply", reply: { id: "MENU_EVENTOS", title: "🎪 Food Truck / Eventos" }}
]
}
}
});
}

// =======================
// MENÚ DE PRODUCTOS
// =======================
export async function sendMenuProductos(to) {
return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "list",
body: { text: "Elegí una categoría:" },
action: {
button: "Ver categorías",
sections: [
{
title: "Productos artesanales",
rows: [
{ id: "PROD_SALCHICHAS", title: "Salchichas Alemanas" },
{ id: "PROD_SALAMES", title: "Salames" },
{ id: "PROD_FETEADOS", title: "Feteados" }
]
}
]
}
}
});
}

// =======================
// MOSTRAR PRODUCTO
// =======================
export async function sendProducto(to, nombre) {
const url = IMAGENES[nombre];

if (!url) {
return send({
messaging_product: "whatsapp",
to,
text: {
body: `No tengo imagen cargada para *${nombre}*.`
}
});
}

return send({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: { type: "image", image: { link: url }},
body: { text: `*${nombre}*\nProducto artesanal de Nuevo Munich.` },
action: {
buttons: [
{ type: "reply", reply: { id: "MENU_PRINCIPAL", title: "📋 Menú principal" }}
]
}
}
});
}
