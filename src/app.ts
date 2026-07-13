import { Bot } from "@maxhub/max-bot-api";
import {config} from "dotenv";
import {actions} from "./commands";
import { Buttons } from "./command.button";
import { CommandsName } from "./consts";
import { startTracker } from "./tracker";

class App {
	botTelegram: BotTelegram | undefined;

	constructor() {
		const { parsed } = config();

		if (!parsed) {
			console.error('Error: .env file not found');
			return;
		}
		if (parsed && !('TELEGRAM_KEY' in parsed)) {
			console.error('Error: TELEGRAM_KEY is not defined in .env');
			return;
		}
		if (!parsed.TELEGRAM_KEY) {
			console.error('Error: TELEGRAM_KEY is empty');
			return;
		}
		if (!parsed.REDIS_URL) {
			console.error('Error: REDIS_URL is not defined in .env');
			return;
		}

    if(!parsed.MAX_BOT_TOKEN) {
        throw new Error("MAX_BOT_TOKEN not found in .env");
    }

    const bot = new Bot(parsed.MAX_BOT_TOKEN);

    bot.on('bot_started', (ctx) => {
        bot.api.setMyCommands([
            { name: 'start',   description: 'Перезапустить бота' },
            { name: 'help',    description: 'Помощь' },
            { name: 'balance', description: 'Проверить баланс' },
        ]);
        const { text, attachments } = Buttons[CommandsName.Start]();
        ctx.reply(text, { attachments });
    });

    bot.on('message_callback', (ctx, next) => {
        ctx.answerOnCallback({ notification: '' });
        return next();
    })

    for(const action of actions){
        action(bot);
    }

    startTracker((userId, track) => {
        bot.api.sendMessageToUser(
            userId,
            `🚂 <b>${track.train_number}</b> — ${track.train_name}\n💺 Появились свободные места!\n📅 ${track.date}  🕒 ${track.departure_time} → ${track.arrival_time}\n\nПроверьте в разделе «Мои электрички».`,
            { format: 'html' }
        ).catch(() => {});
    });

    bot.catch((err) => console.error('[BOT ERROR]', err));
    bot.start();
}
init()
