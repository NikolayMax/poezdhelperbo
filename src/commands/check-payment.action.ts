import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { checkPayment } from "../payments/tinkoff";

const action = (bot: Bot) => {
    bot.action(new RegExp(CommandsName.CheckPayment), async (ctx) => {
        const userId = ctx.user!.user_id;
        const paymentId = Number(ctx.match?.[1]);
        if (!paymentId) return;

        const { confirmed, message } = await checkPayment(paymentId, userId);

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
    });
}
export default action;
