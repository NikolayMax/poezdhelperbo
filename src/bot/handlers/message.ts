import { Markup, Telegraf } from 'telegraf';
import axios from 'axios';
import { userRedis } from '../../services/user.service';
import { ICity } from '../../types/svrpk-train.interface';
import messageService from '../../services/message-template.service';

const action = (bot: Telegraf) => {
	bot.on('message', async (ctx) => {
		const userId = ctx.from.id;
		const userData = await userRedis.getData(userId);

		if (!('text' in ctx.message)) {
			return ctx.reply(messageService.messageEmpty());
		}

		axios
			.get<{ data: ICity[] }>(`https://api.svrpk.ru/api/v1/suggest/stations?name=${ctx.message.text}`)
			.then(async ({ data }) => {
				const cities = data.data.map((city) => {
					return Markup.button.callback(city.name, `select-city:${city.slug}`);
				});
				userData.cities = data.data;
				await userRedis.setData(userId, userData);
				ctx.deleteMessage();
				if (cities.length < 1) {
					return ctx.reply(messageService.messageCityNotFound());
				}
				ctx.reply('✅ Найдено несколько станций:', Markup.inlineKeyboard(cities, { columns: 1 }));
			})
			.catch((error) => {
				console.log(error);
			});
	});
};
export default action;
