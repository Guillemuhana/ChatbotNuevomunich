import axios from "axios";
import { sendText } from "./server.js";

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID;

// MENÚ PRINCIPAL
export async function sendMenuPrincipal(to) {
const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
return axios.post(url, {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
header: {
type: "image",
image: { link: process.env.LOGO_URL }
},
body: {
text: `Bienvenido/a a Nuevo Munich\nArtesanos del sabor desde 1972.\n\n${process.env.WEB_URL}\n${process.env.INSTAGRAM_URL}`
},
footer: { text: "Elegí una opción:" },
action: {
buttons: [
{ type: "reply", reply: { id: "PICADAS", title: "Picadas" } },
{ type: "reply", reply: { id: "PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "PEDIDO", title: "Hacer pedido" } }
]
}
}
}, { headers: { Authorization: `Bearer ${token}` } });
}

// OPCIÓN PICADAS
export async function sendPicadasIntro(to) {
return sendText(to, "Perfecto 👌\n¿Para cuántas personas es la picada?");
}

// OPCIÓN PRODUCTOS
export async function sendProductosIntro(to) {
return sendText(to,
"Contamos con:\n• Salames\n• Salchichas alemanas\n• Feteados artesanales\n• Especialidades ahumadas\n\nDecime qué producto te interesa."
);
}

// OPCIÓN HACER PEDIDO
export async function sendPedidoInicio(to) {
return sendText(to,
"Excelente 🙌\nDecime tu nombre y qué productos necesitás.\nNosotros preparamos el pedido y te confirmamos por este mismo chat."
);
}
