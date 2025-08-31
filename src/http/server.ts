import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { Bot, Context, webhookCallback } from "grammy";

dotenv.config();

const app = express();
app.use(express.json());

const { TELEGRAM_LEOBOT_TOKEN, URL_NGROK, PORT } = process.env;

if (!TELEGRAM_LEOBOT_TOKEN || !URL_NGROK) {
  throw new Error(
    "As variáveis TEL_TOKEN e URL_NGROK são obrigatórias no .env"
  );
}
const WEBHOOK_URL = `${URL_NGROK}/webhook/${TELEGRAM_LEOBOT_TOKEN}`;
const WEBHOOK_END = `/webhook/${TELEGRAM_LEOBOT_TOKEN}`;

console.log("WEBHOOK_URL >> ", WEBHOOK_URL);

// Initialize Telegram bot with grammY
const bot = new Bot(TELEGRAM_LEOBOT_TOKEN);

// Handle text messages with grammY
bot.on("message:text", async (ctx: Context) => {
  try {
    console.log("Mensagem recebida: ", ctx.update);

    const msg = ctx.message;
    if (!msg) return;

    const chatId = msg.chat.id;
    const text = msg.text || "";
    const name = msg.from?.first_name;

    await ctx.reply(`Olá ${name || "usuário"}, você disse: ${text}`);
  } catch (error) {
    console.error("Erro ao processar mensagem: ", error);
  }
});

app.get("/", (req: Request, res: Response) => {
  const payload = {
    name: "bot Telegram API",
    status: "online",
    version: "1.0.1",
    documentation: "/",
    timestamp: new Date().toISOString(),
    endpoints: {
      base: "/api",
      auth: "/api/telegram",
    },
  };

  return res.json(payload);
});

app.listen(Number(PORT) || 8080, async () => {
  console.log("Servidor rodando na porta", PORT || 8080);
  // Configure webhook with grammY
  // Set webhook URL in Telegram and attach grammY express middleware
  try {
    await bot.api.setWebhook(WEBHOOK_URL);
    app.use(WEBHOOK_END, webhookCallback(bot, "express"));
    console.log("Webhook configurado em:", WEBHOOK_URL);
  } catch (err) {
    console.error("Erro ao configurar webhook: ", err);
  }
});
