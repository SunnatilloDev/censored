import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Bot, Context } from 'grammy';
import bot from 'src/bot/bot';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Bot;

  constructor(private readonly prisma: PrismaService) {
    this.bot = bot;
  }

  async onModuleInit() {
    this.bot.command('start', (ctx) => {
      ctx.reply('Welcome to the bot!');
    });

    this.bot.on('chat_member', async (ctx: Context) => {
      try {
        const chatMemberUpdate = ctx.chatMember;

        // Detect if the user has joined
        if (
          chatMemberUpdate.new_chat_member &&
          chatMemberUpdate.new_chat_member.status === 'member'
        ) {
          const user = chatMemberUpdate.new_chat_member.user;
          console.log(`${user.first_name} joined the chat!`);
          await ctx.reply(`Welcome ${user.first_name} to the chat!`);
        }

        // Detect if the user has left or was kicked
        if (
          chatMemberUpdate.old_chat_member &&
          chatMemberUpdate.new_chat_member.status === 'left'
        ) {
          const user = chatMemberUpdate.old_chat_member.user;
          console.log(`${user.first_name} left the chat.`);
          await ctx.reply(`${user.first_name} has left the chat.`);
        }
      } catch (error) {
        console.error('Error handling chat member update:', error);
        throw new InternalServerErrorException(
          'Error processing chat member update.',
        );
      }
    });

    this.bot.start();
    console.log('Telegram bot started...');
  }

  @Cron('*/5 * * * *')
  async checkAllUserSubscriptions() {
    try {
      const users = await this.prisma.user.findMany();

      for (const user of users) {
        const isSubscribed = await this.checkUserSubscription(user.telegramId);

        if (!isSubscribed) {
          await this.sendMessage(
            user.telegramId,
            'You have left the channel. Please rejoin to continue using our services: https://t.me/YourChannelLink',
          );
        }
      }
    } catch (error) {
      console.error('Error checking all user subscriptions:', error);
      throw new InternalServerErrorException(
        'Failed to check user subscriptions.',
      );
    }
  }

  async checkUserSubscription(telegramId: string): Promise<boolean> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${botToken}/getChatMember`,
        {
          params: {
            chat_id: channelId,
            user_id: telegramId,
          },
        },
      );

      const status = response.data.result.status;

      return (
        status === 'member' ||
        status === 'administrator' ||
        status === 'creator'
      );
    } catch (error) {
      console.error('Error checking Telegram subscription:', error);

      if (error.response && error.response.data) {
        throw new InternalServerErrorException(
          `Telegram API Error: ${error.response.data.description}`,
        );
      }

      throw new InternalServerErrorException(
        'Failed to check Telegram subscription.',
      );
    }
  }

  async sendMessage(telegramId: string, message: string): Promise<void> {
    try {
      await this.bot.api.sendMessage(telegramId, message);
    } catch (error) {
      console.error(`Error sending message to ${telegramId}:`, error);
      throw new InternalServerErrorException(`Failed to send message to user.`);
    }
  }
}
