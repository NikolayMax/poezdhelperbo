import {Command} from "../command.class";
import {Markup, Telegraf} from "telegraf";
import {CommandsName} from "../consts";
import {BotContext} from "../../types/context";

export class WatchFromAction extends Command {
    constructor(bot: Telegraf<BotContext>) {
        super(bot);
    }

    handler(): void {
        this.bot.action(CommandsName.WatchFrom, (ctx) => {
            ctx.answerCbQuery();
            ctx.editMessageText('Параметры поиска: ', Markup.inlineKeyboard([
                Markup.button.callback((ctx.session.selectedYear ? "✅ " : "") + "Выберите дату: ", CommandsName.WatchDate),
                Markup.button.callback("Город откуда: ", CommandsName.WatchFrom),
                Markup.button.callback("Город куда: ", CommandsName.WatchTo),
                Markup.button.callback("НАЙТИ", CommandsName.WatchFind),
                Markup.button.callback("Главное меню", CommandsName.Start)
            ], {columns: 2}))
        })
    }

}