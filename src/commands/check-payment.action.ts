import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { checkPayment } from "../payments/tinkoff";

const action = (bot: Bot) => {
    bot.action(new RegExp(CommandsName.CheckPayment), async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }
        const paymentId = Number(ctx.match?.[1]);
        if (!paymentId) {
            console.warn(`[CHECK-PAYMENT] userId=${userId} invalid paymentId`);
            return;
        }

        try {
            const { confirmed, message } = await checkPayment(paymentId, userId);
            console.log(`[CHECK-PAYMENT] userId=${userId} paymentId=${paymentId} confirmed=${confirmed}`);

            const attachments = confirmed
                ? [Keyboard.inlineKeyboard([
                    [Keyboard.button.callback("🚂 Найти поезд", CommandsName.Watch)],
                    [Keyboard.button.callback("🚂 Мои электрички", CommandsName.MyTrains)],
                    [Keyboard.button.callback("Главное меню", CommandsName.Start)],
                ])]
                : [Keyboard.inlineKeyboard([
                    [Keyboard.button.callback("🔄 Проверить ещё раз", `check-payment:${paymentId}`)],
                    [Keyboard.button.callback("Главное меню", CommandsName.Start)],
                ])];

            ctx.reply(message, { format: 'html', attachments });
        } catch (err: any) {
            console.error(`[CHECK-PAYMENT] userId=${userId} paymentId=${paymentId} error:`, err?.message ?? err);
            ctx.reply('❌ Ошибка при проверке платежа. Попробуйте позже.');
        }
    });
}
export default action;
