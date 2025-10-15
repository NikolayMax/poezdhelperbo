import { Markup, Telegraf } from 'telegraf';
import { CommandsName } from '../../utils/consts';

export const Buttons = () => ({
	text: 'Привет! Тут ты сможешь оследить свой поезд или электричку',
	buttons: Markup.inlineKeyboard([
		Markup.button.callback('Начать поиск', CommandsName.Watch),
		Markup.button.callback('Баланс', CommandsName.Balance),
		Markup.button.callback('Помощь', CommandsName.Help),
	]),
});

const action = (bot: Telegraf) => {
	bot.start((ctx) => {
		// ctx.deleteMessage()
		const { text, buttons } = Buttons();
		ctx.reply(text, buttons);
	});
};
export default action;
