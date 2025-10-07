import {Command} from "./command.class";
import {Markup, Telegraf} from "telegraf";
import {CommandsName} from "./consts";
import {BotContext} from "../types/context";

export class StartAction extends Command{
    constructor(bot: Telegraf<BotContext>) {
        super(bot);
    }

    handler(){
        this.bot.action(CommandsName.Start, (ctx) => {
            ctx.answerCbQuery();
            ctx.editMessageText('Привет! Тут ты сможешь оследить свой поезд или электричку', Markup.inlineKeyboard([
                Markup.button.callback("Начать поиск", CommandsName.Watch),
                Markup.button.callback("Баланс", CommandsName.Balance),
                Markup.button.callback("Помощь", CommandsName.Help)
            ]))
        });
    }
}