import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { getUserTracks } from "../tracker";

const action = (bot: Bot) => {
    bot.action(CommandsName.MyTrains, async (ctx) => {
        const userId = ctx.user!.user_id;
        const tracks = getUserTracks(userId);

        if (tracks.length === 0) {
            return ctx.reply(
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

        const keyboard = Keyboard.inlineKeyboard(
            tracks.map((t) => [
                Keyboard.button.callback(
                    `❌ ${t.train_number} — ${t.departure_time}`,
                    `remove-track:${t.id}`
                ),
            ])
        );

        let msg = `🚂 <b>Ваши отслеживаемые поезда (${tracks.length})</b>\n\n`;
        for (const t of tracks) {
            const status = t.notified
                ? '✅ Места есть'
                : t.last_places_count != null && t.last_places_count > 0
                ? `💺 ${t.last_places_count} мест`
                : '⏳ Ожидание мест';
            msg +=
                `<b>${t.train_number}</b> — ${t.train_name}\n` +
                `📅 ${t.date}  🕒 ${t.departure_time} → ${t.arrival_time}\n` +
                `${status}\n\n`;
        }

        ctx.reply(msg, {
            format: 'html',
            attachments: [keyboard],
        });
    });
}
export default action;
