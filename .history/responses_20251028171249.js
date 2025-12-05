import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import "dotenv/config";
import { responses } from "./responses.js";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "guille123";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado correctamente");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body?.toLowerCase() || "";
    const buttonId = message.button?.payload?.toLowerCase() || "";

    const input = buttonId || text;
    console.log(`📩 Mensaje recibido de ${from}: ${input}`);

    let reply = responses.error;

    if (["hola", "buenas", "nuevo munich", "inicio"].some(w => input.includes(w))) reply = responses.saludo;
    else if (input.includes("producto")) reply = responses.productos;
    else if (input.includes("catalogo")) reply = responses.catalogo;
    else if (input.includes("distribuidor")) reply = responses.distribuidores;
    else if (input.includes("contacto") || input.includes("whatsapp")) reply = responses.contacto;
    else if (input.includes("ubicacion") || input.includes("direccion")) reply = responses.ubicacion;

    await sendResponse(from, reply);
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// ============================
// 📤 Enviar mensaje a WhatsApp
// ============================
async function sendResponse(to, reply) {
  try {
    // Enviar imagen si la respuesta tiene una
    if (reply.image) {
      await axios.post(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp",
        to,
        type: "image",
        image: { link: reply.image, caption: reply.text }
      }, {
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
      });
    }
    // Enviar botones si existen
    else if (reply.buttons) {
      await axios.post(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: reply.text },
          action: {
            buttons: reply.buttons.map(b => ({
              type: "reply",
              reply: { id: b.id, title: b.title }
            }))
          }
        }
      }, {
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
      });
    }
    // Enviar texto simple
    else {
      await axios.post(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: reply.text }
      }, {
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
      });
    }

    console.log(`📤 Respuesta enviada a ${to}`);
  } catch (err) {
    console.error("⚠️ Error al enviar mensaje:", err.response?.data || err.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot Nuevo Munich activo en http://localhost:${PORT}/webhook`));
