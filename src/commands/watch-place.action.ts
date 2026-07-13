import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { deductRequest } from "../balance";
import { userRedis } from "../redis";
import { addTrack } from "../tracker";

const action = (bot: Bot) => {
    bot.action(new RegExp(CommandsName.WatchPlace), async (ctx) => {
        const userId = ctx.user!.user_id;
        const trainId = Number(ctx.match?.[1]);
        if (!trainId) return;

        const userData = await userRedis.getData(userId);
        const train = userData.lastTrains?.[trainId];
        if (!train) {
            return ctx.reply('❌ Данные о поезде устарели. Выполните поиск заново.');
        }

        const deduction = deductRequest(userId);
        if (!deduction.success) {
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

        const keyboard = Keyboard.inlineKeyboard([
            [Keyboard.button.callback("🚂 Мои электрички", CommandsName.MyTrains)],
        ]);

        return ctx.reply(
            `✅ Поезд <b>${train.train_number}</b> добавлен в отслеживание!\n` +
            `Мы уведомим вас, когда появятся свободные места.`,
            { format: 'html', attachments: [keyboard] }
        );
    });
}
export default action;
