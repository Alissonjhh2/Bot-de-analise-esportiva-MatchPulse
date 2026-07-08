import { logger } from '@matchpulse/logger';
import { prisma } from '../lib/prisma';
import TelegramBot from 'node-telegram-bot-api';

export class TelegramBotService {
  private bot: TelegramBot | null = null;
  private apiBaseUrl: string;

  constructor() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:4000';

    if (botToken) {
      this.bot = new TelegramBot(botToken, { polling: false });
    }
  }

  async startPolling() {
    if (!this.bot) {
      logger.warn('TELEGRAM_BOT_TOKEN not set, Telegram bot disabled');
      return;
    }

    logger.info('🤖 Starting Telegram bot polling with official library...');

    // Delete any existing webhook to avoid conflicts
    try {
      await this.bot.deleteWebhook({ drop_pending_updates: true });
      logger.info('🤖 Deleted existing webhook to avoid conflicts');
    } catch (error) {
      logger.warn('Could not delete webhook');
    }

    // Add a small delay to ensure webhook deletion is processed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Set up polling with the official library
    this.bot.on('message', async (msg) => {
      await this.handleMessage(msg);
    });

    this.bot.on('polling_error', (error) => {
      // Ignore 409 conflicts as they may occur during startup
      if (error.message && error.message.includes('409 Conflict')) {
        logger.warn('⚠️ Telegram polling conflict detected, but continuing...');
        return;
      }
      logger.error('Telegram polling error:', error);
    });

    // Start polling
    this.bot.startPolling();
    
    logger.info('🤖 Telegram bot polling started successfully');
  }

  async stopPolling() {
    if (this.bot) {
      this.bot.stopPolling();
      logger.info('🤖 Telegram bot polling stopped');
    }
  }

  private async handleMessage(msg: any) {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    logger.info(`📨 Received message from ${chatId}: ${text}`);

    if (text === '/start') {
      await this.handleStart(chatId);
    } else if (text && text.length === 6 && /^[A-Z0-9]{6}$/.test(text)) {
      await this.handleCodeSubmission(chatId, text);
    } else {
      await this.sendMessage(chatId, 'Comando não reconhecido. Use /start para começar.');
    }
  }

  private async handleStart(chatId: number) {
    const message = `
🎯 **Bem-vindo ao MatchPulse!**

Para conectar sua conta, siga estes passos:

1. Acesse o painel em http://localhost:3000/dashboard/telegram
2. Clique em "Gerar Código"
3. Copie o código gerado
4. Envie o código aqui no Telegram

O código é válido por 5 minutos.
    `.trim();

    await this.sendMessage(chatId, message);
  }

  private async handleCodeSubmission(chatId: number, code: string) {
    try {
      // Verify code with API
      const response = await fetch(`${this.apiBaseUrl}/api/v1/telegram/verify-link-code/${code}`);
      const data = await response.json() as { success: boolean; data?: { userId: string } };

      if (!data.success || !data.data) {
        await this.sendMessage(chatId, '❌ Código inválido ou expirado. Tente gerar um novo código.');
        return;
      }

      const { userId } = data.data;

      // Create Telegram connection
      await prisma.telegramConnection.upsert({
        where: { userId },
        update: { chatId: chatId.toString() },
        create: {
          userId,
          chatId: chatId.toString(),
          username: '',
          firstName: '',
        },
      });

      logger.info(`✅ Telegram connected: userId=${userId}, chatId=${chatId}`);

      await this.sendMessage(chatId, '✅ Telegram conectado com sucesso! Você receberá alertas em tempo real.');
    } catch (error) {
      logger.error('Error handling code submission:', error as Error);
      await this.sendMessage(chatId, '❌ Erro ao conectar. Tente novamente.');
    }
  }

  private async sendMessage(chatId: number, text: string) {
    if (!this.bot) return;

    try {
      await this.bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    } catch (error) {
      logger.error('Error sending Telegram message:', error as Error);
    }
  }

  async sendNotification(userId: string, message: string) {
    try {
      logger.info(`📤 Attempting to send notification to userId: ${userId}`);
      
      const connection = await prisma.telegramConnection.findUnique({
        where: { userId },
      });

      if (!connection) {
        logger.info(`❌ No Telegram connection for user ${userId}`);
        return;
      }

      logger.info(`✅ Found Telegram connection: chatId=${connection.chatId}`);
      await this.sendMessage(parseInt(connection.chatId), message);
      logger.info(`📤 Telegram notification sent to ${connection.chatId}`);
    } catch (error) {
      logger.error('Error sending Telegram notification:', error as Error);
    }
  }
}

export const telegramBotService = new TelegramBotService();
