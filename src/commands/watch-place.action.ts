import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { deductRequest, refundRequest } from "../balance";
import { userRedis } from "../redis";
import { addTrack } from "../tracker";
import { guardSubscription } from "../referral";

const action = (bot: Bot) => {
    bot.action(new RegExp(CommandsName.WatchPlace), async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }
        if (!await guardSubscription(ctx, userId, bot)) return;
        const trainId = Number(ctx.match?.[1]);
        if (!trainId) return;

        const userData = await userRedis.getData(userId);
        const train = userData.lastTrains?.[trainId];
        if (!train) {
            return ctx.reply('❌ Данные о поезде устарели. Выполните поиск заново.');
        }

        const deduction = deductRequest(userId);
        if (!deduction.success) {
            console.log(`[WATCH-PLACE] userId=${userId} trainId=${trainId} deduction=failed (no balance)`);
            return ctx.reply(
                '❌ Лимит запросов исчерпан.\n\n' +
                'Купить запросы — нажмите кнопку ниже.',
                {
                    attachments: [Keyboard.inlineKeyboard([
                        [Keyboard.button.callback("Купить запросы", CommandsName.Buy)]
                    ])]
                }
            );
        }

        console.log(`[WATCH-PLACE] userId=${userId} trainId=${trainId} train=${train.train_number} deduction=${deduction.source}`);
        try {
            addTrack(
                userId,
                trainId,
                train.train_number,
                train.name,
                userData.lastSearchDate!,
                train.departure_time,
                train.arrival_time,
                userData.lastSearchFromId!,
                userData.lastSearchToId!,
                train.places_count,
            );
        } catch (err: any) {
            console.error(`[WATCH-PLACE] userId=${userId} trainId=${trainId} addTrack FAILED:`, err?.message ?? err);
            refundRequest(userId, deduction.source!);
            return ctx.reply('❌ Ошибка при добавлении поезда в отслеживание. Запрос возвращён. Попробуйте позже.');
        }

        const keyboard = Keyboard.inlineKeyboard([
            [Keyboard.button.callback("🚂 Мои электрички", CommandsName.MyTrains)],
            [Keyboard.button.callback("Главное меню", CommandsName.Start)],
        ]);

        return ctx.reply(
            `✅ Поезд <b>${train.train_number}</b> добавлен в отслеживание!\n` +
            `Мы уведомим вас, когда появятся свободные места.`,
            { format: 'html', attachments: [keyboard] }
        );
    });
}
export default action;
