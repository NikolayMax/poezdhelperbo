import { Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { Buttons } from "../command.button";

const action = (bot: Bot) => {
    bot.action(CommandsName.Buy, async (ctx) => {
        const {text, attachments} = Buttons[CommandsName.Buy]()
        ctx.reply(text, { attachments });
    })
}
export default action;