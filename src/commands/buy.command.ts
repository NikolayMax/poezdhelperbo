import { Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { Buttons } from "../command.button";
import { guardSubscription } from "../referral";

const action = (bot: Bot) => {
    bot.command('buy', async (ctx) => {
        const userId = ctx.message?.sender?.user_id;
        if (!userId) return;
        if (!await guardSubscription(ctx, userId, bot)) return;
        const {text, attachments} = Buttons[CommandsName.Buy]()
        ctx.reply(text, { attachments });
    })
}
export default action;