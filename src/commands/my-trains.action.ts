import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { getUserTracks } from "../tracker";

const action = (bot: Bot) => {
    bot.action(CommandsName.MyTrains, async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch(() => {});
            return;
        }
        const tracks = getUserTracks(userId);

        if (tracks.length === 0) {
            ctx.reply(
                '🚂 У вас нет отслеживаемых поездов.\n\n' +
                'Найдите поезд через поиск и нажмите «Отследить место».',
                {
                    attachments: [Keyboard.inlineKeyboard([
                        [Keyboard.button.callback("🔍 Начать поиск", CommandsName.Watch)],
                        [Keyboard.button.callback("Главное меню", CommandsName.Start)],
                    ])]
                }
            );
        }

        for (const [i, t] of tracks.entries()) {
            const status = t.notified
                ? '✅ Места есть'
                : t.last_places_count != null && t.last_places_count > 0
                ? `💺 ${t.last_places_count} мест`
                : '⏳ Ожидание мест';

            const msg =
                `<b>${t.train_number}</b> — ${t.train_name}\n` +
                `📅 ${t.date}  🕒 ${t.departure_time} → ${t.arrival_time}\n` +
                `${status}`;

            const isLast = i === tracks.length - 1;
            const keyboard = Keyboard.inlineKeyboard([
                [Keyboard.button.callback(`❌ Удалить ${t.train_number}`, `remove-track:${t.id}`)],
                ...(isLast ? [[Keyboard.button.callback("Главное меню", CommandsName.Start)]] : []),
            ]);

            ctx.reply(msg, { format: 'html', attachments: [keyboard] });
        }


    });
}
export default action;
