import { Bot } from "@maxhub/max-bot-api";
import { Buttons } from "../command.button";
import { CommandsName } from "../consts";
import { userRedis } from "../redis";

function setDateAndShowWatch(ctx: any, userId: number, year: number, month: number, day: number) {
    return async () => {
        const userData = await userRedis.getData(userId);
        userData.selectedYear = year;
        userData.selectedMonth = month;
        userData.selectedDay = day;
        await userRedis.setData(userId, userData);
        const {text, attachments} = await Buttons[CommandsName.Watch](ctx);
        ctx.reply(text, { attachments });
    };
}

const actionDay = (bot: Bot) => {
    bot.action('today', async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }
        const now = new Date();
        await setDateAndShowWatch(ctx, userId, now.getFullYear(), now.getMonth(), now.getDate())();
    });

    bot.action('tomorrow', async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await setDateAndShowWatch(ctx, userId, tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())();
    });

    bot.action(new RegExp(CommandsName.Day), async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }
        const userData = await userRedis.getData(userId);

        const day = Number(ctx.match?.[1]);
        if (isNaN(day)) return;
        userData.selectedDay = day;
        await userRedis.setData(userId, userData);

        const {text, attachments} = await Buttons[CommandsName.Watch](ctx);
        ctx.reply(text, { attachments })
    })
}

export default actionDay;
