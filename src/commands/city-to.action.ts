import { Bot } from "@maxhub/max-bot-api";
import { CommandsName, CurrentSelectCity } from "../consts";
import { Buttons } from "../command.button";
import { userRedis } from "../redis";
import { guardSubscription } from "../referral";

const action = (bot: Bot) => {
    bot.action(CommandsName.CityTo, async (ctx) => {
        const {text} = await Buttons[CommandsName.CityTo]();
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }
        if (!await guardSubscription(ctx, userId, bot)) return;
        const userData = await userRedis.getData(userId);
        userData.currentSelectCity = CurrentSelectCity.To;
        await userRedis.setData(userId, userData);
        ctx.reply(text)
    })
}

export default action;
