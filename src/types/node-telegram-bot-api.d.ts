declare module "node-telegram-bot-api" {
  interface SendMessageOptions {
    parse_mode?: string;
  }

  interface WebhookConfig {
    url: string;
  }

  class TelegramBot {
    constructor(token: string, options?: { polling?: boolean });
    setWebHook(url: string): Promise<any>;
    sendMessage(
      chatId: number | string,
      text: string,
      options?: SendMessageOptions
    ): Promise<any>;
    processUpdate(update: any): void;
  }

  export default TelegramBot;
}
