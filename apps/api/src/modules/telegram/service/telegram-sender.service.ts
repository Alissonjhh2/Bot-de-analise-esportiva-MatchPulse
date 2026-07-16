import { env } from '../../../common/config/env-validation';
import { logger } from '@matchpulse/logger';
import { telegramService } from './telegram.service';

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown';
}

export class TelegramSenderService {
  private botToken: string;
  private apiUrl: string;

  constructor() {
    this.botToken = env.TELEGRAM_BOT_TOKEN || '';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async sendMessage(message: TelegramMessage): Promise<boolean> {
    if (!this.botToken) {
      logger.warn('TELEGRAM_BOT_TOKEN not configured, skipping message send');
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: message.chatId,
          text: message.text,
          parse_mode: message.parseMode || 'HTML',
        }),
      });

      const data = await response.json() as { ok: boolean; description?: string };

      if (!data.ok) {
        logger.error('Telegram API error', { error: data.description });
        return false;
      }

      logger.info('Telegram message sent successfully', { chatId: message.chatId });
      return true;
    } catch (error) {
      logger.error('Error sending Telegram message', error as Error);
      return false;
    }
  }

  async sendMatchHitNotification(userId: string, strategyName: string, matchName: string, championship: string, conditions: string[]): Promise<boolean> {
    try {
      const connection = await telegramService.getConnection(userId);
      
      if (!connection) {
        logger.warn('No Telegram connection found for user', { userId });
        return false;
      }

      const message = this.formatMatchHitMessage(strategyName, matchName, championship, conditions);
      
      return await this.sendMessage({
        chatId: connection.chatId,
        text: message,
        parseMode: 'HTML',
      });
    } catch (error) {
      logger.error('Error sending match hit notification', error as Error);
      return false;
    }
  }

  private formatMatchHitMessage(strategyName: string, matchName: string, championship: string, conditions: string[]): string {
    const conditionsText = conditions.map(c => `• ${c}`).join('\n');
    
    return `
🎯 <b>MatchPulse - Estratégia Acionada!</b>

📊 <b>Estratégia:</b> ${strategyName}
⚽ <b>Jogo:</b> ${matchName}
🏆 <b>Campeonato:</b> ${championship}

<b>Condições atendidas:</b>
${conditionsText}

⏰ <i>Enviado em ${new Date().toLocaleString('pt-BR')}</i>
    `.trim();
  }
}

export const telegramSenderService = new TelegramSenderService();
