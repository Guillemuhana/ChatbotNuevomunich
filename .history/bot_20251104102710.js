import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID;

// ✅ Enviar textos
export async function sendText(to, body) {
const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
return axios.post(url, {
messaging_product: "whatsapp",
to,
type: "text",
text: { body }
}, {
headers: { Authorization: `Bearer ${token}` }
});
}

// ✅ Enviar imagen (logo)
export async function sendImage(to, imageUrl) {
const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
return axios.post(url, {
messaging_product: "whatsapp",
to,
type: "image",
image: { link: imageUrl }
}, {
headers: { Authorization: `Bearer ${token}` }
});
}

// ✅ Menú principal minimalista
export async function sendMenuPrincipal(to) {
const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

return axios.post(url, {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text: `*Nuevo Munich*\nArtesanos del sabor desde 1972.\n\nElegí una opción:`
},
action: {
buttons: [
{ type: "reply", reply: { id: "PICADAS", title: "Picadas" } },
{ type: "reply", reply: { id: "PRODUCTOS", title: "Productos" } },
{ type: "reply", reply: { id: "PEDIDO", title: "Hacer pedido" } }
]
}
}
}, {
headers: { Authorization: `Bearer ${token}` }
});
}