import { Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { Buttons } from "../command.button";
import { userRedis } from "../redis";

const actionMonth = (bot: Bot) => {
    bot.action(new RegExp(CommandsName.Month), async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }
        const userData = await userRedis.getData(userId);
        const month = Number(ctx.match?.[1]);
        if (isNaN(month)) return;
        userData.selectedMonth = month;
        await userRedis.setData(userId, userData);

        const {text, attachments} = await Buttons[CommandsName.Month](ctx)

        ctx.reply(text, { attachments })
    })
}

export default actionMonth;
