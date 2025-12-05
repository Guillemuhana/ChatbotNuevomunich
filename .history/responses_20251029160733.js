import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_NUMBER_ID;
const VENTAS = "5493517010545"; // derivación a ventas

// Cache para media almacenada
const cachePath = "media-cache.json";
let cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath)) : {};
const saveCache = () => fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));

// Subir medios a WhatsApp
async function uploadMedia(filePath) {
const resolved = path.join(process.cwd(), filePath);

if (cache[resolved]) return cache[resolved];

const form = new FormData();
form.append("file", fs.createReadStream(resolved));
form.append("messaging_product", "whatsapp");

const res = await axios.post(
`https://graph.facebook.com/v17.0/${PHONE_ID}/media`,
form,
{ headers: { Authorization: `Bearer ${TOKEN}`, ...form.getHeaders() } }
);

cache[resolved] = res.data.id;
saveCache();
return res.data.id;
}

// ---- Envíos ----
async function sendText(to, text) {
await axios.post(
`https://graph.facebook.com/v17.0/${PHONE_ID}/messages`,
{ messaging_product: "whatsapp", to, type: "text", text: { body: text } },
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

async function sendImage(to, filePath, caption) {
const id = await uploadMedia(filePath);
await axios.post(
`https://graph.facebook.com/v17.0/${PHONE_ID}/messages`,
{ messaging_product: "whatsapp", to, type: "image", image: { id, caption } },
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

async function sendDocument(to, filePath, caption) {
const id = await uploadMedia(filePath);
await axios.post(
`https://graph.facebook.com/v17.0/${PHONE_ID}/messages`,
{ messaging_product: "whatsapp", to, type: "document", document: { id, caption } },
{ headers: { Authorization: `Bearer ${TOKEN}` } }
);
}

// ---- BOT ----
export async function handleIncoming(from, text, button) {
text = text?.toLowerCase() || "";

// Bienvenida con logo
if (["hola", "menu", "buenas", ""].some(w => text.includes(w))) {
await sendImage(from, "logo.png", "🍻 *Nuevo Munich*\nArtesanos del Sabor desde 1972.");
return sendText(from, `¿Qué necesitás?\n\n- Escribí *feteados*\n- Escribí *catálogo*\n- Escribí *contacto*`);
}

// Feteados - listado
if (text.includes("feteados")) {
return sendText(from, `🥩 *Feteados disponibles:*\n- bondiola\n- arrollado de pollo\n\nEjemplo: escribí *bondiola*`);
}

// Bondiola
if (text.includes("bondiola")) {
return sendImage(
from,
"imgProductos/feteados/bondiola.jpg",
"🥩 *Bondiola*\nSuave, artesanal, ideal picadas y sándwiches."
);
}

// Arrollado de pollo
if (text.includes("arrollado de pollo")) {
return sendImage(
from,
"imgProductos/feteados/Arrollado de Pollo.jpg",
"🍗 *Arrollado de Pollo*\nClásico y equilibrado."
);
}

// Catálogo PDF
if (text.includes("catalogo") || text.includes("catálogo")) {
return sendDocument(from, "Catalogo.pdf", "📄 Catálogo Nuevo Munich");
}

// Contacto
if (text.includes("contacto") || text.includes("pedido") || text.includes("comprar")) {
await sendText(from, `Perfecto 👍\nPasame tu *nombre* y *ciudad*.\nUn asesor te responderá a la brevedad.`);
return sendText(VENTAS, `📌 Nuevo lead desde el bot: ${from}`);
}

return sendText(from, `No entendí 🤔\nEscribí: *menu*`);
}

