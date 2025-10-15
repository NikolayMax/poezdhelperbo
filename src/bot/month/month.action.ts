import { Markup, Context } from 'telegraf';
import { userRedis } from '../../services/user.service';
import { getLastDayOfMonth } from '../../utils/lib';
import { Action } from '../../decorator/action.decorator';
import messageService from '../../services/message-template.service';
import { MONTH_ACTION } from './consts';

class MonthAction {
	@Action(new RegExp(MONTH_ACTION))
	async action(ctx: Context) {
		if (!ctx.from) {
			return ctx.reply(messageService.userDataError());
		}
		if (!('match' in ctx)) {
			return ctx.reply('Error: match not found in ctx');
		}
		const userId = ctx.from.id;
		const userData = await userRedis.getData(userId);
		userData.selectedMonth = Number((ctx.match as RegExp[])[1]);
		await userRedis.setData(userId, userData);

		const { text, buttons } = await this.buttons(ctx);

		ctx.reply(text, buttons);
	}
	async buttons(ctx: Context) {
		const days = [];
		const now = new Date();
		if (!ctx.from) {
			return {
				text: 'Не удалось получить информацию о пользователе',
				buttons: Markup.inlineKeyboard([]),
			};
		}

		const currentMonth = now.getMonth();
		const currentDay = now.getDate();
		const userId = ctx.from.id;
		const { selectedYear, selectedMonth } = await userRedis.getData(userId);
		const endDay = getLastDayOfMonth(selectedYear, selectedMonth);

		for (let i = currentMonth === selectedMonth ? currentDay : 1; i <= endDay; i++) {
			days.push(Markup.button.callback(`${i}`, `day:${i}`));
		}

		return {
			text: 'Выберите день: ',
			buttons: Markup.inlineKeyboard(days, { columns: 7 }),
		};
	}
}
const monthAction = new MonthAction();
export default monthAction;
