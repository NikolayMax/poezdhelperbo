import { Bot } from '@maxhub/max-bot-api';
import { config } from 'dotenv';
import Database from 'better-sqlite3';
import path from 'path';

const { parsed } = config();

if (!parsed?.MAX_BOT_TOKEN) {
  console.error('MAX_BOT_TOKEN not found in .env');
  process.exit(1);
}

const bot = new Bot(parsed.MAX_BOT_TOKEN);
const db = new Database(path.resolve(__dirname, '..', 'data', 'bot.db'));

interface IUser {
  user_id: number;
  name: string | null;
  subscribed: number;
}

async function isSubscribedToChannel(userId: number, channelId: string): Promise<boolean> {
  try {
    const response = await (bot.api.raw as any).get(`chats/${channelId}/members`, {
      query: { user_ids: String(userId) },
    });
    return response?.members?.some((m: any) => m.user_id === userId) === true;
  } catch (err: any) {
    console.error(`  ERROR checking userId=${userId}:`, err?.message ?? err);
    return false;
  }
}

async function main() {
  const channelId = process.env.CHANNEL_ID;
  if (!channelId) {
    console.error('CHANNEL_ID not set in .env');
    process.exit(1);
  }

  const userLink = 'https://max.ru/id740705993659_4_bot';

  const users = db.prepare('SELECT user_id, name, subscribed FROM users WHERE subscribed = 0').all() as IUser[];
  console.log(`Found ${users.length} users with subscribed=0\n`);

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    const name = user.name || `user_${user.user_id}`;
    process.stdout.write(`[${name}] checking... `);

    const subscribed = await isSubscribedToChannel(user.user_id, channelId);

    if (subscribed) {
      try {
        await bot.api.sendMessageToUser(
          user.user_id,
          '✅ Исправлена ошибка проверки подписки!\n\n' +
          'Ранее бот мог ошибочно считать, что вы не подписаны на канал. ' +
          'Сейчас всё работает корректно.\n\n' +
          `Откройте бот: ${userLink}\n` +
          'И нажмите /start',
          { format: 'html' }
        );

        db.prepare('UPDATE users SET subscribed = 1 WHERE user_id = ?').run(user.user_id);
        console.log('✅ подписан, уведомление отправлено');
        sent++;
      } catch (err: any) {
        console.error('❌ ошибка отправки:', err?.message ?? err);
        errors++;
      }
    } else {
      console.log('❌ не подписан, пропущен');
      skipped++;
    }
  }

  console.log(`\nГотово: отправлено ${sent}, пропущено ${skipped}, ошибок ${errors}`);

  db.close();
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
