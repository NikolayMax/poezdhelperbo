import {Command} from "./command.class";
import {Telegraf} from "telegraf";
import {BotContext} from "../types/context";
import {CommandsName} from "./consts";
//https://api.svrpk.ru/api/v1/suggest/stations?name=%D0%A7%D0%B5
export class CityFromAction extends Command {
    constructor(bot: Telegraf<BotContext>) {
        super(bot);
    }

    handler(): void {
        this.bot.action(CommandsName.CityFrom, (ctx) => {
            ctx.answerCbQuery();
            ctx.session.prevMessageId = ctx.msgId;
            ctx.editMessageText('Введите город откуда:')
        })

        this.bot.on('message', (ctx) => {
            ctx.deleteMessage(ctx.session.prevMessageId);
            console.log('Получено сообщение:', ctx.message);
            console.log('От пользователя:', ctx.from.username);
            console.log('В чате:', ctx.chat.id);
        });
    }
}