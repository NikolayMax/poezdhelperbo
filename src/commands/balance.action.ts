import {Telegraf} from "telegraf";
import {CommandsName} from "../consts";
import {BotContext} from "../types/context";
import {Buttons} from "../command.button";

const action = (bot: Telegraf<BotContext>) => {
    bot.action(CommandsName.Balance, (ctx) => {
        const {text, buttons} = Buttons[CommandsName.Balance](ctx)
        ctx.reply(text, buttons);
    })
}
export default action;