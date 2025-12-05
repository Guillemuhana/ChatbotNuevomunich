import fs from "fs";

export async function handleIncoming(msg, sendMessage, sendImage) {
const from = msg.from;

// ✅ Convertir el mensaje a texto seguro
const raw = msg.text?.body;
const text = typeof raw === "string" ? raw.toLowerCase().trim() : "";

// ✅ SALUDO / INICIO
const saludos = ["hola", "buenas", "hello", "qué tal"];
if (saludos.some(s => text.includes(s))) {
await sendImage(from, "./logo.png", "Nuevo Munich\nArtesanos del sabor desde 1972.");
await sendMessage(from,
`¿Qué necesitás?

• Escribí *productos*
• Escribí *eventos*
• Escribí *zonas de reparto*
• Escribí *provincias*
• Escribí *otras consultas*`);
return;
}

// ✅ MENÚ PRODUCTOS
if (text === "productos") {
await sendMessage(from,
`Tenemos varias líneas, por ahora activamos *Feteados* 🍖

Escribí:
• *feteados*
• *volver*`);
return;
}

// ✅ LISTA DE FETEADOS
if (text === "feteados") {
const lista = fs.readdirSync("./imgProductos/feteados")
.map(f => "• " + f.replace(".jpg", ""))
.join("\n");

await sendMessage(from,
`Productos Feteados disponibles:

${lista}

📌 Escribí el nombre EXACTO del producto para ver la imagen.`);
return;
}

// ✅ DETECCIÓN AUTOMÁTICA DE NOMBRE DE PRODUCTO
const feteadosFiles = fs.readdirSync("./imgProductos/feteados");
const match = feteadosFiles.find(f => f.toLowerCase().includes(text));

if (match) {
await sendImage(from, `./imgProductos/feteados/${match}`, match.replace(".jpg", ""));
return;
}

// ✅ CATÁLOGO COMPLETO
if (text.includes("catálogo") || text.includes("catalogo")) {
await sendMessage(from, "📄 Te envío el catálogo completo próximamente.");
return;
}

// ✅ CONSULTAS GENERALES (IA SIMPLE)
if (["día", "hora", "como estas", "precio", "?"].some(w => text.includes(w))) {
await sendMessage(from, "Estoy asistente de Nuevo Munich 😊 Decime y te ayudo.");
return;
}

// ✅ POR DEFECTO
await sendMessage(from,
`No entendí bien 🤔

Probá escribir:
• *productos*
• *eventos*
• *zonas de reparto*
• *provincias*
• *otras consultas*`);
}