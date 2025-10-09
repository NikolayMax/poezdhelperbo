import { Telegraf} from "telegraf";
import { CommandsName} from "../consts";
import {BotContext} from "../types/context";
import {Buttons} from "../command.button";

const action = (bot: Telegraf<BotContext>) => {
    bot.action(CommandsName.WatchDate, async (ctx) => {
        const {text, buttons} = await Buttons[CommandsName.WatchDate](ctx, bot);
        ctx.reply(text, buttons)
    })
}

export default action;