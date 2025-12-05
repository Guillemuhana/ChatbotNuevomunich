import axios from "axios";

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// Enviar mensaje genérico
const sendMessage = async (data) => {
try {
await axios.post(
`https://graph.facebook.com/v17.0/${PHONE_ID}/messages`,
data,
{
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${TOKEN}`
}
}
);
} catch (err) {
console.log("❌ ERROR:", err);
}
};

// ✅ MENÚ PRINCIPAL
export const menuPrincipal = async (to) => {
await sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: {
text: "*Bienvenido a Nuevo Munich* 🍺\n_Artesanos del Sabor desde 1972._\n\n*¿En qué podemos ayudarte?* 👇"
},
action: {
buttons: [
{ type: "reply", reply: { id: "productos", title: "🧾 Productos" } },
{ type: "reply", reply: { id: "eventos", title: "🎉 Eventos" } },
{ type: "reply", reply: { id: "mas", title: "➕ Más opciones" } }
]
}
}
});
};

// ✅ SUBMENÚ
export const menuSecundario = async (to) => {
await sendMessage({
messaging_product: "whatsapp",
to,
type: "interactive",
interactive: {
type: "button",
body: { text: "*Más opciones disponibles:* 👇" },
action: {
buttons: [
{ type: "reply", reply: { id: "zonas", title: "🚚 Zonas Reparto" } },
{ type: "reply", reply: { id: "catalogo", title: "📎 Ver Catálogo" } },
{ type: "reply", reply: { id: "pedido", title: "🛒 Hacer Pedido" } }
]
}
}
});
};

// ✅ RESPUESTA AUTOMÁTICA AL RECIBIR MENSAJE
export const handleIncoming = async (msg) => {
const from = msg.from;
const text = msg.text?.body?.toLowerCase() || msg.interactive?.button_reply?.id;

console.log("📩 Mensaje recibido:", text);

if (text.includes("hola") || text.includes("buenas") || text.includes("menu"))
return menuPrincipal(from);

if (text === "mas")
return menuSecundario(from);

if (text === "productos")
return sendMessage({
messaging_product: "whatsapp",
to: from,
type: "text",
text: { body: "🧾 *Pronto te mostraré los productos en formato carrusel.*" }
});

if (text === "catalogo")
return sendMessage({
messaging_product: "whatsapp",
to: from,
type: "document",
document: {
link: "https://tu-catalogo-online-o-pdf.com/catalogo.pdf",
filename: "Catalogo Nuevo Munich.pdf"
}
});

return sendMessage({
messaging_product: "whatsapp",
to: from,
type: "text",
text: { body: "No entendí 🧐 escribí *menu* para ver opciones." }
});
};

