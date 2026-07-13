import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName, PACKAGES } from "../consts";
import { createPayment } from "../payments/tinkoff";

const action = (bot: Bot) => {
    for (const pkg of PACKAGES) {
        bot.action(`buy-package:${pkg.key}`, async (ctx) => {
            const userId = ctx.user?.user_id;
            if (!userId) {
                await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch(() => {});
                return;
            }

            try {
                const { paymentUrl, paymentId } = await createPayment(userId, pkg.key);

                const keyboard = Keyboard.inlineKeyboard([
                    [Keyboard.button.link("💳 Оплатить", paymentUrl)],
                    [Keyboard.button.callback("🔄 Я оплатил", `check-payment:${paymentId}`)],
                    [Keyboard.button.callback("В меню", CommandsName.Buy)],
                    [Keyboard.button.callback("Главное меню", CommandsName.Start)]
                ]);

                ctx.reply(
                    `📦 <b>${pkg.label}</b>\n` +
                    `💰 ${pkg.price}₽\n\n` +
                    `Нажмите «Оплатить», чтобы перейти к оплате.\n` +
                    `После оплаты нажмите «Я оплатил».`,
                    { format: 'html', attachments: [keyboard] }
                );
            } catch (error) {
                console.error('Ошибка создания платежа:', error);
                ctx.reply(
                    '❌ Не удалось создать платёж. Попробуйте позже.',
                    {
                        attachments: [Keyboard.inlineKeyboard([
                            [Keyboard.button.callback("В меню", CommandsName.Buy)],
                            [Keyboard.button.callback("Главное меню", CommandsName.Start)]
                        ])]
                    }
                );
            }
        });
    }
}
export default action;
