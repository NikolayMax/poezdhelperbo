import { Bot } from "@maxhub/max-bot-api";
import { CommandsName, CurrentSelectCity } from "../consts";
import { Buttons } from "../command.button";
import { userRedis } from "../redis";

export const actionSelectCity = (bot: Bot) => {
    bot.action(new RegExp(CommandsName.SelectCity), async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }
        const slug = ctx.match?.[1];
        if (!slug) return;
        const userData = await userRedis.getData(userId);
        const currentCity = userData?.cities?.find((city) => city.slug === slug);

        if (!currentCity) {
            console.warn(`[SELECT-CITY] userId=${userId} slug=${slug} NOT FOUND in cities list`);
            await ctx.answerOnCallback({ notification: '❌ Город не найден. Попробуйте снова.' }).catch(() => {});
            return;
        }

        if(userData.currentSelectCity === CurrentSelectCity.From) {
            userData.cityFrom = currentCity
        } else {
            userData.cityTo = currentCity
        }

        await userRedis.setData(userId, userData);

        const {text, attachments} = await Buttons[CommandsName.Watch](ctx)
        ctx.reply(text, { attachments })
    });
}
