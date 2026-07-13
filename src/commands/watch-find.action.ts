import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import axios from "axios";
import { userRedis } from "../redis";
import { ITrain } from "../types/traine.interface";
import { isTrainTracked } from "../tracker";

const action = (bot: Bot) => {
    bot.action(CommandsName.WatchFind, async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }
        const userData = await userRedis.getData(userId);
        userData.cities = [];
        const {cityFrom, cityTo, selectedYear, selectedMonth, selectedDay} = userData;

        if(!cityFrom || !cityTo)
            return ctx.reply('Не выбраны города или город');

        ctx.reply('🔍 Ищу поезда...');

        const day = selectedDay;
        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        try {
            const {data} = await axios.get<{data: ITrain[]}>(
                `https://api.svrpk.ru/api/v1/trains/find-by/stations/${cityFrom.id}/${cityTo.id}?date=${dateStr}&count=20`,
                { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
            );

            const lastochki = data.data.filter(t => t.rail_type === 'Комфортный');

            if (lastochki.length === 0) {
                return ctx.reply('😕 Ласточки не найдены. Попробуйте другие даты или направления.');
            }

            userData.lastTrains = lastochki.reduce((acc: Record<number, ITrain>, t) => {
                acc[t.id] = t;
                return acc;
            }, {});
            userData.lastSearchDate = dateStr;
            userData.lastSearchFromId = cityFrom.id;
            userData.lastSearchToId = cityTo.id;
            await userRedis.setData(userId, userData);

            for (const train of lastochki) {
                const [dh, dm] = train.departure_time.split(':').map(Number) as [number, number];
                const [ah, am] = train.arrival_time.split(':').map(Number) as [number, number];
                let diff = (ah * 60 + am) - (dh * 60 + dm);
                if (diff < 0) diff += 24 * 60;
                const travelTime = `${Math.floor(diff / 60)}ч ${diff % 60}м`;

                const msg =
                    `🚂 <b>${train.train_number}</b> — ${train.name}\n` +
                    `🕒 ${train.departure_time} → ${train.arrival_time} (${travelTime})\n` +
                    `💺 ${train.places_count != null ? `${train.places_count} мест` : '❌ Мест нет'}`;

                const alreadyTracked = isTrainTracked(userId, train.id, dateStr, cityFrom.id, cityTo.id);
                const keyboard = Keyboard.inlineKeyboard(
                    alreadyTracked
                        ? [[Keyboard.button.callback("✅ Уже отслеживается", "noop")]]
                        : [[Keyboard.button.callback("Отследить место", `watch-place:${train.id}`)]]
                );

                ctx.reply(msg, { format: 'html', attachments: [keyboard] });
            }
            return;
        } catch (error) {
            console.error(`[WATCH-FIND] userId=${userId} date=${dateStr}:`, error);
            return ctx.reply('❌ Не удалось получить данные. Попробуйте позже.');
        }
    })
}

export default action;
