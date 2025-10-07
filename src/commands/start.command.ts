import {Command} from "./command.class";
import {Markup, Telegraf} from "telegraf";

export class StartCommand extends Command{
    constructor(bot: Telegraf) {
        super(bot);
    }
    handler(){
        this.bot.start((ctx) => {
            console.log(ctx);
            ctx.reply('Привет! Тут ты сможешь оследить свой поезд или электричку', Markup.inlineKeyboard([
                Markup.button.callback("Начать поиск", "watch_schedule"),
                Markup.button.callback("Баланс", "balance"),
                Markup.button.callback("Помощь", "help")
            ]))
        });
    }
}