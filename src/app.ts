import { Bot } from "@maxhub/max-bot-api";
import {config} from "dotenv";
import {actions} from "./commands";
import { Buttons } from "./command.button";
import { CommandsName } from "./consts";
import { startTracker } from "./tracker";

const init = async () => {
    const {error, parsed} = config();

    if(error) {
        throw new Error('Error parse .env');
    }

    if(!parsed) {
        throw new Error("Config .env is empty")
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
