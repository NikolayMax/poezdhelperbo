import {Command} from "./command.class";
import {Markup, Telegraf} from "telegraf";
import {CommandsName} from "./consts";
import {BotContext} from "../types/context";

export class BalanceAction extends Command{
    constructor(bot: Telegraf<BotContext>) {
        super(bot);
    }

    handler(): void {
        this.bot.action(CommandsName.Balance, (ctx) => {
            // ctx.answerCbQuery();
            ctx.editMessageText('Ваш Баланс: 10 запросов', Markup.inlineKeyboard([
                Markup.button.callback("Главное меню", CommandsName.Start)
            ]));
        })
    }

}