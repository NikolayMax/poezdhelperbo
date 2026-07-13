import { Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { addPaidRequests } from "../balance";

const ADMIN_ID = Number(process.env.ADMIN_USER_ID) || 0;

const action = (bot: Bot) => {
    bot.action(new RegExp(CommandsName.AdminAddBalance), async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }

        if (userId !== ADMIN_ID) {
            return ctx.reply('⛔ У вас нет доступа к этой команде.');
        }

        const targetUserId = Number(ctx.match?.[1]);
        const count = Number(ctx.match?.[2]);
        if (!targetUserId || !count) return;

        console.log(`[ADMIN] adminUserId=${userId} addBalance targetUserId=${targetUserId} count=${count}`);
        addPaidRequests(targetUserId, count);

        return ctx.reply(
            `✅ Пользователю ${targetUserId} добавлено ${count} запросов.`
        );
    });
}
export default action;
