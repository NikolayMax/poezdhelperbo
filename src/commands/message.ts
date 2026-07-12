import { Keyboard, Bot } from "@maxhub/max-bot-api";
import axios from "axios";
import { CommandsName, CurrentSelectCity } from "../consts";
import { Buttons } from "../command.button";
import { userRedis } from "../redis";

const action = (bot: Bot) => {
    bot.on('message_created', async (ctx) => {
        const text = ctx.message?.body?.text;
        if (!text) return;

        const userId = ctx.message?.sender?.user_id;
        if (!userId) return;
        const userData = await userRedis.getData(userId);

        if (userData.currentSelectCity !== CurrentSelectCity.From &&
            userData.currentSelectCity !== CurrentSelectCity.To) {
            return;
        }

        try {
            const {data} = await axios.get<{data: {name: string; slug: string; id: number; entity_type_id: number}[]}>(
                `https://api.svrpk.ru/api/v1/suggest/stations?name=${encodeURIComponent(text)}`
            );

            const cities = data.data.map((city) => {
                return [Keyboard.button.callback(city.name, `select-city:${city.slug}`)]
            });

            if (cities.length === 0) {
                ctx.reply('😕 Города не найдены. Попробуйте другое название.');
                return;
            }

            userData.cities = data.data;
            await userRedis.setData(userId, userData);
            try { await ctx.deleteMessage(); } catch { void 0; }
            const result = await Buttons[CommandsName.Message]()
            ctx.reply(result.text, { attachments: [Keyboard.inlineKeyboard(cities)] });
        } catch (error) {
            console.error('Ошибка при поиске города:', error);
            ctx.reply('❌ Не удалось найти город. Попробуйте позже.');
        }
    });
}
export default action;
