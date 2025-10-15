import { Markup, Telegraf, Context } from 'telegraf';
import { CommandsName } from '../../utils/consts';
import { renderSelectDate, renderSelectFromCity, renderSelectToCity } from '../../utils/lib';
import { userRedis } from '../../services/user.service';

export const Buttons = async (ctx: Context) => {
	if (!ctx.from) {
		return {
			text: 'Не удалось получить информацию о пользователе',
			buttons: Markup.inlineKeyboard([]),
		};
	}
	const userId = ctx.from.id;
	const userData = await userRedis.getData(userId);

	return {
		text: 'Параметры поиска: ',
		buttons: Markup.inlineKeyboard([
			[Markup.button.callback(renderSelectDate(userData), CommandsName.WatchDate)],
			[Markup.button.callback(renderSelectFromCity(userData), CommandsName.CityFrom)],
			[Markup.button.callback(renderSelectToCity(userData), CommandsName.CityTo)],
			[Markup.button.callback('НАЙТИ', CommandsName.WatchFind)],
			[Markup.button.callback('Главное меню', CommandsName.Start)],
		]),
	};
};
const action = (bot: Telegraf) => {
	bot.action(CommandsName.Watch, async (ctx) => {
		const { text, buttons } = await Buttons(ctx);

		ctx.reply(text, buttons);
	});
};
export default action;
