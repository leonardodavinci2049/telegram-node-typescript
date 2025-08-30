import dotenv from "dotenv";
import express, { Request, Response } from "express";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json());

const { TEL_TOKEN, URL_NGROK, PORT, TELEGRAM_API_URL } = process.env;

if (!TEL_TOKEN || !URL_NGROK) {
  throw new Error(
    "As variáveis TEL_TOKEN e URL_NGROK são obrigatórias no .env"
  );
}
if (!TELEGRAM_API_URL) {
  throw new Error(
    "A variável TELEGRAM_API_URL é obrigatória no .env e deve conter 'https://api.telegram.org/bot'"
  );
}

// Ensure TELEGRAM_API_URL ends with 'bot' (no trailing slash) or with '/bot'
const baseTelegramUrl = TELEGRAM_API_URL.endsWith("/")
  ? TELEGRAM_API_URL.slice(0, -1)
  : TELEGRAM_API_URL;

const TEL_API = `${baseTelegramUrl}${
  TEL_TOKEN.startsWith("/") ? "" : ""
}${TEL_TOKEN}`;
const WEBHOOK_URL = `${URL_NGROK}/webhook/${TEL_TOKEN}`;
const WEBHOOK_END = `/webhook/${TEL_TOKEN}`;

console.log("WEBHOOK_URL >> ", WEBHOOK_URL);

const setWebhookUrl = async (): Promise<void> => {
  try {
    const res = await axios.get(`${TEL_API}/setWebhook?url=${WEBHOOK_URL}`);
    console.log("Webhook configurado: ", res.data);
  } catch (error) {
    console.error("Erro ao configurar webhook: ", error);
  }
};

app.post(
  WEBHOOK_END,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log("req.body >> ", req.body);

      const chatId: number | undefined = req.body?.message?.chat?.id;
      const text: string | undefined = req.body?.message?.text;
      const name: string | undefined = req.body?.message?.from?.first_name;

      if (!chatId || !text) {
        return res.status(400).send({ error: "Mensagem inválida recebida" });
      }

      await axios.post(`${TEL_API}/sendMessage`, {
        chat_id: chatId,
        text: `Olá ${name || "usuário"}, você disse: ${text}`,
      });

      return res.send({ status: "Mensagem enviada com sucesso" });
    } catch (error) {
      console.error("Erro ao processar mensagem: ", error);
      return res.status(500).send({ error: "Erro interno do servidor" });
    }
  }
);

app.get("/status", (req: Request, res: Response) => {
  const payload = {
    name: "Wholesale API",
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
  await setWebhookUrl();
});
