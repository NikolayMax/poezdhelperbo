import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { Buttons } from "../command.button";
import type { IAppDependencies } from "../container";
import { getReferralCode, getReferralStats, isSubscribedToChannel, updateSubscriptionStatus, applyReferralBonus } from "../referral";

const action = (bot: Bot, deps: IAppDependencies) => {
    bot.action('referral-info', async (ctx) => {
        const user = ctx.user;
        if (!user) return;
        const userId = user.user_id;

        const code = getReferralCode(userId);
        const stats = getReferralStats(userId);
        const botName = ctx.botInfo?.username;
        const link = botName ? `https://max.ru/${botName}?start=ref_${code}` : `реферальный код: ${code}`;

        const keyboard = Keyboard.inlineKeyboard([
            [Keyboard.button.callback("💳 Купить запросы", CommandsName.Buy)],
            [Keyboard.button.callback("Главное меню", CommandsName.Start)],
        ]);

        let text =
            `🤝 <b>Приглашайте друзей!</b>\n\n` +
            `Отправьте друзьям эту ссылку:\n<code>${link}</code>\n\n` +
            `После регистрации по вашей ссылке вы получите <b>+3 запроса</b>!\n\n` +
            `📊 Приглашено: <b>${stats.total}</b>`;

        if (process.env.CHANNEL_ID) {
            text += `\n\n📢 Друг также должен подписаться на наш канал, чтобы бонус был зачислен.`;
        }

        ctx.reply(text, { format: 'html', attachments: [keyboard] });
    });

    bot.action('check-subscription', async (ctx) => {
        const user = ctx.user;
        if (!user) return;
        const userId = user.user_id;

        const channelId = process.env.CHANNEL_ID;
        console.log(`[CHECK-SUBSCRIPTION] userId=${userId} channelId=${channelId} start`);
        if (!channelId) {
            const { text, attachments } = await Buttons[CommandsName.Start](ctx);
            ctx.reply(text, { attachments });
            return;
        }

        try {
            const subscribed = await isSubscribedToChannel(userId, channelId, bot);
            console.log(`[CHECK-SUBSCRIPTION] userId=${userId} subscribed=${subscribed}`);
            updateSubscriptionStatus(userId, subscribed ? 1 : 0);

            if (subscribed) {
                let resultText = `✅ Спасибо за подписку!\n\n`;

                const userData = await deps.redis.getData(userId);
                const referrerId = userData.pendingReferral;
                if (referrerId && referrerId !== userId && applyReferralBonus(referrerId, userId)) {
                    console.log(`[CHECK-SUBSCRIPTION] userId=${userId} referralBonus=applied referrerId=${referrerId}`);
                    resultText += `🎉 Вы и ваш друг получили +3 запроса за реферала!\n\n`;
                    userData.pendingReferral = undefined;
                    await deps.redis.setData(userId, userData);
                }

                const { text, attachments } = await Buttons[CommandsName.Start](ctx);
                ctx.reply(resultText + text, { attachments });
            } else {
                const { text, attachments } = Buttons.SubscriptionPrompt();
                ctx.reply(text, { attachments });
            }
        } catch (err: any) {
            console.error(`[CHECK-SUBSCRIPTION] userId=${userId} error:`, err?.message ?? err);
            ctx.reply('❌ Ошибка проверки подписки. Попробуйте позже.');
        }
    });
}

export default action;
