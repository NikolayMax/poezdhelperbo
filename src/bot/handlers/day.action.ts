import { Telegraf } from 'telegraf';
import { Buttons } from './watch.action';
import { CommandsName } from '../../utils/consts';
import { userRedis } from '../../services/user.service';

const actionDay = (bot: Telegraf) => {
	bot.action(new RegExp(CommandsName.Day), async (ctx) => {
		const userId = ctx.from.id;
		const userData = await userRedis.getData(userId);

		userData.selectedDay = Number(ctx.match[1]);
		await userRedis.setData(userId, userData);

		const { text, buttons } = await Buttons(ctx);
		ctx.reply(text, buttons);
	});
};

export default actionDay;
