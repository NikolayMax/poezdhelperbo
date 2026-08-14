import { Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { Buttons } from "../command.button";
import { guardSubscription } from "../referral";

const action = (bot: Bot) => {
    bot.action(CommandsName.Watch, async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }
        if (!await guardSubscription(ctx, userId, bot)) return;
        const {text, attachments} = await Buttons[CommandsName.Watch](ctx);
        ctx.reply(text, { attachments })
    })
}
export default action;
