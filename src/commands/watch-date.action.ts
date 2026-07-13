import { Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { Buttons } from "../command.button";

const action = (bot: Bot) => {
    bot.action(CommandsName.WatchDate, async (ctx) => {
        const {text, attachments} = await Buttons[CommandsName.WatchDate](ctx);
        ctx.reply(text, { attachments })
    })
}

export default action;
