import axios from "axios";

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID;

// 📩 ENVIAR TEXTO
export async function sendText(to, body) {
const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;
return axios.post(url, {
messaging_product: "whatsapp",
to,
type: "text",
text: { body }
}, {
headers: { Authorization: `Bearer ${token}` }
});
}

// 🖼 ENVIAR IMAGEN
export async function sendImage(to, imageUrl, caption = "") {
const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;
return axios.post(url, {
messaging_product: "whatsapp",
to,
type: "image",
image: { link: imageUrl, caption }
}, {
headers: { Authorization: `Bearer ${token}` }
});
}

// 🔘 ENVIAR BOTONES
export async function sendButtons(to, body, buttons) {
const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;
return axios.post(url, {
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: body },
action: {
buttons: buttons.map(b => ({
type: "reply",
reply: { id: b.id, title: b.title }
}))
}
}
}, {
headers: { Authorization: `Bearer ${token}` }
});
}

// 📎 ENVIAR DOCUMENTO (CATÁLOGO)
export async function sendDocument(to, docUrl, filename) {
const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;
return axios.post(url, {
messaging_product: "whatsapp",
to,
type: "document",
document: { link: docUrl, filename }
}, {
headers: { Authorization: `Bearer ${token}` }
});
}