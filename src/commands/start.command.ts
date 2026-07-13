import { Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { Buttons } from "../command.button";

const action = (bot: Bot) => {
    bot.command('start', async (ctx) => {
        const {text, attachments} = await Buttons[CommandsName.Start]();
        ctx.reply(text, { attachments });
    });
}
export default action;
