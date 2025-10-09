import { Telegraf} from "telegraf";
import { CommandsName} from "../consts";
import {Buttons} from "../command.button";

const action = (bot: Telegraf) => {
    bot.action(CommandsName.WatchDate, async (ctx) => {
        const {text, buttons} = await Buttons[CommandsName.WatchDate](ctx);
        ctx.reply(text, buttons)
    })
}

export default action;