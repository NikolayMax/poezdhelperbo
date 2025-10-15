import { Telegraf } from 'telegraf';
import { CommandsName } from '../../utils/consts';
import { Buttons } from './start.command';

const action = (bot: Telegraf) => {
	bot.action(CommandsName.Start, (ctx) => {
		const { text, buttons } = Buttons();
		ctx.reply(text, buttons);
	});
};
export default action;
