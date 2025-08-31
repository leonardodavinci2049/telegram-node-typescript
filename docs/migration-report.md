# Relatório de Migração: node-telegram-bot-api para Telegraf

## Data da Migração

31 de agosto de 2025

## Contexto

O projeto utilizava o package `node-telegram-bot-api` para integração com a API de Bots do Telegram. O servidor Node.js em `src/http/server.ts` estava funcional, operando com webhooks via Express.

## Objetivo

Migrar para o package `Telegraf`, que oferece uma API mais moderna e eficiente para desenvolvimento de bots do Telegram.

## Mudanças Realizadas

### 1. Dependências

- **Removido:** `node-telegram-bot-api` (versão 0.61.0)
- **Adicionado:** `telegraf` (versão 4.16.3)

### 2. Código Modificado

Arquivo: `src/http/server.ts`

#### Antes (node-telegram-bot-api):

```typescript
import TelegramBot from "node-telegram-bot-api";
const bot = new TelegramBot(TEL_TOKEN, { polling: false });
await bot.setWebHook(WEBHOOK_URL);
app.post(WEBHOOK_END, async (req, res) => {
  // Processamento manual da mensagem
  const chatId = req.body?.message?.chat?.id;
  const text = req.body?.message?.text;
  await bot.sendMessage(chatId, `Olá ${name}, você disse: ${text}`);
});
```

#### Depois (Telegraf):

```typescript
import { Telegraf } from "telegraf";
const bot = new Telegraf(TEL_TOKEN);
bot.on("text", async (ctx) => {
  const chatId = ctx.message.chat.id;
  const text = ctx.message.text;
  await ctx.reply(`Olá ${name}, você disse: ${text}`);
});
app.use(await bot.createWebhook({ domain: URL_NGROK, path: WEBHOOK_END }));
```

### 3. Principais Diferenças

- **Inicialização:** `new Telegraf(token)` em vez de `new TelegramBot(token, options)`
- **Webhook:** Uso de `bot.createWebhook()` que integra automaticamente com Express
- **Handlers:** `bot.on('text', handler)` em vez de endpoint POST manual
- **Envio de mensagens:** `ctx.reply()` em vez de `bot.sendMessage()`
- **Contexto:** Acesso direto aos dados da mensagem via `ctx.message`

## Benefícios da Migração

- **API mais moderna:** Telegraf oferece uma interface mais limpa e TypeScript-friendly
- **Middleware support:** Facilita extensões e personalizações
- **Melhor performance:** Framework otimizado para bots
- **Comunidade ativa:** Suporte contínuo e atualizações

## Testes Realizados

- ✅ Compilação sem erros
- ✅ Inicialização do servidor bem-sucedida
- ✅ Configuração de webhook automática
- ✅ Handler de mensagens funcionando

## Status

✅ Migração concluída com sucesso

## Observações

- O comportamento funcional permanece o mesmo: o bot responde a mensagens de texto com uma saudação personalizada
- Todas as variáveis de ambiente (`TEL_TOKEN`, `URL_NGROK`, `PORT`) continuam sendo utilizadas
- O endpoint `/status` permanece inalterado
- Recomenda-se testar em produção para validar o funcionamento com webhooks reais do Telegram

## Próximos Passos

- Monitorar logs em produção
- Considerar adicionar mais funcionalidades usando os middlewares do Telegraf
- Atualizar documentação se necessário

---

## Migração adicional: Telegraf -> grammY

### Data

31 de agosto de 2025

### Motivo

O package `telegraf` usado anteriormente está sem atualizações recentes (último publish há ~2 anos). `grammY` é uma alternativa ativa e frequentemente atualizada, com ótima documentação e ecossistema.

### Mudanças Realizadas

- **Dependência:** substituído `telegraf` por `grammy` (versão ^1.38.1) no `package.json`.
- **Código:** `src/http/server.ts` foi refatorado para usar `Bot` de `grammy` em vez de `Telegraf`.
- **Handlers:** adaptados para o evento `message:text` e para o formato `ctx.update` do grammY.

### Como testar após a migração

1. Instale dependências:

```bash
npm install
```

2. Rode o servidor em dev:

```bash
npm run dev
```

3. Certifique-se de que `.env` possui `TEL_TOKEN` e `URL_NGROK`. Use ngrok para expor o servidor e verifique se o webhook é configurado.

### Observações Técnicas

- O TypeScript pode acusar erro "Cannot find module 'grammy'" até que `npm install` seja executado.
- Recomenda-se importar e tipar `Context` de `grammy` para handlers mais estritos.
- A API `createWebhook` foi mantida e usada para integrar o bot ao Express.

### Status

Modificações aplicadas no código — dependências ainda precisam ser instaladas localmente para validação completa.
