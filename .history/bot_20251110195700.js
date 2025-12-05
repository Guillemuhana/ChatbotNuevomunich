import { IMAGEN_LOGO } from "./imagenes.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

export async function enviarMenuPrincipal(to) {
try {
await axios.post(
`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
{
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: IMAGEN_LOGO } // ← YA TENEMOS ESTA URL EN imagenes.js
},
body: {
text: "Nuevo Munich\nArtesanos del sabor desde 1972.\n\nElegí una opción:"
},
action: {
buttons: [
{
type: "reply",
reply: {
id: "BTN_PRODUCTOS",
title: "📦 Productos"
}
},
{
type: "reply",
reply: {
id: "BTN_EVENTOS",
title: "🥨 Eventos & Catering"
}
},
{
type: "reply",
reply: {
id: "BTN_PEDIDO",
title: "🛒 Hacer Pedido"
}
}
]
}
}
},
{ headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
);
} catch (error) {
console.log("Error enviarMenuPrincipal:", error.response?.data || error);
}
}

